-- Founder Voice Engine storage and consent model (Phase D1).
--
-- The Bot's intended vocal identity is the authorised, cloned voice of the
-- NairaLeap founder. This migration provides the data architecture ONLY:
-- voice profiles with consent records, an immutable consent/revocation trail,
-- private sample storage and metadata-only usage logs. It does NOT create any
-- provider account, upload any founder recording, or make any claim that the
-- founder's voice is in use. Enrolment stays disabled until explicit founder
-- authorisation (see src/features/voice-engine/enrolment.ts).

-- Private bucket for founder voice recordings. Never public.
insert into storage.buckets (id, name, public)
values ('voice-samples', 'voice-samples', false)
on conflict (id) do nothing;

create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  profile_type text not null check (profile_type in ('founder', 'system')),
  provider_id text not null,
  external_voice_id text,
  status text not null default 'draft'
    check (status in ('draft', 'pending_consent', 'consent_recorded', 'active', 'revoked', 'deleted')),
  -- Consent reference; the authoritative trail is in voice_consent_events.
  consent_scope text,
  consent_reference text,
  consented_at timestamptz,
  revoked_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.voice_profiles enable row level security;

create policy "voice profiles owner read own"
  on public.voice_profiles for select to authenticated
  using (owner_id = auth.uid());

create policy "voice profiles owner create draft"
  on public.voice_profiles for insert to authenticated
  with check (owner_id = auth.uid() and status = 'draft');

create policy "voice profiles admin full access"
  on public.voice_profiles for all to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- Only trusted admins may activate or revoke a profile: activation means the
-- founder authorisation and testing have been verified server-side.
create or replace function public.voice_profile_guard_status()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.app_is_admin() then
    -- Owners may manage drafts only; consent/activation/revocation decisions
    -- are administrative and require the verified authorisation process.
    if tg_op = 'INSERT' then
      new.status := 'draft';
      new.consent_scope := null;
      new.consent_reference := null;
      new.consented_at := null;
    else
      new.status := old.status;
      new.consent_scope := old.consent_scope;
      new.consent_reference := old.consent_reference;
      new.consented_at := old.consented_at;
      new.revoked_at := old.revoked_at;
      new.deleted_at := old.deleted_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists voice_profile_status_guard on public.voice_profiles;
create trigger voice_profile_status_guard
  before insert or update on public.voice_profiles
  for each row execute function public.voice_profile_guard_status();

-- Immutable consent / revocation / deletion trail.
create table if not exists public.voice_consent_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.voice_profiles (id) on delete cascade,
  event text not null check (event in ('consent_recorded', 'revoked', 'secure_deletion_completed')),
  scope text not null default '',
  reference text not null default '',
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now()
);

alter table public.voice_consent_events enable row level security;
revoke all on table public.voice_consent_events from anon;

create policy "voice consent events owner read"
  on public.voice_consent_events for select to authenticated
  using (
    exists (select 1 from public.voice_profiles p where p.id = profile_id and p.owner_id = auth.uid())
  );

create policy "voice consent events admin read all"
  on public.voice_consent_events for select to authenticated
  using (public.app_is_admin());

-- Written only by the trusted server-side enrolment process (no client insert
-- policy on purpose); a restrictive policy blocks direct client inserts even
-- if a permissive policy appears later.
create policy "voice consent events restrictive insert"
  on public.voice_consent_events as restrictive for insert to public
  with check (public.app_is_admin());

-- Metadata-only usage log. No audio, no transcripts beyond lengths.
create table if not exists public.voice_usage_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.voice_profiles (id) on delete set null,
  request_id text not null,
  character_count int not null default 0,
  latency_ms int,
  status text not null check (status in ('completed', 'failed', 'cancelled', 'text_fallback')),
  provider_id text not null,
  created_at timestamptz not null default now()
);

alter table public.voice_usage_log enable row level security;
revoke all on table public.voice_usage_log from anon;

create policy "voice usage log admin read"
  on public.voice_usage_log for select to authenticated
  using (public.app_is_admin());

create policy "voice usage log engine insert"
  on public.voice_usage_log for insert to authenticated
  with check (
    -- Only operational metadata; must reference an active profile or the fallback.
    (profile_id is null or exists (
      select 1 from public.voice_profiles p
      where p.id = profile_id and p.status in ('active', 'revoked')
    ))
  );

-- Sample storage: owner-scoped folders, audio-only types, 50 MB cap, immutable.
drop policy if exists "voice samples owner upload" on storage.objects;
create policy "voice samples owner upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'voice-samples'
    and (storage.foldername(name))[1] = auth.uid()::text
    and coalesce(metadata ->> 'mimetype', '') in ('audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg')
    and coalesce((metadata ->> 'size')::bigint, 0) between 1 and 52428800
  );

drop policy if exists "voice samples owner read" on storage.objects;
create policy "voice samples owner read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'voice-samples'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.app_is_admin())
  );

-- Secure deletion workflow: owner may delete their own samples; revocation is
-- followed by sample deletion. No update policy (immutable; re-upload instead).
drop policy if exists "voice samples owner delete" on storage.objects;
create policy "voice samples owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'voice-samples'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.app_is_admin())
  );
