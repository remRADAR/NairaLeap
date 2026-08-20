# Supabase setup

The first persistence slice uses Supabase Auth and the `public.service_requests` table. The browser and server clients read `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; copy `.env.example` to `.env.local` and fill both values from the Supabase project Connect panel. Never commit `.env.local` or a secret/service-role key.

Apply `migrations/20260820070000_auth_and_service_requests.sql` through the Supabase SQL Editor or your normal migration workflow before using request submission. The migration creates the request status enum and table, grants only the signed-in role the required table operations, enables RLS, and limits reads, inserts, and updates to rows whose `user_id` matches `auth.uid()`.

The local verification path is `/auth` → `/dashboard` → `/onboarding/agriculture`. The server submission function validates the payload again, verifies the authenticated Supabase user from the request cookies, and uses a per-submission idempotency key so retries do not create duplicate requests.
