# NairaLeap Production Setup Runbook

This runbook is the canonical setup path for deploying NairaLeap on Vercel with Supabase Auth and Postgres. It intentionally contains variable names and placeholders, but never stores a Supabase secret or service-role key.

## 1. Confirm the correct projects

Use the public GitHub repository [`remRADAR/NairaLeap`](https://github.com/remRADAR/NairaLeap), the Vercel project named `nairaleap` under the `remradars-projects` team, and Supabase project reference `odixzoveqjhovkgdcfta`.

The production portal URL is:

```text
https://nairaleap.vercel.app
```

## 2. Configure Vercel environment variables

Open the Vercel project settings at:

```text
https://vercel.com/remradars-projects/nairaleap/settings/environment-variables
```

Add both variables with the names shown below. Select **Production** for both. Select **Preview** as well only if preview deployments need to use the same Supabase project.

| Name | Value source | Required environment |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL, for example `https://<project-ref>.supabase.co` | Production |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable browser key from Project Settings → API | Production |

The variable names are case-sensitive. Do not add quotation marks, spaces, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or any other secret key. These `VITE_*` values are embedded during the Vite build, so changing them requires a fresh deployment.

## 3. Redeploy after saving variables

Open the Vercel **Deployments** tab, identify the newest Production deployment, open its three-dot menu, and choose **Redeploy**. Wait until its state is **Ready**. Do not rely only on a deployment that was created before the variables were saved.

The deployment should be linked to the `main` branch of `remRADAR/NairaLeap`. If the deployment metadata shows a different repository, team, branch, or project, stop and correct the Vercel project linkage first.

## 4. Configure Supabase Auth URLs

Open:

```text
https://supabase.com/dashboard/project/odixzoveqjhovkgdcfta/auth/url-configuration
```

Set **Site URL** to:

```text
https://nairaleap.vercel.app
```

Add this exact redirect pattern under **Redirect URLs**:

```text
https://nairaleap.vercel.app/**
```

Save the settings. The redirect URL must match the deployed origin; a temporary Manus preview host should not be the only configured URL.

## 5. Confirm Supabase Auth provider settings

In Supabase, open **Authentication → Providers → Email** and confirm the Email provider is enabled. Keep email confirmation enabled for normal customer accounts unless the product owner intentionally chooses another policy. Check **Authentication → Logs** if sign-up or confirmation does not behave as expected.

## 6. Apply the database migration

The live project must contain the `public.service_requests` table and its RLS policies from:

```text
supabase/migrations/20260820070000_auth_and_service_requests.sql
```

The migration must be applied through the Supabase SQL Editor or the project’s migration workflow. The application should never use a service-role key from the browser.

## 7. Verify the deployed build

Open:

```text
https://nairaleap.vercel.app/auth
```

The page must not show the message `Authentication is not configured in this environment yet.` If it does, the browser bundle did not receive one or both `VITE_*` variables at build time.

Then perform this verification sequence:

1. Select **Create account**.
2. Use a real test email address and a password of at least eight characters.
3. Submit the form and complete the Supabase confirmation email if confirmation is enabled.
4. Return to `/auth` and sign in.
5. Confirm that `/dashboard` loads instead of redirecting back to `/auth`.
6. Open the NairaLeap Guide, complete a short service intake, and verify the final rundown.
7. Submit only after authentication is confirmed, then verify the request appears under `/requests`.

## 8. Troubleshooting matrix

| Symptom | Likely cause | Corrective action |
| --- | --- | --- |
| Auth page says Supabase is not configured | Variable missing from Production, wrong name, wrong project, or deployment predates the variable | Correct both names, select Production, save, and redeploy |
| Production works but Preview does not | Variables were added only to Production | Add the same public variables to Preview if preview auth is required |
| Confirmation link returns to the wrong host | Supabase Site URL or Redirect URL still points to a temporary preview host | Set the production Site URL and add the production wildcard redirect |
| Sign-up returns an API/network error | Supabase URL/key mismatch, provider disabled, or Supabase project unavailable | Recheck Project Settings → API and Authentication → Providers |
| `/dashboard` redirects to `/auth` after sign-in | Session cookies or redirect URL are not aligned with the deployed origin | Recheck Auth URLs and retry from a fresh browser session |
| Request submission fails after successful sign-in | Migration or RLS policy is missing or incomplete | Apply and verify the service-request migration; never bypass RLS with a browser secret |
| Deployment is Ready but old behavior remains | The wrong Vercel project, branch, or deployment alias is being opened | Compare deployment metadata with `remRADAR/NairaLeap`, `main`, and `nairaleap.vercel.app` |

## 9. Current audit findings

The repository correctly references `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, keeps `.env.local` out of version control, and contains the Supabase migration and browser/server client boundary. The production Vercel deployment is reachable and the brain-box navigator is live.

The confirmed production blocker during the latest audit was that the live `/auth` page still reported missing Supabase configuration even after a Ready redeployment. That means the variables were not available to the Production build at verification time, or they were saved under a different project/environment than the active deployment. This cannot be proven or corrected from the public site because Vercel does not expose environment-variable values publicly.

A repository-side production hygiene omission was also corrected: the temporary `.manus.computer` Vite `allowedHosts` entry was removed from `vite.config.ts`. The next deployment should be built from that updated commit.

## 10. Security requirements

Never commit `.env.local`. Never place a Supabase secret or service-role key in Vercel `VITE_*` variables, client code, GitHub, documentation, or chat. The previously exposed Supabase secret must be revoked and rotated in Supabase. Only the publishable browser key belongs in the Vite production environment.
