-- =============================================================================
-- PatronFlow Migration 005: Subscription & Billing Schema
-- Adds tables for subscription management, plans, and payment history
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Subscription status enum
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active', 
    'past_due',
    'cancelled',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- Payment provider enum
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM (
    'stripe',
    'razorpay',
    'paypal'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- Plans table (configurable pricing)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly_inr INTEGER NOT NULL DEFAULT 0,
  price_monthly_usd INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  razorpay_plan_id TEXT,
  paypal_plan_id TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Subscriptions table
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status subscription_status NOT NULL DEFAULT 'trialing',
  provider payment_provider,
  provider_subscription_id TEXT,
  provider_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id)
);

-- -----------------------------------------------------------------------------
-- Payments table (transaction history)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  provider_payment_id TEXT,
  provider_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  invoice_url TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Indexes for billing queries
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id 
  ON public.subscriptions(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at 
  ON public.subscriptions(trial_ends_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider 
  ON public.subscriptions(provider);

CREATE INDEX IF NOT EXISTS idx_payments_subscription_id 
  ON public.payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id 
  ON public.payments(provider_payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_created_at 
  ON public.payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plans_is_active 
  ON public.plans(is_active);

-- -----------------------------------------------------------------------------
-- Enable RLS on billing tables
-- -----------------------------------------------------------------------------

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------------------------------

-- Plans: everyone can read active plans
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Subscriptions: owners can view their own subscription
CREATE POLICY "Owners can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Subscriptions: service role only for inserts/updates (via webhooks)
-- No INSERT/UPDATE policy for regular users - handled by server

-- Payments: owners can view their own payment history
CREATE POLICY "Owners can view own payments"
  ON public.payments FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions 
      WHERE restaurant_id IN (
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- Update trigger for subscriptions
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_subscription_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscription_updated_at ON public.subscriptions;

CREATE TRIGGER subscription_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_timestamp();

-- -----------------------------------------------------------------------------
-- Function to create subscription on restaurant creation (for trials)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (
    restaurant_id,
    status,
    trial_ends_at,
    current_period_start,
    current_period_end
  )
  VALUES (
    NEW.id,
    'trialing',
    now() + INTERVAL '30 days',
    now(),
    now() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_restaurant_created_subscription ON public.restaurants;

CREATE TRIGGER on_restaurant_created_subscription
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_trial_subscription();

-- -----------------------------------------------------------------------------
-- Insert default plan (pricing to be configured later)
-- -----------------------------------------------------------------------------

INSERT INTO public.plans (name, description, price_monthly_inr, price_monthly_usd, features)
VALUES (
  'PatronFlow Pro',
  'All-inclusive plan with unlimited features',
  0,
  0,
  '["Unlimited feedback collection", "Customer database", "Loyalty programs", "Event management", "QR code analytics", "Recovery workflows", "Email notifications"]'::jsonb
)
ON CONFLICT DO NOTHING;
