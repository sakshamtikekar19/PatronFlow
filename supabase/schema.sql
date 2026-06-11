-- PatronFlow Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom enum types
create type feedback_category as enum ('Food', 'Service', 'Ambience', 'Staff', 'Other');
create type feedback_status as enum ('pending', 'resolved');
-- Phase 2 enums
create type recovery_status as enum ('pending', 'contacted', 'resolved');
create type loyalty_transaction_type as enum ('earned', 'redeemed', 'adjusted');
create type event_status as enum ('draft', 'published', 'completed');

-- Restaurants table
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  logo text,
  google_review_url text,
  cuisine_type text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique(owner_id)
);

-- Customers table
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  birthday date,
  created_at timestamptz not null default now(),
  unique(restaurant_id, phone)
);

-- Feedback table
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  category feedback_category not null default 'Other',
  status feedback_status not null default 'pending',
  -- Source tracking: which table/QR generated this feedback, and whether the
  -- guest clicked through to leave a Google review.
  table_name text,
  source text,
  review_clicked boolean not null default false,
  -- Phase 2: guest recovery workflow (independent of the `status` field used
  -- by general feedback management).
  recovery_status recovery_status not null default 'pending',
  recovery_notes text,
  created_at timestamptz not null default now()
);

-- Table-specific QR codes
create table public.table_qrs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_name text not null,
  qr_url text not null,
  created_at timestamptz not null default now(),
  unique(restaurant_id, table_name)
);

-- ============================================================
-- Phase 2 tables
-- ============================================================

-- Customer visits (explicit visit tracking, one row per visit)
create table public.customer_visits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  visit_date timestamptz not null default now(),
  table_name text,
  source text,
  created_at timestamptz not null default now()
);

-- Loyalty point transactions
create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  points integer not null,
  transaction_type loyalty_transaction_type not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Loyalty rewards catalogue
create table public.loyalty_rules (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  reward_name text not null,
  points_required integer not null check (points_required >= 0),
  reward_description text,
  created_at timestamptz not null default now()
);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  event_date timestamptz,
  cover_image text,
  status event_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- Event RSVPs
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  attended boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_customers_restaurant_id on public.customers(restaurant_id);
create index idx_customers_phone on public.customers(phone);
create index idx_feedback_restaurant_id on public.feedback(restaurant_id);
create index idx_feedback_customer_id on public.feedback(customer_id);
create index idx_feedback_created_at on public.feedback(created_at desc);
create index idx_feedback_status on public.feedback(status);
create index idx_feedback_table_name on public.feedback(table_name);
create index idx_restaurants_owner_id on public.restaurants(owner_id);
create index idx_table_qrs_restaurant_id on public.table_qrs(restaurant_id);
-- Phase 2 indexes
create index idx_customer_visits_restaurant_id on public.customer_visits(restaurant_id);
create index idx_customer_visits_customer_id on public.customer_visits(customer_id);
create index idx_customer_visits_visit_date on public.customer_visits(visit_date desc);
create index idx_loyalty_transactions_restaurant_id on public.loyalty_transactions(restaurant_id);
create index idx_loyalty_transactions_customer_id on public.loyalty_transactions(customer_id);
create index idx_loyalty_rules_restaurant_id on public.loyalty_rules(restaurant_id);
create index idx_events_restaurant_id on public.events(restaurant_id);
create index idx_events_status on public.events(status);
create index idx_event_rsvps_event_id on public.event_rsvps(event_id);
create index idx_feedback_recovery_status on public.feedback(recovery_status);

-- Auto-provision restaurant on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.restaurants (owner_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'restaurant_name', 'My Restaurant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.restaurants enable row level security;
alter table public.customers enable row level security;
alter table public.feedback enable row level security;
alter table public.table_qrs enable row level security;
alter table public.customer_visits enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.loyalty_rules enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Restaurants policies: owners can read/update their own restaurant
create policy "Owners can view own restaurant"
  on public.restaurants for select
  using (auth.uid() = owner_id);

create policy "Owners can update own restaurant"
  on public.restaurants for update
  using (auth.uid() = owner_id);

-- Customers policies: owners can manage customers for their restaurant
create policy "Owners can view own customers"
  on public.customers for select
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can insert own customers"
  on public.customers for insert
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can update own customers"
  on public.customers for update
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Feedback policies: owners can manage feedback for their restaurant
create policy "Owners can view own feedback"
  on public.feedback for select
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can insert own feedback"
  on public.feedback for insert
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can update own feedback"
  on public.feedback for update
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Public read access for restaurant info (needed for review page)
create policy "Public can view restaurants by id"
  on public.restaurants for select
  using (true);

-- Table QR policies: owners manage their own table QRs
create policy "Owners can view own table qrs"
  on public.table_qrs for select
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can insert own table qrs"
  on public.table_qrs for insert
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "Owners can delete own table qrs"
  on public.table_qrs for delete
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- ============================================================
-- Phase 2 RLS policies (owner-scoped). Public event pages and RSVP
-- submission are handled server-side with the service-role key, matching
-- the existing /r/[restaurantId] review flow.
-- ============================================================

-- Helper note: each policy scopes rows to restaurants owned by auth.uid().

-- customer_visits
create policy "Owners manage own customer visits"
  on public.customer_visits for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
  with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));

-- loyalty_transactions
create policy "Owners manage own loyalty transactions"
  on public.loyalty_transactions for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
  with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));

-- loyalty_rules
create policy "Owners manage own loyalty rules"
  on public.loyalty_rules for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
  with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));

-- events
create policy "Owners manage own events"
  on public.events for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
  with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));

-- event_rsvps: owners can read/manage RSVPs for their own events
create policy "Owners manage own event rsvps"
  on public.event_rsvps for all
  using (
    event_id in (
      select e.id from public.events e
      join public.restaurants r on r.id = e.restaurant_id
      where r.owner_id = auth.uid()
    )
  )
  with check (
    event_id in (
      select e.id from public.events e
      join public.restaurants r on r.id = e.restaurant_id
      where r.owner_id = auth.uid()
    )
  );

-- Storage bucket for restaurant logos (public read).
-- Uploads are performed server-side with the service-role key, so no
-- additional storage RLS policies are required for writes.
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;
