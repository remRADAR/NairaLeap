create type public.service_request_status as enum (
  'draft',
  'submitted',
  'in_review',
  'resolved',
  'rejected'
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null,
  status public.service_request_status not null default 'submitted',
  submitted_payload jsonb not null,
  idempotency_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint service_requests_user_id_idempotency_key_key unique (user_id, idempotency_key)
);

create index service_requests_user_id_created_at_idx
  on public.service_requests (user_id, created_at desc);

create or replace function public.set_service_request_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger service_requests_set_updated_at
before update on public.service_requests
for each row execute function public.set_service_request_updated_at();

alter table public.service_requests enable row level security;

revoke all on table public.service_requests from anon, authenticated;
grant select, insert, update on table public.service_requests to authenticated;

grant usage on type public.service_request_status to authenticated;

create policy "Customers can view their own service requests"
on public.service_requests
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Customers can create their own service requests"
on public.service_requests
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Customers can update their own service requests"
on public.service_requests
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
