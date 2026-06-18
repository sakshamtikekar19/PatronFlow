-- =============================================================================
-- PatronFlow Migration 007: Secure subscription_overview view
-- Uses security_invoker and blocks public API access (admin / SQL editor only)
-- =============================================================================

CREATE OR REPLACE VIEW public.subscription_overview
WITH (security_invoker = true)
AS
SELECT
  s.id,
  r.name AS restaurant_name,
  r.slug AS restaurant_slug,
  u.email AS owner_email,
  s.restaurant_id,
  p.name AS plan_name,
  s.status,
  s.provider,
  s.trial_ends_at,
  CASE
    WHEN s.status = 'trialing' AND s.trial_ends_at IS NOT NULL THEN
      GREATEST(0, EXTRACT(DAY FROM (s.trial_ends_at - now()))::integer)
    ELSE NULL
  END AS trial_days_remaining,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.cancelled_at,
  s.provider_subscription_id,
  s.provider_customer_id,
  s.created_at,
  s.updated_at
FROM public.subscriptions s
JOIN public.restaurants r ON r.id = s.restaurant_id
LEFT JOIN auth.users u ON u.id = r.owner_id
LEFT JOIN public.plans p ON p.id = s.plan_id;

COMMENT ON VIEW public.subscription_overview IS
  'Admin-only readable subscription list. Not exposed via Data API to app users.';

-- Remove from Supabase Data API (anon/authenticated). Dashboard uses postgres role.
REVOKE ALL ON public.subscription_overview FROM PUBLIC;
REVOKE ALL ON public.subscription_overview FROM anon, authenticated;
GRANT SELECT ON public.subscription_overview TO service_role;
