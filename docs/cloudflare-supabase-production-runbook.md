# Cloudflare + Supabase production runbook

This repository deploys the NairaLeap application as a Cloudflare Worker. Supabase Auth requires the two public browser values below during the Vite build. They are not service-role credentials and must never be replaced with a secret key.

| Name                            | Value                                             |
| ------------------------------- | ------------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://odixzoveqjhovkgdcfta.supabase.co`        |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Project Settings → API → publishable key |

Add both values to the GitHub **Preview** environment as Actions secrets with the exact names above. The `Deploy NairaLeap Canary` workflow passes them to the build and fails before deployment if either is absent or the URL is not an HTTPS Supabase project URL. The same values must be present in the production deployment environment when a production Worker is introduced.

The browser client reads the values from `import.meta.env`. The Cloudflare server client first checks Worker runtime variables through `process.env` and then falls back to the same public build values. This fallback is intentional for Cloudflare’s bundled Worker artifact; it is safe only because the application uses the publishable browser key, never a service-role key, in this path.

After adding or changing the values, run the canary workflow manually with the exact confirmation `DEPLOY_CANARY`. Confirm that the workflow completes TypeScript validation, lint, build, the generated D1 binding safety check, and the staging-domain probe. Changing the variables without a new build does not update an already deployed bundle.

## Supabase Auth and Admin Studio

In Supabase Authentication → URL Configuration, set the Site URL to the actual deployed origin and add the matching wildcard redirect, for example `https://staging.nairaleap.com/**` for the canary. Add the production origin separately when production routing is ready. Keep the Email provider enabled and use the normal confirmation policy for customer accounts.

The protected Admin Studio entry point is `/admin-login`. The access boundary is implemented in commit `fb12feefd7f945762e0fdbc85ef638c458c4cec9`, which is already an ancestor of `main`. An approved operator must have `app_metadata.role = 'admin'`; this claim is checked by the server and reinforced by the request-queue RLS migration `supabase/migrations/20261007190000_admin_service_request_access.sql`. Apply both Supabase migrations before testing request-queue operations.

## Domain check

The repository and current Cloudflare staging deployment use the NairaLeap domain family: `https://nairaleap.com` and `https://staging.nairaleap.com`. The requested `nairalib.com` hostname currently returns DNS NXDOMAIN and cannot serve this Worker until that domain is registered and its DNS/Cloudflare zone is configured. Do not treat a successful staging probe as proof that `nairalib.com` is routed.

## Verification sequence

Open `/admin-login` in a fresh browser session and confirm the email and password fields render. When the build has the Supabase values, the submit button must be enabled; when the build is missing them, the page must show the explicit configuration warning and keep the button disabled. After signing in with an approved admin account, confirm that `/admin` loads, the Admin Studio sign-out action returns to `/admin-login`, and an ordinary customer account cannot enter the admin workspace. Then verify the request queue only after the admin RLS migration is applied.
