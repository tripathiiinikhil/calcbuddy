# CalcBuddy

CalcBuddy is a mobile-first cash and business-management MVP for cash-heavy Indian businesses.

## Project overview

CalcBuddy helps small shops and local businesses replace notebooks, calculators, and scattered spreadsheets with one simple workspace. It is designed around the daily workflows that matter most to a cash-heavy business:

- Count cash by Indian currency denomination and review previous counts.
- Track customer credit and payments through an udhaar/khaata ledger.
- Record business expenses and outgoing debit transactions.
- Manage products, prices, and SKUs in a catalog.
- Create printable estimates and quotations for customers.
- Use a quick calculator with GST lookup support.
- Review cash, credit, expenses, estimates, and recent activity from one dashboard.

The application uses secure email/password authentication and isolates business data with Supabase Row Level Security. The interface is built for fast use on phones while remaining usable on desktop screens.

## Current stage

The core MVP workflows are implemented: authentication, onboarding, dashboard, cash counter, credit ledger, expense tracking, products, estimates, calculator, session handling, and the Supabase database foundation. Onboarding saves the business and its owner access atomically (both records succeed together or neither does).

## Local setup

1. Install the current Node.js LTS release from [nodejs.org](https://nodejs.org/).
2. Create a Supabase project and copy `.env.example` to `.env.local`.
3. Fill in the Supabase URL and publishable key from **Project Settings → API**. Do not add a service-role key unless a later server-only feature explicitly needs it. If these are missing, CalcBuddy now opens a clear `/setup` screen instead of failing with a server error.
4. Apply [the initial migration](supabase/migrations/202609020001_initial_schema.sql) in Supabase SQL Editor, or install the Supabase CLI and run `supabase db push`.
5. In Supabase Auth settings, configure your local and production redirect URLs. Choose whether email confirmation is required.
6. Run `npm install`, then `npm run dev`.

## Security note

The migration enables Row Level Security (RLS) for all business data. RLS is database-level access control: it prevents a signed-in person from reading or changing another business’s records even if they alter a browser request.

## Authentication redirect URLs

Add `(https://calcbuddy-theta.vercel.app)` to Supabase Auth’s allowed redirect URLs for local development. Add the corresponding production origin when you deploy. CalcBuddy derives the redirect origin from the submitted request, so the same authentication code works locally and in production.
