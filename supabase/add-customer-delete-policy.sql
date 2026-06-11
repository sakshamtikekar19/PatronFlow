-- =============================================================================
-- PatronFlow — allow owners to delete their own customers
-- Run ONCE in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe & idempotent: re-running it will not duplicate or break anything.
--
-- The customers table had select/insert/update policies but no DELETE policy,
-- so RLS silently blocked deletes. This adds it, scoped to restaurants owned by
-- the current user. Child rows (feedback, customer_visits, loyalty_transactions)
-- are removed automatically via `on delete cascade`.
-- =============================================================================

drop policy if exists "Owners can delete own customers" on public.customers;

create policy "Owners can delete own customers"
  on public.customers for delete
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );
