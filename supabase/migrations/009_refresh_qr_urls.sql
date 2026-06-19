-- =============================================================================
-- PatronFlow Migration 009: Refresh table_qrs URLs to patronflow.co
-- Replaces the host on stored QR links (e.g. old vercel.app / localhost) while
-- keeping /review/[slug] paths and ?table= query params unchanged.
-- =============================================================================

-- Preview rows that will change (run alone first if you want to verify):
-- SELECT
--   id,
--   table_name,
--   qr_url AS old_url,
--   'https://patronflow.co' || regexp_replace(qr_url, '^https?://[^/]+', '') AS new_url
-- FROM public.table_qrs
-- WHERE qr_url !~ '^https://patronflow\.co/';

UPDATE public.table_qrs
SET qr_url = 'https://patronflow.co' || regexp_replace(qr_url, '^https?://[^/]+', '')
WHERE qr_url !~ '^https://patronflow\.co/';
