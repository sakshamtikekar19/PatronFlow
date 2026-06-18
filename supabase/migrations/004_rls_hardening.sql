-- =============================================================================
-- PatronFlow Migration 004: RLS Hardening
-- Tightens Row Level Security policies for production
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Replace overly permissive public restaurant read policy
-- The old policy allowed anyone to read ALL restaurant data.
-- New policy: only allow reading specific restaurants by ID or slug (via admin client)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view restaurants by id" ON public.restaurants;

-- Public pages use the admin client anyway, so we remove the public SELECT policy.
-- If needed, add a narrow policy for specific use cases:
-- CREATE POLICY "Public can view restaurant by slug"
--   ON public.restaurants FOR SELECT
--   USING (slug IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 2. Add DELETE policy for feedback (owners can delete their own feedback)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Owners can delete own feedback" ON public.feedback;

CREATE POLICY "Owners can delete own feedback"
  ON public.feedback FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Add UPDATE policy for table_qrs (owners can update their own QR codes)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Owners can update own table qrs" ON public.table_qrs;

CREATE POLICY "Owners can update own table qrs"
  ON public.table_qrs FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4. Add unique constraint on event_rsvps to prevent duplicate RSVPs
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_rsvps_event_id_phone_key'
  ) THEN
    ALTER TABLE public.event_rsvps 
    ADD CONSTRAINT event_rsvps_event_id_phone_key UNIQUE (event_id, phone);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. Add WITH CHECK constraints to ensure customer_id belongs to restaurant_id
-- This prevents cross-tenant data corruption even if UUIDs are known
-- -----------------------------------------------------------------------------

-- For feedback: ensure customer belongs to the same restaurant
DROP POLICY IF EXISTS "Owners can insert own feedback" ON public.feedback;

CREATE POLICY "Owners can insert own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
    AND customer_id IN (
      SELECT id FROM public.customers WHERE restaurant_id = feedback.restaurant_id
    )
  );

-- For loyalty_transactions: ensure customer belongs to the same restaurant
DROP POLICY IF EXISTS "Owners manage own loyalty transactions" ON public.loyalty_transactions;

CREATE POLICY "Owners manage own loyalty transactions"
  ON public.loyalty_transactions FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
    AND customer_id IN (
      SELECT id FROM public.customers WHERE restaurant_id = loyalty_transactions.restaurant_id
    )
  );

-- For customer_visits: ensure customer belongs to the same restaurant
DROP POLICY IF EXISTS "Owners manage own customer visits" ON public.customer_visits;

CREATE POLICY "Owners manage own customer visits"
  ON public.customer_visits FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
    AND customer_id IN (
      SELECT id FROM public.customers WHERE restaurant_id = customer_visits.restaurant_id
    )
  );
