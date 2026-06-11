-- =============================================================================
-- PatronFlow — SEO-friendly slug migration
-- Run ONCE in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe & idempotent: re-running it will not duplicate or break anything.
-- =============================================================================

-- 1. Add the slug columns (nullable for now so the backfill can run).
alter table public.restaurants add column if not exists slug text;
alter table public.events      add column if not exists slug text;

-- 2. Backfill restaurant slugs from the restaurant name, with -2, -3, …
--    suffixes on collision so every slug is unique.
do $$
declare
  r    record;
  base text;
  cand text;
  n    int;
begin
  for r in
    select id, name from public.restaurants
    where slug is null or slug = ''
  loop
    base := trim(both '-' from
      regexp_replace(lower(coalesce(r.name, 'restaurant')), '[^a-z0-9]+', '-', 'g'));
    if base = '' then base := 'restaurant'; end if;

    cand := base;
    n := 2;
    while exists (select 1 from public.restaurants where slug = cand) loop
      cand := base || '-' || n;
      n := n + 1;
    end loop;

    update public.restaurants set slug = cand where id = r.id;
  end loop;
end $$;

-- 3. Backfill event slugs from the event title (globally unique, since the
--    public URL is /events/[slug] with no restaurant in the path).
do $$
declare
  r    record;
  base text;
  cand text;
  n    int;
begin
  for r in
    select id, title from public.events
    where slug is null or slug = ''
  loop
    base := trim(both '-' from
      regexp_replace(lower(coalesce(r.title, 'event')), '[^a-z0-9]+', '-', 'g'));
    if base = '' then base := 'event'; end if;

    cand := base;
    n := 2;
    while exists (select 1 from public.events where slug = cand) loop
      cand := base || '-' || n;
      n := n + 1;
    end loop;

    update public.events set slug = cand where id = r.id;
  end loop;
end $$;

-- 4. Enforce uniqueness going forward (app also guarantees this, but the DB is
--    the source of truth). Multiple NULLs are allowed by a unique index, and
--    after the backfill there should be none.
create unique index if not exists restaurants_slug_key on public.restaurants (slug);
create unique index if not exists events_slug_key      on public.events (slug);
