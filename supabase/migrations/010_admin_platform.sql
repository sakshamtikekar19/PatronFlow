-- =============================================================================
-- PatronFlow Migration 010: Platform admin (super_admin) support
-- =============================================================================

-- Restaurant suspension
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_restaurants_is_suspended
  ON public.restaurants(is_suspended);

CREATE INDEX IF NOT EXISTS idx_restaurants_last_active_at
  ON public.restaurants(last_active_at DESC);

-- Support requests (contact, bugs, feature requests)
DO $$ BEGIN
  CREATE TYPE support_request_type AS ENUM ('contact', 'bug', 'feature');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_request_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type support_request_type NOT NULL DEFAULT 'contact',
  status support_request_status NOT NULL DEFAULT 'open',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_status
  ON public.support_requests(status);

CREATE INDEX IF NOT EXISTS idx_support_requests_type
  ON public.support_requests(type);

CREATE INDEX IF NOT EXISTS idx_support_requests_created_at
  ON public.support_requests(created_at DESC);

-- Platform audit log (service role writes only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON public.audit_logs(action);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated users — admin uses service role only
