-- Database-level security regression tests for the foundations and security-hardening migrations.
--
-- Run with: supabase db test (only against an isolated staging project/database).
-- Prerequisites: the migrations are applied, pgTAP and Supabase Vault are enabled,
-- and the active KYC HMAC key is provisioned in Vault. This file uses deterministic
-- reserved test identities and rolls all fixtures (including temporary key metadata)
-- back at the end. It never contains a real identity number or a committed HMAC key.
--
-- IMPORTANT: this suite has not been run unless the actual pgTAP output is attached
-- to the handoff. Direct SQL storage-object tests exercise RLS metadata predicates;
-- they do not replace a real Storage API upload integration test.

begin;
create schema if not exists tests;
select plan(58);

-- Each fixture is checked independently. A conflicting ID/email fails safely;
-- no existing auth user is updated or repurposed.
create or replace function tests.ensure_auth_user(
  p_id uuid,
  p_email text,
  p_raw_app_meta_data jsonb
) returns void
language plpgsql
as $$
begin
  if exists (select 1 from auth.users where id = p_id and email <> p_email)
     or exists (select 1 from auth.users where email = p_email and id <> p_id) then
    raise exception 'pgTAP fixture identity collision for %', p_email;
  end if;

  insert into auth.users (id, email, raw_app_meta_data)
  values (p_id, p_email, p_raw_app_meta_data)
  on conflict (id) do nothing;

  if not exists (
    select 1 from auth.users
    where id = p_id
      and email = p_email
      and raw_app_meta_data = p_raw_app_meta_data
  ) then
    raise exception 'pgTAP fixture user does not match its deterministic identity: %', p_email;
  end if;
end;
$$;

create or replace function tests.setup_users() returns void
language plpgsql
as $$
begin
  perform tests.ensure_auth_user(
    '11111111-1111-4111-8111-111111111111',
    'nairaleap-pgtap-participant-1@invalid.example',
    '{}'::jsonb
  );
  perform tests.ensure_auth_user(
    '22222222-2222-4222-8222-222222222222',
    'nairaleap-pgtap-participant-2@invalid.example',
    '{}'::jsonb
  );
  perform tests.ensure_auth_user(
    '33333333-3333-4333-8333-333333333333',
    'nairaleap-pgtap-admin@invalid.example',
    '{"role":"admin"}'::jsonb
  );
  perform tests.ensure_auth_user(
    '44444444-4444-4444-8444-444444444444',
    'nairaleap-pgtap-staff@invalid.example',
    '{"role":"staff"}'::jsonb
  );

  if exists (
    select 1 from public.participants
    where id = '11111111-1111-4111-8111-111111111111'
  ) then
    raise exception 'primary participant fixture already has a row; refusing to reuse it';
  end if;

  insert into public.participants (id, display_name, roles)
  values
    ('22222222-2222-4222-8222-222222222222', 'pgTAP fixture participant 2', array['customer']),
    ('33333333-3333-4333-8333-333333333333', 'pgTAP fixture administrator', array['customer']),
    ('44444444-4444-4444-8444-444444444444', 'pgTAP fixture staff', array['customer'])
  on conflict (id) do nothing;

  if exists (
    select 1 from public.participants
    where id in (
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444'
    )
      and roles <> array['customer']::text[]
  ) then
    raise exception 'pgTAP participant fixture has unexpected roles; refusing to reuse it';
  end if;

  insert into public.article_surveys (id, article_slug, question, options, active)
  values
    ('55555555-5555-4555-8555-555555555555', 'pgtap-fixture', 'Choose one', '["yes","no"]'::jsonb, true),
    ('66666666-6666-4666-8666-666666666666', 'pgtap-fixture-inactive', 'Inactive survey', '["yes"]'::jsonb, false)
  on conflict (id) do nothing;
end;
$$;

select tests.setup_users();

-- Preserve all key metadata in a transaction-local table so a missing-Vault-key
-- failure can be tested and restored without changing persistent configuration.
create temporary table pgtap_hmac_key_state on commit drop as
select key_version, vault_secret_name, is_active, retired_at
from private.kyc_identity_hmac_key_versions;

-- 1-6: participants cannot self-promote or grant staff/admin roles to another user.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.participants (id, display_name, roles)
    values (auth.uid(), 'pgTAP fixture participant 1', array['admin','staff'])$$,
  'ordinary participant can create their own participant row'
);
select results_eq(
  $$select roles from public.participants where id = auth.uid()$$,
  $$values (array['customer']::text[])$$,
  'self-inserted privileged roles are forced to customer'
);
select lives_ok(
  $$update public.participants set roles = array['admin','staff'] where id = auth.uid()$$,
  'attempted self-promotion is processed without granting privileges'
);
select results_eq(
  $$select roles from public.participants where id = auth.uid()$$,
  $$values (array['customer']::text[])$$,
  'self-promotion to staff/admin is neutralized'
);
select lives_ok(
  $$update public.participants set roles = array['admin','staff']
    where id = '22222222-2222-4222-8222-222222222222'$$,
  'ordinary participant cannot update another participant through RLS'
);
reset role;
select results_eq(
  $$select roles from public.participants where id = '22222222-2222-4222-8222-222222222222'$$,
  $$values (array['customer']::text[])$$,
  'granting privileged roles to another participant has no effect'
);

-- 7-9: providers cannot self-verify; inserts are stored as unverified.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.provider_profiles (participant_id, business_name, verification_status)
    values (auth.uid(), 'pgTAP fixture provider', 'verified')$$,
  'provider can create a profile without choosing its verification outcome'
);
select results_eq(
  $$select verification_status from public.provider_profiles
    where participant_id = auth.uid()$$,
  $$values ('unverified'::text)$$,
  'provider self-verification on insert is forced to unverified'
);
select throws_ok(
  $$update public.provider_profiles set verification_status = 'verified'
    where participant_id = auth.uid()$$,
  '42501',
  'provider self-verification on update raises a permission error'
);
reset role;

-- 10: a missing active Vault secret must fail closed. Restore the exact key
-- configuration immediately; the whole test transaction is rolled back below.
update private.kyc_identity_hmac_key_versions
set vault_secret_name = 'nairaleap-pgtap-missing-key-' || gen_random_uuid()::text
where is_active and retired_at is null;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.kyc_verifications (participant_id, id_type, id_number_input)
    values (auth.uid(), 'nin', 'test-nin-12345678901')$$,
  '55000',
  'KYC identity writes fail closed when the active Vault key is missing'
);
reset role;
update private.kyc_identity_hmac_key_versions k
set vault_secret_name = s.vault_secret_name,
    is_active = s.is_active,
    retired_at = s.retired_at
from pgtap_hmac_key_state s
where k.key_version = s.key_version;

-- 11-23: KYC HMAC consumption, duplicate detection, ownership, reviewer access.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.kyc_verifications (participant_id, id_type, id_number_input)
    values (auth.uid(), 'nin', ' test-nin-12345678901 ')$$,
  'participant can submit a KYC identity input when Vault is configured'
);
select results_eq(
  $$select id_number_input is null
      and id_number_last4 = '8901'
      and length(id_number_hash) = 64
      and id_number_hash_key_version is not null
    from public.kyc_verifications where participant_id = auth.uid()$$,
  $$values (true)$$,
  'KYC raw input is consumed and only HMAC reference, key version, and last four remain'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.kyc_verifications (participant_id, id_type, id_number_input)
    values (auth.uid(), 'nin', 'TEST-NIN-12345678901')$$,
  '23505',
  'normalized duplicate identity is rejected across participant accounts'
);
reset role;
create policy pgtap_permissive_kyc_read
  on public.kyc_verifications for select to authenticated using (true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from public.kyc_verifications
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  $$values (0::bigint)$$,
  'restrictive KYC boundary blocks a permissive cross-owner read policy'
);
reset role;
drop policy pgtap_permissive_kyc_read on public.kyc_verifications;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select throws_ok(
  $$update public.kyc_verifications set status = 'verified'
    where participant_id = auth.uid()$$,
  '42501',
  'KYC owner cannot self-verify'
);
select lives_ok(
  $$update public.kyc_verifications
    set reviewer_id = '33333333-3333-4333-8333-333333333333', review_notes = 'forged review'
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  'cross-owner reviewer tampering is filtered by RLS'
);
reset role;
select results_eq(
  $$select count(*)::bigint from public.kyc_verifications
    where participant_id = '11111111-1111-4111-8111-111111111111'
      and reviewer_id is null and review_notes = ''$$,
  $$values (1::bigint)$$,
  'reviewer metadata remains inaccessible to another participant'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$update public.kyc_verifications
    set reviewer_id = '33333333-3333-4333-8333-333333333333', review_notes = 'forged review'
    where participant_id = auth.uid()$$,
  'owner reviewer-field tampering is neutralized by the security trigger'
);
select results_eq(
  $$select reviewer_id is null and review_notes = ''
    from public.kyc_verifications where participant_id = auth.uid()$$,
  $$values (true)$$,
  'owner cannot change reviewer identity or notes'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from public.kyc_verifications
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  $$values (0::bigint)$$,
  'staff without reviewer authorization cannot read participant KYC'
);
select lives_ok(
  $$update public.kyc_verifications set status = 'rejected'
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  'staff without reviewer authorization cannot update participant KYC'
);
reset role;
select results_eq(
  $$select status from public.kyc_verifications
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  $$values ('draft'::text)$$,
  'unauthorized staff KYC update has no effect'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select lives_ok(
  $$update public.kyc_verifications
    set status = 'verified', reviewer_id = auth.uid(), review_notes = 'approved by test admin'
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  'trusted administrator can review KYC through the separate reviewer authorization path'
);
reset role;
select results_eq(
  $$select status, reviewer_id, review_notes
    from public.kyc_verifications
    where participant_id = '11111111-1111-4111-8111-111111111111'$$,
  $$values ('verified'::text, '33333333-3333-4333-8333-333333333333'::uuid, 'approved by test admin'::text)$$,
  'trusted administrator review is stored while participant ownership remains separate'
);

-- 24-34: callback consent, ownership, immutable participant state, and staff queue.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.whatsapp_callbacks (participant_id, phone, consent_given, consent_at)
    values (auth.uid(), '+2348000000001', false, now())$$,
  '42501',
  'callback without explicit consent is rejected'
);
select throws_ok(
  $$insert into public.whatsapp_callbacks (participant_id, phone, consent_given, consent_at)
    values ('22222222-2222-4222-8222-222222222222', '+2348000000002', true, now())$$,
  '42501',
  'participant cannot create a callback for another owner'
);
select throws_ok(
  $$insert into public.whatsapp_callbacks (participant_id, phone, consent_given, consent_at, status)
    values (auth.uid(), '+2348000000003', true, now(), 'done')$$,
  '42501',
  'participant cannot set a privileged callback status on insert'
);
select throws_ok(
  $$insert into public.whatsapp_callbacks
      (participant_id, phone, consent_given, consent_at, assigned_staff)
    values (auth.uid(), '+2348000000004', true, now(), '44444444-4444-4444-8444-444444444444')$$,
  '42501',
  'participant cannot self-assign callback staff'
);
select lives_ok(
  $$insert into public.whatsapp_callbacks
      (participant_id, phone, consent_given, consent_at, topic, status)
    values (auth.uid(), '+2348000000005', true, now(), 'pgtap callback', 'queued')$$,
  'participant can create a consented queued callback'
);
select results_eq(
  $$select status, assigned_staff is null
    from public.whatsapp_callbacks
    where participant_id = auth.uid() and topic = 'pgtap callback'$$,
  $$values ('queued'::text, true)$$,
  'callback enters the queue without staff assignment'
);
reset role;
create policy pgtap_permissive_callback_update
  on public.whatsapp_callbacks for update to authenticated using (true) with check (true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$update public.whatsapp_callbacks set status = 'done',
      assigned_staff = '44444444-4444-4444-8444-444444444444'
    where participant_id = auth.uid() and topic = 'pgtap callback'$$,
  'ordinary participant cannot update callback status or assignment through RLS'
);
reset role;
drop policy pgtap_permissive_callback_update on public.whatsapp_callbacks;
select results_eq(
  $$select status, assigned_staff is null
    from public.whatsapp_callbacks
    where participant_id = '11111111-1111-4111-8111-111111111111' and topic = 'pgtap callback'$$,
  $$values ('queued'::text, true)$$,
  'participant callback status and assignment remain unchanged'
);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from public.whatsapp_callbacks where topic = 'pgtap callback'$$,
  $$values (1::bigint)$$,
  'trusted staff can read the callback work queue'
);
select lives_ok(
  $$update public.whatsapp_callbacks set status = 'in_progress', assigned_staff = auth.uid()
    where topic = 'pgtap callback'$$,
  'trusted staff can assign and advance callback work'
);
reset role;
select results_eq(
  $$select status, assigned_staff
    from public.whatsapp_callbacks where topic = 'pgtap callback'$$,
  $$values ('in_progress'::text, '44444444-4444-4444-8444-444444444444'::uuid)$$,
  'staff queue update is visible in the stored callback state'
);

-- 35-39: attempted FAQ self-approval is rejected by the INSERT policy; admins moderate.
create policy pgtap_permissive_faq_insert
  on public.article_faqs for insert to authenticated with check (true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.article_faqs (article_slug, question, submitted_by, status)
    values ('pgtap-fixture', 'Can I approve my own FAQ?', auth.uid(), 'approved')$$,
  '42501',
  'FAQ self-approval is rejected by the pending-only submission policy'
);
select lives_ok(
  $$insert into public.article_faqs (article_slug, question, submitted_by, status)
    values ('pgtap-fixture', 'A moderated question?', auth.uid(), 'pending')$$,
  'participant can submit a FAQ as pending'
);
select results_eq(
  $$select status from public.article_faqs
    where article_slug = 'pgtap-fixture' and question = 'A moderated question?'$$,
  $$values ('pending'::text)$$,
  'FAQ submission is stored pending moderation'
);
reset role;
drop policy pgtap_permissive_faq_insert on public.article_faqs;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select lives_ok(
  $$update public.article_faqs set status = 'approved', moderated_by = auth.uid()
    where article_slug = 'pgtap-fixture' and question = 'A moderated question?'$$,
  'trusted administrator can approve a FAQ'
);
reset role;
select results_eq(
  $$select status from public.article_faqs
    where article_slug = 'pgtap-fixture' and question = 'A moderated question?'$$,
  $$values ('approved'::text)$$,
  'administrator moderation state is stored'
);

-- 40-42: survey response options must exist on an active survey.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.article_survey_responses (survey_id, participant_id, selected_option)
    values ('55555555-5555-4555-8555-555555555555', auth.uid(), 'yes')$$,
  'participant can respond with an active survey option'
);
select throws_ok(
  $$insert into public.article_survey_responses (survey_id, participant_id, selected_option)
    values ('55555555-5555-4555-8555-555555555555', auth.uid(), 'not-an-option')$$,
  '23514',
  'survey response with an invalid option is rejected'
);
select throws_ok(
  $$insert into public.article_survey_responses (survey_id, participant_id, selected_option)
    values ('66666666-6666-4666-8666-666666666666', auth.uid(), 'yes')$$,
  '23503',
  'survey response for an inactive survey is rejected'
);
reset role;

-- 43-50: customer requests are immutable after submission; admins can update status only.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.service_requests
      (id, user_id, service_id, schema_version, status, submitted_payload, idempotency_key, source)
    values
      ('77777777-7777-4777-8777-777777777777', auth.uid(), 'customer-support',
       'customer-support.v1', 'submitted', '{"topic":"pgTAP request"}'::jsonb,
       '88888888-8888-4888-8888-888888888888', 'portal')$$,
  'participant can create a customer service request'
);
create policy pgtap_permissive_service_request_update
  on public.service_requests for update to authenticated using (true) with check (true);
select lives_ok(
  $$update public.service_requests set status = 'resolved'
    where id = '77777777-7777-4777-8777-777777777777'$$,
  'participant cannot change request status even with an added permissive policy'
);
select throws_ok(
  $$update public.service_requests set submitted_payload = '{"forged":true}'::jsonb
    where id = '77777777-7777-4777-8777-777777777777'$$,
  '42501',
  'participant cannot rewrite the submitted request payload'
);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select lives_ok(
  $$update public.service_requests set status = 'rejected'
    where id = '77777777-7777-4777-8777-777777777777'$$,
  'another participant cannot change a request status'
);
reset role;
select results_eq(
  $$select status::text from public.service_requests
    where id = '77777777-7777-4777-8777-777777777777'$$,
  $$values ('submitted'::text)$$,
  'restrictive admin-only guard defeats permissive policy OR for participant writes'
);
drop policy pgtap_permissive_service_request_update on public.service_requests;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","app_metadata":{"role":"admin"}}', true);
select lives_ok(
  $$update public.service_requests set status = 'in_review'
    where id = '77777777-7777-4777-8777-777777777777'$$,
  'trusted administrator can update request status'
);
select throws_ok(
  $$update public.service_requests set submitted_payload = '{"forged":true}'::jsonb
    where id = '77777777-7777-4777-8777-777777777777'$$,
  '42501',
  'administrator status access does not grant request-payload updates'
);
reset role;
select results_eq(
  $$select status::text from public.service_requests
    where id = '77777777-7777-4777-8777-777777777777'$$,
  $$values ('in_review'::text)$$,
  'administrator status transition is stored'
);

-- 51-58: KYC storage ownership, MIME and size checks, private reads, admin-only review.
create policy pgtap_permissive_kyc_storage_insert
  on storage.objects for insert to authenticated with check (true);
create policy pgtap_permissive_kyc_storage_read
  on storage.objects for select to authenticated using (true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('kyc-documents', auth.uid()::text || '/pgtap-owner-document.pdf', auth.uid(),
      '{"mimetype":"application/pdf","size":10485760}'::jsonb)$$,
  'owner can upload an allowed KYC document at the 10 MiB limit'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('kyc-documents', '22222222-2222-4222-8222-222222222222/pgtap-cross-owner.pdf', auth.uid(),
      '{"mimetype":"application/pdf","size":1024}'::jsonb)$$,
  '42501',
  'participant cannot upload a KYC object into another owner folder'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('kyc-documents', auth.uid()::text || '/pgtap-wrong-type.svg', auth.uid(),
      '{"mimetype":"image/svg+xml","size":1024}'::jsonb)$$,
  '42501',
  'KYC upload rejects a MIME type outside the allowlist'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('kyc-documents', auth.uid()::text || '/pgtap-too-large.pdf', auth.uid(),
      '{"mimetype":"application/pdf","size":10485761}'::jsonb)$$,
  '42501',
  'KYC upload rejects a file larger than 10 MiB'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from storage.objects
    where bucket_id = 'kyc-documents'
      and name = '11111111-1111-4111-8111-111111111111/pgtap-owner-document.pdf'$$,
  $$values (0::bigint)$$,
  'another participant cannot read the KYC document'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from storage.objects
    where bucket_id = 'kyc-documents'
      and name = '11111111-1111-4111-8111-111111111111/pgtap-owner-document.pdf'$$,
  $$values (0::bigint)$$,
  'staff without reviewer authorization cannot read a KYC document'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select results_eq(
  $$select count(*)::bigint from storage.objects
    where bucket_id = 'kyc-documents'
      and name = '11111111-1111-4111-8111-111111111111/pgtap-owner-document.pdf'$$,
  $$values (1::bigint)$$,
  'trusted administrator can read a KYC document for review'
);
reset role;
drop policy pgtap_permissive_kyc_storage_insert on storage.objects;
drop policy pgtap_permissive_kyc_storage_read on storage.objects;

select * from finish();
rollback;
