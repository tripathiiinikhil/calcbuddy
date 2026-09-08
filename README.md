# CalcBuddy

CalcBuddy is a mobile-first cash and business-management MVP for cash-heavy Indian businesses.

## Current stage

Phase 1 is implemented: secure email/password account flows, onboarding, session handling, and the Supabase database foundation. Onboarding saves the business and its owner access atomically (both records succeed together or neither does). The dashboard is deliberately an honest empty shell until Counter and the other business features are built.

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

Add `http://localhost:3000` to Supabase Auth’s allowed redirect URLs for local development. Add the corresponding production origin when you deploy. CalcBuddy derives the redirect origin from the submitted request, so the same authentication code works locally and in production.
