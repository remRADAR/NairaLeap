# NairaLeap Cloudflare D1 migration

## Current phase

NairaLeap keeps Supabase Auth as the identity provider. The Cloudflare Worker receives the Supabase-authenticated request, and the `NAIRALEAP_DB` D1 binding is the primary store for `service_requests` whenever it is available.

The application falls back to the existing Supabase `public.service_requests` table when the D1 binding is unavailable. This keeps local development and rollback possible without changing authentication behavior.

## Cloudflare resources

- Worker name: `nairaleap`
- D1 database name: `nairaleap-data`
- D1 database ID: `55e19c59-b032-4f56-b8bc-7b41985426f8`
- Binding: `NAIRALEAP_DB`
- Migration directory: `cloudflare/migrations/`

## Data contract

D1 stores the stable Supabase Auth user UUID as `user_id`. It preserves the existing service-request fields, idempotency uniqueness rule, allowed statuses, allowed sources, and request ordering indexes. Supabase Auth remains the authority for identity and the `app_metadata.role = 'admin'` claim remains the authority for Admin Studio authorization.

## Verification and cutover

Before production traffic is switched, deploy the Worker to an isolated `workers.dev` URL and verify:

1. Existing Supabase users can sign in.
2. A customer can submit one request and a retry with the same idempotency key does not duplicate it.
3. A customer can list only their own requests.
4. The Admin Studio account can list the queue and update a request status.
5. A second identical request and an unauthorized/non-admin request are rejected.
6. D1 counts and request identities reconcile with the source Supabase table during any data-copy window.

Only after those checks pass should the production domain be pointed at the Worker. Supabase must remain active until the new path has been observed in production and an explicit cleanup gate is approved.

## Rollback

To roll back the application path, remove or disable the `NAIRALEAP_DB` binding for the deployment and redeploy. The application will use the existing Supabase persistence fallback while Supabase Auth continues unchanged. Do not delete or pause the Supabase project during this phase.
