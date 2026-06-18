-- =============================================================================
-- PatronFlow Migration 003: Customer Delete Policy
-- Allows restaurant owners to delete their own customers
-- =============================================================================

DROP POLICY IF EXISTS "Owners can delete own customers" ON public.customers;

CREATE POLICY "Owners can delete own customers"
  ON public.customers FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );
