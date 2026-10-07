-- Admin request review is driven by the Supabase Auth app_metadata role claim.
-- Set app_metadata.role = 'admin' only for approved internal operators.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can review all service requests"
on public.service_requests
for select
to authenticated
using (public.is_admin());

create policy "Admins can update service requests"
on public.service_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
