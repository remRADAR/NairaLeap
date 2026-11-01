-- Operational workflows (Phase B4 + B5): staff assignment with an immutable
-- audit trail, and the booking/scheduling foundation.
--
-- Design rules:
--  * Assignment is an authorised operational action: only trusted staff/admin
--    can set or change service-request assignees. Customers never can.
--  * Every status or assignment change is captured in an append-only history
--    table by a SECURITY DEFINER trigger — participants cannot forge, edit or
--    delete audit rows.
--  * Booking is a FOUNDATION only: lifecycle states exist, but no cancellation
--    windows, pricing, reminders or operational promises are invented. Those
--    require owner business-rule approval.

-- ------------------------------------------------------- B4: assignment ----

alter table public.service_requests
  add column if not exists assigned_staff uuid references public.participants (id)
    on delete set null;

comment on column public.service_requests.assigned_staff is
  'Trusted staff/admin-assigned operator. Customers can never set this (trigger-enforced).';

-- Assignment guard: only trusted staff/admin may set or change assigned_staff.
create or replace function public.service_request_guard_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.assigned_staff is distinct from old.assigned_staff
    and not public.app_is_staff_or_admin() then
    raise exception 'Service request assignment can only be changed by authorized staff'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists service_request_assignment_guard on public.service_requests;
create trigger service_request_assignment_guard
  before update of assigned_staff on public.service_requests
  for each row execute function public.service_request_guard_assignment();

-- Immutable audit trail for status and assignment changes.
create table if not exists public.service_request_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests (id) on delete cascade,
  changed_by uuid references auth.users (id) on delete set null,
  status_from public.service_request_status,
  status_to public.service_request_status,
  assigned_from uuid,
  assigned_to uuid,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.service_request_history enable row level security;
revoke all on table public.service_request_history from anon;
grant select on table public.service_request_history to authenticated;

create policy "request history owner read"
  on public.service_request_history for select to authenticated
  using (
    exists (
      select 1
      from public.service_requests r
      where r.id = request_id
        and (r.user_id = auth.uid() or public.app_is_staff_or_admin())
    )
  );

create policy "request history staff read all"
  on public.service_request_history for select to authenticated
  using (public.app_is_staff_or_admin());

-- No insert/update/delete policies for clients: only the trigger writes history.
drop policy if exists "request history restrictive write" on public.service_request_history;
create policy "request history restrictive write"
  on public.service_request_history as restrictive for insert to public
  with check (false);

create or replace function public.service_request_record_history()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status is distinct from old.status
    or new.assigned_staff is distinct from old.assigned_staff then
    insert into public.service_request_history (
      request_id, changed_by, status_from, status_to,
      assigned_from, assigned_to
    )
    values (
      new.id, auth.uid(), old.status, new.status,
      old.assigned_staff, new.assigned_staff
    );
  end if;
  return new;
end;
$$;

drop trigger if exists service_request_history_record on public.service_requests;
create trigger service_request_history_record
  after update on public.service_requests
  for each row execute function public.service_request_record_history();

-- --------------------------------------------------- B5: booking foundation --

create table if not exists public.provider_availability (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references public.provider_profiles (id) on delete cascade,
  service_area text not null default '',
  -- 0 = Sunday ... 6 = Saturday, ISO-style recurring weekly window.
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider_profile_id, weekday, start_time)
);

alter table public.provider_availability enable row level security;

create policy "availability provider manages"
  on public.provider_availability for all to authenticated
  using (
    exists (
      select 1
      from public.provider_profiles pp
      where pp.id = provider_profile_id
        and pp.participant_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.provider_profiles pp
      where pp.id = provider_profile_id
        and pp.participant_id = auth.uid()
    )
  );

create policy "availability admin full access"
  on public.provider_availability for all to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- Verified providers' availability is publicly listable for discovery.
create policy "availability public read verified providers"
  on public.provider_availability for select to authenticated, anon
  using (
    exists (
      select 1
      from public.provider_profiles pp
      where pp.id = provider_availability.provider_profile_id
        and pp.verification_status = 'verified'
        and pp.id = provider_profile_id
    )
  );

create type public.booking_status as enum (
  'requested', 'confirmed', 'rescheduled', 'cancelled', 'completed'
);

-- Foundation only: no cancellation-window, reminder or fee policy is invented.
-- Those business rules require explicit owner approval before enforcement.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid references public.service_requests (id) on delete set null,
  provider_profile_id uuid not null references public.provider_profiles (id) on delete cascade,
  customer_id uuid not null references auth.users (id) on delete cascade,
  requested_start timestamptz not null,
  requested_end timestamptz not null check (requested_end > requested_start),
  status public.booking_status not null default 'requested',
  rescheduled_from uuid references public.bookings (id) on delete set null,
  cancellation_reason text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
grant usage on type public.booking_status to authenticated;

create policy "bookings customer read own"
  on public.bookings for select to authenticated
  using (customer_id = auth.uid());

create policy "bookings customer requests own"
  on public.bookings for insert to authenticated
  with check (customer_id = auth.uid() and status = 'requested');

create policy "bookings customer cancels own"
  on public.bookings for update to authenticated
  using (customer_id = auth.uid())
  with check (
    customer_id = auth.uid()
    -- Customers may only cancel (or annotate while cancelling) their booking;
    -- confirmation/rescheduling/completion are provider/staff decisions.
    and status in ('requested', 'confirmed', 'rescheduled', 'cancelled')
    and new.status = 'cancelled'
  );

create policy "bookings provider manages own"
  on public.bookings for all to authenticated
  using (
    exists (
      select 1
      from public.provider_profiles pp
      where pp.id = provider_profile_id
        and pp.participant_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.provider_profiles pp
      where pp.id = provider_profile_id
        and pp.participant_id = auth.uid()
    )
  );

create policy "bookings admin full access"
  on public.bookings for all to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

create or replace function public.bookings_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.bookings_touch_updated_at();
