# PatronFlow Setup Guide

Follow these steps to get PatronFlow running locally.

## Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account (free tier works)

## 1. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose a name (e.g. `patronflow`), set a database password, and select a region
4. Wait for the project to finish provisioning (~2 minutes)

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
4. Paste into the SQL editor and click **Run**
5. You should see "Success. No rows returned"

This also creates a public storage bucket named `logos` used for restaurant logo uploads.

> Already ran the schema before? Just run this snippet once to add the logo bucket:
> ```sql
> insert into storage.buckets (id, name, public)
> values ('logos', 'logos', true)
> on conflict (id) do nothing;
> ```

> Upgrading an existing database for QR Management + onboarding? Run this migration once:
> ```sql
> -- Onboarding columns on restaurants
> alter table public.restaurants
>   add column if not exists cuisine_type text,
>   add column if not exists onboarded boolean not null default false;
>
> -- Mark existing restaurants as already onboarded so they skip the wizard
> update public.restaurants set onboarded = true where onboarded = false;
>
> -- Source tracking columns on feedback
> alter table public.feedback
>   add column if not exists table_name text,
>   add column if not exists source text,
>   add column if not exists review_clicked boolean not null default false;
>
> create index if not exists idx_feedback_table_name on public.feedback(table_name);
>
> -- Table-specific QR codes
> create table if not exists public.table_qrs (
>   id uuid primary key default gen_random_uuid(),
>   restaurant_id uuid not null references public.restaurants(id) on delete cascade,
>   table_name text not null,
>   qr_url text not null,
>   created_at timestamptz not null default now(),
>   unique(restaurant_id, table_name)
> );
>
> create index if not exists idx_table_qrs_restaurant_id on public.table_qrs(restaurant_id);
>
> alter table public.table_qrs enable row level security;
>
> create policy "Owners can view own table qrs"
>   on public.table_qrs for select
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
> create policy "Owners can insert own table qrs"
>   on public.table_qrs for insert
>   with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
> create policy "Owners can delete own table qrs"
>   on public.table_qrs for delete
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
> ```

> Upgrading an existing database for **Phase 2** (Guest Recovery, Loyalty, Visits, Events)? Run this migration once. It is safe to re-run.
> ```sql
> -- Enums (guarded so re-running doesn't error)
> do $$ begin
>   create type recovery_status as enum ('pending', 'contacted', 'resolved');
> exception when duplicate_object then null; end $$;
> do $$ begin
>   create type loyalty_transaction_type as enum ('earned', 'redeemed', 'adjusted');
> exception when duplicate_object then null; end $$;
> do $$ begin
>   create type event_status as enum ('draft', 'published', 'completed');
> exception when duplicate_object then null; end $$;
>
> -- Guest recovery columns on feedback
> alter table public.feedback
>   add column if not exists recovery_status recovery_status not null default 'pending',
>   add column if not exists recovery_notes text;
> create index if not exists idx_feedback_recovery_status on public.feedback(recovery_status);
>
> -- Customer visits
> create table if not exists public.customer_visits (
>   id uuid primary key default gen_random_uuid(),
>   restaurant_id uuid not null references public.restaurants(id) on delete cascade,
>   customer_id uuid not null references public.customers(id) on delete cascade,
>   visit_date timestamptz not null default now(),
>   table_name text,
>   source text,
>   created_at timestamptz not null default now()
> );
> create index if not exists idx_customer_visits_restaurant_id on public.customer_visits(restaurant_id);
> create index if not exists idx_customer_visits_customer_id on public.customer_visits(customer_id);
> create index if not exists idx_customer_visits_visit_date on public.customer_visits(visit_date desc);
>
> -- Loyalty
> create table if not exists public.loyalty_transactions (
>   id uuid primary key default gen_random_uuid(),
>   restaurant_id uuid not null references public.restaurants(id) on delete cascade,
>   customer_id uuid not null references public.customers(id) on delete cascade,
>   points integer not null,
>   transaction_type loyalty_transaction_type not null,
>   notes text,
>   created_at timestamptz not null default now()
> );
> create table if not exists public.loyalty_rules (
>   id uuid primary key default gen_random_uuid(),
>   restaurant_id uuid not null references public.restaurants(id) on delete cascade,
>   reward_name text not null,
>   points_required integer not null check (points_required >= 0),
>   reward_description text,
>   created_at timestamptz not null default now()
> );
> create index if not exists idx_loyalty_transactions_restaurant_id on public.loyalty_transactions(restaurant_id);
> create index if not exists idx_loyalty_transactions_customer_id on public.loyalty_transactions(customer_id);
> create index if not exists idx_loyalty_rules_restaurant_id on public.loyalty_rules(restaurant_id);
>
> -- Events
> create table if not exists public.events (
>   id uuid primary key default gen_random_uuid(),
>   restaurant_id uuid not null references public.restaurants(id) on delete cascade,
>   title text not null,
>   description text,
>   event_date timestamptz,
>   cover_image text,
>   status event_status not null default 'draft',
>   created_at timestamptz not null default now()
> );
> create table if not exists public.event_rsvps (
>   id uuid primary key default gen_random_uuid(),
>   event_id uuid not null references public.events(id) on delete cascade,
>   name text not null,
>   phone text not null,
>   email text,
>   attended boolean not null default false,
>   created_at timestamptz not null default now()
> );
> create index if not exists idx_events_restaurant_id on public.events(restaurant_id);
> create index if not exists idx_events_status on public.events(status);
> create index if not exists idx_event_rsvps_event_id on public.event_rsvps(event_id);
>
> -- Backfill one visit per existing feedback so visit metrics are meaningful immediately
> insert into public.customer_visits (restaurant_id, customer_id, visit_date, table_name, source)
> select restaurant_id, customer_id, created_at, table_name, source from public.feedback;
>
> -- RLS
> alter table public.customer_visits enable row level security;
> alter table public.loyalty_transactions enable row level security;
> alter table public.loyalty_rules enable row level security;
> alter table public.events enable row level security;
> alter table public.event_rsvps enable row level security;
>
> drop policy if exists "Owners manage own customer visits" on public.customer_visits;
> create policy "Owners manage own customer visits" on public.customer_visits for all
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
>   with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
>
> drop policy if exists "Owners manage own loyalty transactions" on public.loyalty_transactions;
> create policy "Owners manage own loyalty transactions" on public.loyalty_transactions for all
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
>   with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
>
> drop policy if exists "Owners manage own loyalty rules" on public.loyalty_rules;
> create policy "Owners manage own loyalty rules" on public.loyalty_rules for all
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
>   with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
>
> drop policy if exists "Owners manage own events" on public.events;
> create policy "Owners manage own events" on public.events for all
>   using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()))
>   with check (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
>
> drop policy if exists "Owners manage own event rsvps" on public.event_rsvps;
> create policy "Owners manage own event rsvps" on public.event_rsvps for all
>   using (event_id in (select e.id from public.events e join public.restaurants r on r.id = e.restaurant_id where r.owner_id = auth.uid()))
>   with check (event_id in (select e.id from public.events e join public.restaurants r on r.id = e.restaurant_id where r.owner_id = auth.uid()));
> ```

## 3. Configure Authentication

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`

4. Go to **Authentication** → **Providers** → **Email**
5. Ensure Email provider is enabled
6. For development, you can disable "Confirm email" under Email settings

## 4. Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 5. Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 6. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 7. Create Your Account

1. Go to `/signup`
2. Enter your restaurant name, email, and password
3. A restaurant record is automatically created for you
4. You'll be redirected to the dashboard

## Public Review Page

Each restaurant gets a public review URL:
```
http://localhost:3000/r/{restaurant-id}
```

Find your restaurant ID in the dashboard settings page or Supabase table editor.

Print this URL as a QR code for customers to scan and leave feedback.

## Production Deployment

When deploying to Vercel or similar:

1. Add all environment variables from `.env.local`
2. Update Supabase Auth redirect URLs with your production domain
3. Set `NEXT_PUBLIC_APP_URL` to your production URL

## Troubleshooting

**"Invalid API key"** — Double-check your `.env.local` values match Supabase dashboard.

**Signup doesn't create restaurant** — Re-run `schema.sql` to ensure the trigger exists.

**Auth redirect fails** — Verify redirect URLs in Supabase Auth settings.

**RLS errors** — Ensure you're logged in and the restaurant `owner_id` matches your user ID.
