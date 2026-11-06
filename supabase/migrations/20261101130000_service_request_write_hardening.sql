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
drop policy if exists service_requests_update_admin_only_restrictive
  on public.service_requests;
create policy service_requests_update_admin_only_restrictive
  on public.service_requests as restrictive for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant update (status) on table public.service_requests to authenticated;
