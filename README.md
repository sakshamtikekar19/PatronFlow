# PatronFlow

Turn Guests Into Loyal Patrons. The restaurant growth platform to grow reviews, loyalty, and repeat visits — collect customer feedback, build a customer database, and deepen guest relationships.

## Features (Phase 1 MVP)

- **Review Collection** — Public QR-friendly review page at `/r/[restaurantId]`
- **Feedback Management** — Filter, search, and resolve feedback
- **Customer CRM** — Customer database with visit stats and profile drawer
- **Analytics Dashboard** — KPIs, feedback trends, and rating distribution charts

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS + ShadCN UI
- Supabase (Auth + PostgreSQL)
- Recharts

## Quick Start

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Set up Supabase** — Follow [SETUP.md](./SETUP.md) for full instructions

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL, anon key, and service role key.

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & signup
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── r/[restaurantId] # Public review collection
│   └── api/             # API routes
├── components/          # UI & feature components
├── lib/
│   ├── actions/         # Server actions
│   ├── hooks/           # Client hooks
│   ├── queries/         # Data fetching
│   └── supabase/        # Supabase clients
└── types/               # TypeScript types
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Owner login |
| `/signup` | Create account + auto-provision restaurant |
| `/dashboard` | Analytics homepage |
| `/customers` | Customer CRM |
| `/feedback` | Feedback management |
| `/settings` | Restaurant settings |
| `/r/[restaurantId]` | Public review page (QR destination) |

## License

Private — All rights reserved.
