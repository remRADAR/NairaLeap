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

-- Protected identity-reference strategy:
--  * The participant-readable row keeps ONLY a SHA-256 reference hash and the
--    last 4 characters for display. Raw identity numbers are never stored in
--    any participant-readable table.
--  * id_number_input exists transiently: the trigger consumes it (hash + last4)
--    and nulls it in the same statement, so the raw value never rests anywhere.

alter table public.kyc_verifications drop column if exists id_number;
alter table public.kyc_verifications
  add column if not exists id_number_input text,     -- transient; forced to NULL by trigger
  add column if not exists id_number_last4 text,
  add column if not exists id_number_hash text;

comment on column public.kyc_verifications.id_number_hash is
  'SHA-256 of (id_type:normalized id number). Non-reversible reference for duplicate detection. Raw identity numbers are never stored.';

create or replace function public.kyc_consume_id_number()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare cleaned text;
begin
  cleaned := coalesce(btrim(upper(new.id_number_input)), '');
  if cleaned = '' and new.id_number_hash is null then
    raise exception 'An identity number is required'
      using errcode = '23502';
  end if;
  if cleaned <> '' then
    if length(cleaned) < 6 then
      raise exception 'Identity number looks too short to be valid'
        using errcode = '23514';
    end if;
    new.id_number_hash := encode(digest(new.id_type || ':' || cleaned, 'sha256'), 'hex');
    new.id_number_last4 := right(cleaned, 4);
  end if;
  new.id_number_input := null;
  return new;
end;
$$;

drop trigger if exists kyc_consume_id_number on public.kyc_verifications;
create trigger kyc_consume_id_number
  before insert or update of id_number_input on public.kyc_verifications
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
    new.reviewer_id := old.reviewer_id;
    new.review_notes := old.review_notes;
    new.expires_at := old.expires_at;
    if tg_op = 'INSERT' then
      new.status := 'draft';
    else
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

create policy "social posts staff read queue"
  on public.social_posts for select to authenticated
  using (public.app_is_staff_or_admin());

create policy "social posts staff manage drafts"
  on public.social_posts for insert to authenticated
  with check (public.app_is_staff_or_admin());

create policy "social posts staff update"
  on public.social_posts for update to authenticated
  using (public.app_is_staff_or_admin());
