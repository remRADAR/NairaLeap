-- Security hardening follow-up to 20261101090000.
--
-- Fixes identified in independent review:
--  1. Privilege escalation: participants must never be able to grant
--     themselves (or others) admin/staff roles.
--  2. Provider self-verification: owners may edit business info but never
--     their verification status.
--  3. KYC: identity numbers must not be readable in participant-visible
--     rows; documents stay in a private bucket with explicit storage
--     policies (owner + authorized reviewers only, type/size/ownership
--     validated); reviewer decisions are immutable to owners.
--  4. Editorial/callback policy corrections: FAQ default pending, survey
--     option validity, callback ownership + consent, no self-assignment of
--     staff or status changes by ordinary users.
--
-- Trusted role management: admin-ness is derived from
-- auth.users.raw_app_meta_data (settable ONLY via the Supabase Auth admin
-- API / dashboard, i.e. a trusted server-side administrative process).
-- Participants cannot write raw_app_meta_data, so privilege now has a
-- single trusted source outside user-reachable tables.

create extension if not exists pgcrypto;

-- ------------------------------------------------------- trusted role checks --

create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (auth.uid() is not null)
    and (
      select (raw_app_meta_data ->> 'role') = 'admin'
      from auth.users
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.app_is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (auth.uid() is not null)
    and (
      select coalesce((raw_app_meta_data ->> 'role') in ('staff', 'admin'), false)
      from auth.users
      where id = auth.uid()
    ),
    false
  );
$$;

-- ------------------------------------------------- participant role guarding --

-- Ordinary participants: roles are forced to ['customer'] on insert and are
-- immutable on update. Privileged roles ('staff', 'admin') can only be
-- granted through the trusted admin process (raw_app_meta_data) by an admin.
create or replace function public.participants_guard_roles()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.app_is_admin() then
    if tg_op = 'INSERT' then
      new.roles := array ['customer'];
    else
      -- Ordinary users can never change roles, even to a "harmless" value.
      new.roles := old.roles;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists participants_role_guard on public.participants;
create trigger participants_role_guard
  before insert or update of roles on public.participants
  for each row execute function public.participants_guard_roles();

-- ---------------------------------------------- provider verification locking --

-- Owners may edit business information, but verification_status is only
-- settable by an administrator (trusted reviewer process).
create or replace function public.provider_profiles_guard_verification()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.app_is_admin() then
    if tg_op = 'INSERT' then
      new.verification_status := 'unverified';
    elsif new.verification_status is distinct from old.verification_status then
      raise exception 'Provider verification status can only be changed by an authorized administrator'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists provider_profiles_verification_guard on public.provider_profiles;
create trigger provider_profiles_verification_guard
  before insert or update on public.provider_profiles
  for each row execute function public.provider_profiles_guard_verification();

-- --------------------------------------------------------------- KYC hardening --

-- Identity references use keyed HMAC-SHA-256. The key is stored in Supabase
-- Vault and read only inside this SECURITY DEFINER trigger; it is never sent
-- to, or embedded in, browser code. A missing/short key fails KYC writes shut.
-- Versioned keys let a rotation keep duplicate detection working while old
-- references remain. Never retire an old key while rows still reference it.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.kyc_identity_hmac_key_versions (
  key_version text primary key check (key_version ~ '^v[0-9]+$'),
  vault_secret_name text not null unique,
  is_active boolean not null default false,
  retired_at timestamptz,
  created_at timestamptz not null default now()
);
alter table private.kyc_identity_hmac_key_versions enable row level security;
revoke all on table private.kyc_identity_hmac_key_versions from public, anon, authenticated;
create unique index if not exists kyc_identity_one_active_hmac_key
  on private.kyc_identity_hmac_key_versions (is_active)
  where is_active and retired_at is null;
insert into private.kyc_identity_hmac_key_versions (key_version, vault_secret_name, is_active)
values ('v1', 'nairaleap-kyc-identity-hmac-v1', true)
on conflict (key_version) do nothing;

-- A previous deployment may already have created unsalted SHA-256 references.
-- Move those into a non-API-exposed table so they are not readable in participant
-- rows, and retain them only for duplicate checks until the identity is re-entered.
create table if not exists private.kyc_identity_legacy_hashes (
  verification_id uuid primary key references public.kyc_verifications (id) on delete cascade,
  id_type text not null,
  legacy_sha256 text not null check (legacy_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
alter table private.kyc_identity_legacy_hashes enable row level security;
revoke all on table private.kyc_identity_legacy_hashes from public, anon, authenticated;
create index if not exists kyc_identity_legacy_hash_lookup
  on private.kyc_identity_legacy_hashes (id_type, legacy_sha256);

alter table public.kyc_verifications
  add column if not exists id_number_input text,
  add column if not exists id_number_last4 text,
  add column if not exists id_number_hash text,
  add column if not exists id_number_hash_key_version text;

insert into private.kyc_identity_legacy_hashes (verification_id, id_type, legacy_sha256)
select id, id_type, id_number_hash
from public.kyc_verifications
where id_number_hash is not null
  and id_number_hash_key_version is null
on conflict (verification_id) do nothing;

comment on column public.kyc_verifications.id_number_hash is
  'HMAC-SHA-256 identity reference. The key is held in Supabase Vault; raw identity numbers are never stored.';
comment on column public.kyc_verifications.id_number_hash_key_version is
  'Version of the Vault-backed HMAC key used for id_number_hash; retain old keys until no rows reference them.';
comment on column public.kyc_verifications.id_number_input is
  'Transient write-only identity input. The trigger consumes it and stores only HMAC reference + last four characters.';

create or replace function public.kyc_consume_id_number()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, auth, public, extensions, private, vault, pg_temp
as $$
declare
  cleaned text;
  legacy_digest text;
  active_count integer;
  active_version text;
  active_hash text;
  key_row record;
  candidate_hash text;
begin
  -- Updates unrelated to identity preserve the server-generated reference.
  -- Direct attempts to set the hash, key version, last four, or input are ignored
  -- unless the caller supplies a new raw value for the trigger to consume.
  if tg_op = 'UPDATE' and new.id_number_input is null then
    new.id_number_hash := old.id_number_hash;
    new.id_number_hash_key_version := old.id_number_hash_key_version;
    new.id_number_last4 := old.id_number_last4;
    return new;
  end if;

  cleaned := upper(btrim(coalesce(new.id_number_input, '')));
  if cleaned = '' then
    raise exception 'An identity number is required'
      using errcode = '23502';
  end if;
  if length(cleaned) < 6 then
    raise exception 'Identity number looks too short to be valid'
      using errcode = '23514';
  end if;

  select count(*) into active_count
  from private.kyc_identity_hmac_key_versions
  where is_active and retired_at is null;
  if active_count <> 1 then
    raise exception 'KYC identity HMAC key is not configured'
      using errcode = '55000';
  end if;

  -- Serialize duplicate checks for the same normalized identity to prevent
  -- concurrent submissions from racing past the lookup before the unique index.
  perform pg_advisory_xact_lock(hashtextextended(new.id_type || ':' || cleaned, 0));
  legacy_digest := encode(extensions.digest(convert_to(new.id_type || ':' || cleaned, 'UTF8'), 'sha256'), 'hex');

  for key_row in
    select k.key_version, k.is_active, s.decrypted_secret
    from private.kyc_identity_hmac_key_versions k
    left join vault.decrypted_secrets s on s.name = k.vault_secret_name
    where k.retired_at is null
    order by k.key_version
  loop
    if key_row.decrypted_secret is null
      or octet_length(convert_to(key_row.decrypted_secret, 'UTF8')) < 32 then
      raise exception 'KYC identity HMAC key is missing or invalid'
        using errcode = '55000';
    end if;

    candidate_hash := encode(
      extensions.hmac(
        convert_to(new.id_type || ':' || cleaned, 'UTF8'),
        convert_to(key_row.decrypted_secret, 'UTF8'),
        'sha256'
      ),
      'hex'
    );

    if exists (
      select 1
      from public.kyc_verifications existing
      where existing.id_type = new.id_type
        and existing.id_number_hash_key_version = key_row.key_version
        and existing.id_number_hash = candidate_hash
        and (tg_op = 'INSERT' or existing.id <> new.id)
    ) then
      raise exception 'Identity number is already associated with another participant'
        using errcode = '23505';
    end if;

    if key_row.is_active then
      active_version := key_row.key_version;
      active_hash := candidate_hash;
    end if;
  end loop;

  if active_version is null or active_hash is null then
    raise exception 'KYC identity HMAC key is missing or invalid'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from private.kyc_identity_legacy_hashes legacy
    where legacy.id_type = new.id_type
      and legacy.legacy_sha256 = legacy_digest
      and legacy.verification_id <> new.id
  ) then
    raise exception 'Identity number is already associated with another participant'
      using errcode = '23505';
  end if;

  new.id_number_hash := active_hash;
  new.id_number_hash_key_version := active_version;
  new.id_number_last4 := right(cleaned, 4);
  new.id_number_input := null;
  delete from private.kyc_identity_legacy_hashes where verification_id = new.id;
  return new;
end;
$$;

drop trigger if exists kyc_consume_id_number on public.kyc_verifications;
create trigger kyc_consume_id_number
  before insert or update on public.kyc_verifications
  for each row execute function public.kyc_consume_id_number();

-- If an older foundations migration left raw identity numbers behind, convert
-- them before dropping that column. The operation fails and rolls back if Vault
-- key provisioning is missing or a duplicate is discovered.
do $migration$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'kyc_verifications'
      and column_name = 'id_number'
  ) then
    execute $sql$
      update public.kyc_verifications
      set id_number_input = id_number
      where id_number is not null
        and id_number_input is null
    $sql$;
  end if;
end;
$migration$;

-- Any hash-only legacy values remain private solely for duplicate detection;
-- remove them from the participant-readable KYC row before finalizing the schema.
drop trigger if exists kyc_consume_id_number on public.kyc_verifications;
update public.kyc_verifications
set id_number_hash = null,
    id_number_hash_key_version = null
where id_number_hash_key_version is null
  and id_number_hash is not null;
alter table public.kyc_verifications drop column if exists id_number;
do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.kyc_verifications'::regclass
      and conname = 'kyc_identity_hash_requires_key_version'
  ) then
    alter table public.kyc_verifications
      add constraint kyc_identity_hash_requires_key_version
      check ((id_number_hash is null) = (id_number_hash_key_version is null));
  end if;
end;
$migration$;
create unique index if not exists kyc_identity_hmac_reference_unique
  on public.kyc_verifications (id_type, id_number_hash_key_version, id_number_hash)
  where id_number_hash is not null;
create trigger kyc_consume_id_number
  before insert or update on public.kyc_verifications
  for each row execute function public.kyc_consume_id_number();

-- Reviewer decisions are immutable to owners. Owners may manage their own
-- draft and may attach documents while unverified, but can never touch
-- reviewer_id / review_notes / status transitions decided by review.
create or replace function public.kyc_guard_review()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.app_is_admin() then
    if tg_op = 'INSERT' then
      new.reviewer_id := null;
      new.review_notes := '';
      new.expires_at := null;
      new.status := 'draft';
    else
      new.reviewer_id := old.reviewer_id;
      new.review_notes := old.review_notes;
      new.expires_at := old.expires_at;
      -- Owners may only move their own record within the pre-review states,
      -- and may never flip it into or out of a reviewed state.
      if old.status in ('verified', 'rejected', 'expired') then
        new.status := old.status;
      elsif new.status not in ('draft', 'pending_review') then
        raise exception 'KYC status can only be set to draft or pending_review by the participant'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists kyc_review_guard on public.kyc_verifications;
create trigger kyc_review_guard
  before insert or update on public.kyc_verifications
  for each row execute function public.kyc_guard_review();

-- PostgreSQL combines permissive policies with OR. This restrictive boundary
-- makes owner/admin scope mandatory even if another permissive policy exists.
drop policy if exists "kyc participant and reviewer boundary" on public.kyc_verifications;
create policy "kyc participant and reviewer boundary"
  on public.kyc_verifications as restrictive for all to public
  using (participant_id = auth.uid() or public.app_is_admin())
  with check (participant_id = auth.uid() or public.app_is_admin());

-- ----------------------------------------- KYC storage policies (explicit) --

drop policy if exists "kyc documents owner upload" on storage.objects;
create policy "kyc documents owner upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'kyc-documents'
    -- Ownership: documents live under a folder named with the uploader's uid.
    and (storage.foldername(name))[1] = auth.uid()::text
    -- File type allowlist (images and PDF only).
    and coalesce(metadata ->> 'mimetype', '') in (
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
    )
    -- Size limit: 10 MB.
    and coalesce((metadata ->> 'size')::bigint, 0) between 1 and 10485760
  );

drop policy if exists "kyc documents owner read" on storage.objects;
create policy "kyc documents owner read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'kyc-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.app_is_admin())
  );

drop policy if exists "kyc documents owner delete" on storage.objects;
create policy "kyc documents owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Restrictive policies prevent any other permissive storage.objects policy
-- from making KYC objects public, cross-owner readable, broadly writable, or
-- mutable. Non-KYC buckets are left unchanged by these predicates.
drop policy if exists "kyc documents restrictive select" on storage.objects;
create policy "kyc documents restrictive select"
  on storage.objects as restrictive for select to public
  using (
    bucket_id <> 'kyc-documents'
    or (storage.foldername(name))[1] = auth.uid()::text
    or public.app_is_admin()
  );

drop policy if exists "kyc documents restrictive insert" on storage.objects;
create policy "kyc documents restrictive insert"
  on storage.objects as restrictive for insert to public
  with check (
    bucket_id <> 'kyc-documents'
    or (
      (storage.foldername(name))[1] = auth.uid()::text
      and coalesce(metadata ->> 'mimetype', '') in (
        'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
      )
      and coalesce((metadata ->> 'size')::bigint, 0) between 1 and 10485760
    )
  );

drop policy if exists "kyc documents restrictive update" on storage.objects;
create policy "kyc documents restrictive update"
  on storage.objects as restrictive for update to public
  using (bucket_id <> 'kyc-documents')
  with check (bucket_id <> 'kyc-documents');

drop policy if exists "kyc documents restrictive delete" on storage.objects;
create policy "kyc documents restrictive delete"
  on storage.objects as restrictive for delete to public
  using (
    bucket_id <> 'kyc-documents'
    or (storage.foldername(name))[1] = auth.uid()::text
  );

-- No update policy on purpose: uploaded KYC documents are immutable;
-- replace by delete + re-upload. Signed URLs remain the download path.

-- ------------------------------------------------- editorial policy fixes --

drop policy if exists "article faqs signed in submit" on public.article_faqs;
create policy "article faqs signed in submit"
  on public.article_faqs for insert to authenticated
  with check (
    submitted_by = auth.uid()
    -- Submissions ALWAYS default to pending; moderation is admin-only.
    and status = 'pending'
  );

-- Keep moderation and pending-only submission safe even if another permissive
-- policy is later added to the editorial tables.
drop policy if exists "article faqs restrictive read" on public.article_faqs;
create policy "article faqs restrictive read"
  on public.article_faqs as restrictive for select to public
  using (status = 'approved' or public.app_is_admin());
drop policy if exists "article faqs restrictive insert" on public.article_faqs;
create policy "article faqs restrictive insert"
  on public.article_faqs as restrictive for insert to public
  with check (submitted_by = auth.uid() and status = 'pending');
drop policy if exists "article faqs restrictive update" on public.article_faqs;
create policy "article faqs restrictive update"
  on public.article_faqs as restrictive for update to public
  using (public.app_is_admin())
  with check (public.app_is_admin());
drop policy if exists "article faqs restrictive delete" on public.article_faqs;
create policy "article faqs restrictive delete"
  on public.article_faqs as restrictive for delete to public
  using (public.app_is_admin());

-- Survey responses must select a valid, active option of the referenced survey.
create or replace function public.survey_response_validate_option()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_options jsonb;
begin
  select s.options into v_options
  from public.article_surveys s
  where s.id = new.survey_id and s.active;

  if v_options is null then
    raise exception 'Survey is inactive or does not exist'
      using errcode = '23503';
  end if;
  if not (v_options ? new.selected_option) then
    raise exception 'Selected option is not one of the survey options'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists survey_response_option_check on public.article_survey_responses;
create trigger survey_response_option_check
  before insert on public.article_survey_responses
  for each row execute function public.survey_response_validate_option();

-- ---------------------------------------------------- callback policy fixes --

-- Replace the previous open insert policy: callbacks must be owned by the
-- submitting participant, carry explicit consent, and enter the queue in the
-- 'queued' state with no staff assignment. Ordinary users have NO update
-- policy at all, so they can never alter status or self-assign staff.
drop policy if exists "whatsapp callbacks owner insert with consent" on public.whatsapp_callbacks;
create policy "whatsapp callbacks owner insert with consent"
  on public.whatsapp_callbacks for insert to authenticated
  with check (
    participant_id = auth.uid()
    and consent_given = true
    and consent_at is not null
    and status = 'queued'
    and assigned_staff is null
  );

-- --------------------------------------------------------- staff queue fix --

-- Staff queue access now relies on the trusted role source instead of the
-- user-writable participants.roles array.
drop policy if exists "whatsapp callbacks staff queue access" on public.whatsapp_callbacks;
drop policy if exists "social posts staff read queue" on public.social_posts;
drop policy if exists "social posts staff manage drafts" on public.social_posts;
drop policy if exists "social posts staff update" on public.social_posts;

create policy "whatsapp callbacks staff queue access"
  on public.whatsapp_callbacks for all to authenticated
  using (public.app_is_staff_or_admin())
  with check (public.app_is_staff_or_admin());

-- RLS permissive policies OR together. These restrictive rules ensure that a
-- future broad policy cannot bypass callback ownership, consent, or the staff queue.
drop policy if exists "whatsapp callbacks restrictive read" on public.whatsapp_callbacks;
create policy "whatsapp callbacks restrictive read"
  on public.whatsapp_callbacks as restrictive for select to public
  using (participant_id = auth.uid() or public.app_is_staff_or_admin());
drop policy if exists "whatsapp callbacks restrictive insert" on public.whatsapp_callbacks;
create policy "whatsapp callbacks restrictive insert"
  on public.whatsapp_callbacks as restrictive for insert to public
  with check (
    participant_id = auth.uid()
    and consent_given = true
    and consent_at is not null
    and status = 'queued'
    and assigned_staff is null
  );
drop policy if exists "whatsapp callbacks restrictive update" on public.whatsapp_callbacks;
create policy "whatsapp callbacks restrictive update"
  on public.whatsapp_callbacks as restrictive for update to public
  using (public.app_is_staff_or_admin())
  with check (public.app_is_staff_or_admin());
drop policy if exists "whatsapp callbacks restrictive delete" on public.whatsapp_callbacks;
create policy "whatsapp callbacks restrictive delete"
  on public.whatsapp_callbacks as restrictive for delete to public
  using (public.app_is_staff_or_admin());

create policy "social posts staff read queue"
  on public.social_posts for select to authenticated
  using (public.app_is_staff_or_admin());

create policy "social posts staff manage drafts"
  on public.social_posts for insert to authenticated
  with check (public.app_is_staff_or_admin());

create policy "social posts staff update"
  on public.social_posts for update to authenticated
  using (public.app_is_staff_or_admin());
