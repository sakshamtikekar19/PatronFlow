# PatronFlow Deployment Guide

## Overview

This guide covers deploying PatronFlow to production using Vercel and Supabase.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Vercel account
- Supabase account (Pro plan recommended for production)
- Payment provider accounts (Stripe, Razorpay)

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Payment Variables (for billing)

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_PLAN_ID=plan_...
```

### Optional Variables

```env
# Cron jobs
CRON_SECRET=your-secret-for-cron-auth

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the PatronFlow repository

### 2. Configure Environment Variables

1. In project settings, go to "Environment Variables"
2. Add all required variables from above
3. Set variables for Production, Preview, and Development as needed

### 3. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at the preview URL

### 5. Custom Domain

1. Go to project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Wait for SSL certificate provisioning

## Supabase Production Setup

### 1. Create Production Project

1. Create a new Supabase project for production
2. Note the project URL and keys

### 2. Run Migrations

Run the schema and migrations in order:

```bash
# Connect to Supabase SQL Editor and run:
# 1. supabase/schema.sql (initial schema)
# 2. supabase/migrations/002_add_slugs.sql
# 3. supabase/migrations/003_customer_delete_policy.sql
# 4. supabase/migrations/004_rls_hardening.sql
# 5. supabase/migrations/005_subscription_schema.sql
```

### 3. Configure Authentication

1. Go to Authentication > URL Configuration
2. Add your production URL to "Site URL"
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`

### 4. Configure Email Templates

1. Go to Authentication > Email Templates
2. Customize confirmation and reset password emails
3. Configure SMTP settings for custom domain emails

### 5. Enable Backups (Pro Plan)

1. Go to Settings > Database > Backups
2. Enable daily backups
3. Configure retention period

## Payment Provider Setup

### Stripe Setup

1. Create Stripe account at stripe.com
2. Set up billing portal in Stripe Dashboard
3. Create a subscription product and price
4. Configure webhooks:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### Razorpay Setup

1. Create Razorpay account at razorpay.com
2. Create a subscription plan
3. Configure webhooks:
   - Endpoint: `https://your-domain.com/api/webhooks/razorpay`
   - Events: `subscription.*`, `payment.failed`

## Post-Deployment Checklist

### Immediate Verification

- [ ] Application loads at production URL
- [ ] SSL certificate is valid
- [ ] Login/signup works
- [ ] Password reset emails are sent
- [ ] Database connections work
- [ ] File uploads work (logos, covers)

### Security Verification

- [ ] Security headers are present (check with securityheaders.com)
- [ ] HTTPS redirect works
- [ ] API rate limiting works
- [ ] Webhook signatures are verified

### Payment Verification

- [ ] Test checkout flow (use Stripe test mode first)
- [ ] Webhooks receive events
- [ ] Subscription status updates correctly
- [ ] Invoice history shows

### Monitoring Setup

- [ ] Health endpoint returns 200: `https://your-domain.com/api/health`
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring configured (optional: Checkly, Pingdom)

## Railway Alternative

If deploying to Railway instead of Vercel:

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo

### 2. Configure Environment

Add all environment variables in Railway dashboard.

### 3. Configure Build

Railway auto-detects Next.js. If needed:
- Build Command: `npm run build`
- Start Command: `npm start`

### 4. Deploy

Railway deploys automatically on push to main branch.

## Rollback Procedure

If a deployment causes issues:

### Vercel Rollback

1. Go to Deployments tab
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"

### Database Rollback

1. Identify the migration that caused issues
2. Create a reverse migration
3. Or restore from backup (see BACKUP_STRATEGY.md)

## Troubleshooting

### Build Failures

- Check Node.js version matches local
- Verify all env vars are set
- Check for TypeScript errors: `npm run build` locally

### Database Connection Issues

- Verify SUPABASE_URL is correct
- Check service role key has proper permissions
- Ensure RLS policies allow the operation

### Authentication Issues

- Check redirect URLs in Supabase
- Verify NEXT_PUBLIC_APP_URL matches domain
- Check email configuration

### Payment Issues

- Verify webhook endpoints are correct
- Check webhook secrets match
- Test with provider's test mode first
