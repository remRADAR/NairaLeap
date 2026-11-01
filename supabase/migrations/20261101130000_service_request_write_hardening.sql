-- Submitted customer requests are append-only for participants. The only
-- supported UPDATE path is the existing administrator workflow, which changes
-- status alone under its admin-only RLS policy.
drop policy if exists "Customers can update their own service requests"
  on public.service_requests;

revoke update on table public.service_requests from authenticated;
revoke update (
  id,
  user_id,
  service_id,
  schema_version,
  status,
  submitted_payload,
  idempotency_key,
  source,
  created_at,
  updated_at
) on table public.service_requests from authenticated;

grant update (status) on table public.service_requests to authenticated;
