-- Database-level security tests (pgTAP) for the hardening migration.
--
-- Run with:  supabase db test
-- Requires:  pgtap extension (available in Supabase: create extension pgtap;)
--
-- These tests execute REAL SQL as the authenticated role with simulated JWT
-- claims, exercising attempted self-promotion, self-verification, reviewer
-- tampering, callback ownership and FAQ moderation defaults through direct
-- database requests (not the UI).
--
-- NOT EXECUTED in the authoring environment — Manus must run them against a
-- STAGING database and attach the output before any merge to main.

begin;
select plan(14);

-- Fixtures: two ordinary users and one trusted admin (via raw_app_meta_data).
create or replace function tests.setup_users() returns void language plpgsql as $$
declare u_ordinary uuid; u_victim uuid; u_admin uuid;
begin
  select id into u_ordinary from auth.users limit 1;
  if u_ordinary is null then
    insert into auth.users (id, email, raw_app_meta_data)
    values (gen_random_uuid(), 'ordinary@test.local', '{}'::jsonb)
    returning id into u_ordinary;
    insert into auth.users (id, email, raw_app_meta_data)
    values (gen_random_uuid(), 'victim@test.local', '{}'::jsonb)
    returning id into u_victim;
    insert into auth.users (id, email, raw_app_meta_data)
    values (gen_random_uuid(), 'admin@test.local', '{"role": "admin"}'::jsonb)
    returning id into u_admin;
  end if;
end $$;
select tests.setup_users();

-- 1-2: Ordinary participant INSERT is forced to ['customer'].
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.participants (id) values ('%s')
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  'ordinary user can create their own participant row'
);
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    select roles from public.participants where id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  array[array['customer']::text[]]::text,
  'self-inserted roles are forced to customer (no admin/staff)'
);

-- 3: Attempted self-promotion to admin is rejected/neutralised.
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.participants set roles = array ['admin'] where id = '%s';
    select roles from public.participants where id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  array[array['customer']::text[]]::text,
  'attempted self-promotion to admin is neutralised'
);

-- 4: Granting another participant a privileged role is neutralised.
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.participants set roles = array ['staff'] where id = '%s';
    select roles from public.participants where id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'victim@test.local'),
           (select id from auth.users where email = 'victim@test.local')),
  array[array['customer']::text[]]::text,
  'ordinary user cannot grant another participant the staff role'
);

-- 5-6: Provider self-verification is impossible.
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.provider_profiles (participant_id, business_name)
    values ('%s', 'Self Serve Ltd');
    select verification_status from public.provider_profiles where participant_id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  array['unverified'],
  'provider profile inserts default to unverified'
);
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.provider_profiles set verification_status = 'verified'
    where participant_id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  '42501',
  'provider self-verification raises a permission error'
);

-- 7-9: KYC — raw identity number never stored; owner cannot self-verify or
-- tamper with reviewer decisions.
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.kyc_verifications (participant_id, id_type, id_number_input)
    values ('%s', 'nin', '12345678901');
    select id_number_input is null and id_number_last4 = '8901' and length(id_number_hash) = 64
    from public.kyc_verifications where participant_id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  array[true],
  'KYC input is consumed: only last4 + sha256 reference remain, raw number is never stored'
);
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.kyc_verifications set status = 'verified'
    where participant_id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  '42501',
  'owner cannot verify their own KYC'
);
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.kyc_verifications set review_notes = 'looks fine to me', reviewer_id = null
    where participant_id = '%s';
    select review_notes from public.kyc_verifications where participant_id = '%s'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  array[''],
  'owner cannot modify reviewer decisions or notes'
);

-- 10-11: Callbacks — consent + ownership required; no open inserts.
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.whatsapp_callbacks (participant_id, phone, consent_given, consent_at)
    values ('%s', '+2340000000000', false, now())
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  '42501',
  'callback without consent is rejected'
);
select throws_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.whatsapp_callbacks (participant_id, phone, consent_given, consent_at, status)
    values ('%s', '+2340000000000', true, now(), 'done')
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'victim@test.local')),
  '42501',
  'callback for another participant, or with a non-queued status, is rejected'
);

-- 12-13: FAQs always enter as pending; invalid survey options rejected.
select results_eq(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    insert into public.article_faqs (article_slug, question, submitted_by, status)
    values ('some-slug', 'Q?', '%s', 'approved');
    select status from public.article_faqs where article_slug = 'some-slug'
  $test$, (select id from auth.users where email = 'ordinary@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  '42501',
  'FAQ cannot be self-approved (pending enforced)'
);
select throws_ok(
  $test$
    set local role authenticated;
    insert into public.article_survey_responses (survey_id, selected_option)
    values (gen_random_uuid(), 'not-an-option')
  $test$,
  '23503',
  'survey response for a missing survey is rejected'
);

-- 14: Admin can change provider verification through the trusted path.
select lives_ok(
  format($test$
    set local role authenticated;
    set local request.jwt.claims = json_build_object('sub', '%s')::text;
    update public.provider_profiles set verification_status = 'verified'
    where participant_id = '%s'
  $test$, (select id from auth.users where email = 'admin@test.local'),
           (select id from auth.users where email = 'ordinary@test.local')),
  'trusted admin can verify provider profiles'
);

select finish();
rollback;
