-- pgTAP tests for assignment/audit-trail and booking boundaries (Phase B4/B5).
-- Self-contained companion to rls_security_test.sql. NOT executed in the
-- authoring environment; run with `supabase db test` against STAGING only.

begin;
select plan(6);

-- Fixtures: ordinary customer, second user, trusted admin (raw_app_meta_data).
create or replace function tests.setup_ab_users() returns void language plpgsql security definer set search_path = public, auth as $$
begin
  insert into auth.users (id, email, raw_app_meta_data)
  values (gen_random_uuid(), 'ab-customer@test.local', '{}'::jsonb)
  on conflict (email) do nothing;
  insert into auth.users (id, email, raw_app_meta_data)
  values (gen_random_uuid(), 'ab-victim@test.local', '{}'::jsonb)
  on conflict (email) do nothing;
  insert into auth.users (id, email, raw_app_meta_data)
  values (gen_random_uuid(), 'ab-admin@test.local', '{"role": "admin"}'::jsonb)
  on conflict (email) do nothing;
end $$;
select tests.setup_ab_users();

-- Customer with a submitted service request.
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.service_requests (user_id, service_id, schema_version, submitted_payload, idempotency_key)
    values ('%s', 'customer-support', 'v1', '{}'::jsonb, gen_random_uuid())
  $test$, (select id from auth.users where email = 'ab-customer@test.local'),
           (select id from auth.users where email = 'ab-customer@test.local')),
  'customer can submit a service request'
);

-- 1: Customer cannot assign staff to their own request.
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.service_requests
    set assigned_staff = '%s'
    where user_id = '%s'
  $test$, (select id from auth.users where email = 'ab-customer@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-customer@test.local')),
  '42501',
  'customer cannot assign staff (trigger-enforced)'
);

-- 2: A second ordinary participant cannot assign either.
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.service_requests
    set assigned_staff = '%s'
    where user_id = '%s'
  $test$, (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-customer@test.local')),
  '42501',
  'another participant cannot assign staff'
);

-- 3: Trusted admin can assign, and a history row is recorded.
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.service_requests
    set assigned_staff = '%s'
    where user_id = '%s'
  $test$, (select id from auth.users where email = 'ab-admin@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-customer@test.local')),
  'trusted admin can assign staff'
);
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    select count(*) from public.service_request_history
    where assigned_to = '%s'
  $test$, (select id from auth.users where email = 'ab-admin@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local')),
  array[1]::text[],
  'assignment change recorded in immutable audit trail'
);

-- 4-6: Booking boundaries (customer can request; cannot self-confirm).
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.participants (id) values ('%s');
    insert into public.provider_profiles (participant_id, business_name)
    values ('%s', 'Booking Provider Ltd');
    insert into public.bookings (provider_profile_id, customer_id, requested_start, requested_end)
    values ((select id from public.provider_profiles where business_name = 'Booking Provider Ltd'),
            '%s', now() + interval '2 days', now() + interval '2 days' + interval '1 hour')
  $test$, (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local')),
  'customer can create a requested booking'
);
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.bookings set status = 'confirmed'
    where customer_id = '%s'
  $test$, (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local')),
  '42501',
  'customer cannot confirm their own booking'
);
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.bookings set status = 'cancelled', cancellation_reason = 'changed plans'
    where customer_id = '%s'
  $test$, (select id from auth.users where email = 'ab-victim@test.local'),
           (select id from auth.users where email = 'ab-victim@test.local')),
  'customer can cancel their own booking'
);

select finish();
rollback;
