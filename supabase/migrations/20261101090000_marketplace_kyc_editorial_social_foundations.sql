-- NairaLeap relaunch foundations: marketplace, KYC, editorial engagement,
-- social distribution and language tools (Priorities B-F).
--
-- Design notes:
--  * One auth account = one participant row. Demand-side and supply-side
--    participation is expressed through the roles array, so a single person can
--    be a customer AND a provider without duplicate accounts.
--  * No prices are invented in this migration. Scrap prices and rate cards
--    require owner-supplied values with source + verification dates.
--  * Paid subscriptions are modelled as states only. No payment processing,
--    charging or activation is implemented or enabled.
--  * KYC documents live in a PRIVATE storage bucket; the table stores only a
--    path reference, never document bytes, and never in public buckets.

-- ---------------------------------------------------------------- helpers ---

create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.participants p
    where p.id = auth.uid()
      and 'admin' = any (p.roles)
  );
$$;

-- ---------------------------------------------------- unified participants --

create table if not exists public.participants (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  -- Unified demand/supply-side participation. One account, many roles.
  roles text[] not null default array ['customer']
    check (roles <@ array [
      'customer', 'provider', 'researcher', 'consultant',
      'specialist', 'staff', 'admin'
    ]::text[]),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.participants enable row level security;

create policy "participants read own"
  on public.participants for select
  using (id = auth.uid());

create policy "participants insert own"
  on public.participants for insert
  with check (id = auth.uid());

create policy "participants update own"
  on public.participants for update
  using (id = auth.uid());

create policy "participants admin read all"
  on public.participants for select
  using (public.app_is_admin());

-- ------------------------------------------------------ provider profiles --

create table if not exists public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  business_name text not null,
  service_areas text[] not null default array []::text[],
  description text not null default '',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  unique (participant_id)
);

alter table public.provider_profiles enable row level security;

create policy "provider profiles owner full access"
  on public.provider_profiles for all
  using (participant_id = auth.uid())
  with check (participant_id = auth.uid());

create policy "provider profiles admin full access"
  on public.provider_profiles for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- Verified providers are publicly listable (supply-side discovery).
create policy "provider profiles public read verified"
  on public.provider_profiles for select
  using (verification_status = 'verified');

-- --------------------------------------------------------- provider staff --

create table if not exists public.provider_staff (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references public.provider_profiles (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  role_title text not null default '',
  status text not null default 'invited'
    check (status in ('invited', 'active', 'removed')),
  invited_by uuid references public.participants (id),
  created_at timestamptz not null default now(),
  unique (provider_profile_id, participant_id)
);

alter table public.provider_staff enable row level security;

-- A provider manages its own staff assignments.
create policy "provider staff provider manages"
  on public.provider_staff for all
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

create policy "provider staff member reads own"
  on public.provider_staff for select
  using (participant_id = auth.uid());

create policy "provider staff admin full access"
  on public.provider_staff for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- ------------------------------------------------------ service rate cards --

create table if not exists public.service_rate_cards (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  provider_profile_id uuid references public.provider_profiles (id) on delete set null,
  title text not null,
  unit text not null check (unit in ('per_hour', 'per_day', 'per_job', 'per_month', 'flat')),
  price_naira numeric(14, 2), -- NULL = pending owner/provider approval. Never 0 by default.
  currency text not null default 'NGN',
  status text not null default 'draft'
    check (status in ('draft', 'active', 'retired')),
  effective_from date,
  last_verified_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_rate_cards enable row level security;

create policy "service rate cards public read active"
  on public.service_rate_cards for select
  using (status = 'active');

create policy "service rate cards provider manages own"
  on public.service_rate_cards for all
  using (
    provider_profile_id is not null
    and exists (
      select 1
      from public.provider_profiles pp
      where pp.id = service_rate_cards.provider_profile_id
        and pp.participant_id = auth.uid()
    )
  )
  with check (
    provider_profile_id is not null
    and exists (
      select 1
      from public.provider_profiles pp
      where pp.id = service_rate_cards.provider_profile_id
        and pp.participant_id = auth.uid()
    )
  );

create policy "service rate cards admin full access"
  on public.service_rate_cards for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- --------------------------------------------------------- scrap pricing --

-- A framework only: rates MUST have a source, location, unit, effective date and
-- last-verified date. price_naira may be NULL until the owner researches real
-- market rates. Do NOT fabricate prices into this table.
create table if not exists public.scrap_prices (
  id uuid primary key default gen_random_uuid(),
  material text not null,
  unit text not null check (unit in ('per_kg', 'per_tonne')),
  price_naira numeric(14, 2) check (price_naira is null or price_naira > 0),
  source text not null,          -- named market, dealer or publication
  location text not null,        -- city / state the rate applies to
  effective_date date not null,
  last_verified_date date not null,
  verified_by text not null default 'owner',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scrap_prices enable row level security;

-- Published (priced + sourced) rates are publicly readable for transparency.
create policy "scrap prices public read"
  on public.scrap_prices for select
  using (price_naira is not null);

create policy "scrap prices admin manages"
  on public.scrap_prices for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- ------------------------------------------------- subscriptions/membership --

-- States only. Free is the default. Paid states exist so the owner can plan
-- membership; NOTHING in this migration charges or auto-activates anything.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'free'
    check (status in ('free', 'pending', 'active', 'suspended', 'cancelled')),
  started_at timestamptz,
  cancelled_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, plan)
);

alter table public.subscriptions enable row level security;

create policy "subscriptions owner read"
  on public.subscriptions for select
  using (participant_id = auth.uid());

create policy "subscriptions owner insert free"
  on public.subscriptions for insert
  with check (participant_id = auth.uid() and status = 'free');

create policy "subscriptions admin full access"
  on public.subscriptions for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- ------------------------------------------------------ whatsapp callbacks --

-- Consent-first callback workflow with an internal staff follow-up queue.
-- No external WhatsApp API is connected by this schema; staff work the queue
-- manually until an authorised, verified integration is approved.
create table if not exists public.whatsapp_callbacks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants (id) on delete set null,
  phone text not null,
  consent_given boolean not null default false,
  consent_at timestamptz,
  topic text not null default '',
  message text not null default '',
  status text not null default 'queued'
    check (status in ('queued', 'in_progress', 'done', 'no_response', 'cancelled')),
  assigned_staff uuid references public.participants (id),
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_callbacks enable row level security;

create policy "whatsapp callbacks owner insert with consent"
  on public.whatsapp_callbacks for insert
  with check (consent_given = true);

create policy "whatsapp callbacks owner read own"
  on public.whatsapp_callbacks for select
  using (participant_id = auth.uid());

create policy "whatsapp callbacks staff queue access"
  on public.whatsapp_callbacks for all
  using (
    exists (
      select 1
      from public.participants p
      where p.id = auth.uid()
        and ('staff' = any (p.roles) or 'admin' = any (p.roles))
    )
  )
  with check (
    exists (
      select 1
      from public.participants p
      where p.id = auth.uid()
        and ('staff' = any (p.roles) or 'admin' = any (p.roles))
    )
  );

-- --------------------------------------------------------- KYC verification --

-- Identity workflow: draft -> pending_review -> verified | rejected | expired.
-- Documents go to the PRIVATE 'kyc-documents' storage bucket (created below);
-- only the path is stored here. Full ID numbers are never stored in a public
-- schema-readable location and are only visible to the owner and admins.
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  id_type text not null check (id_type in ('nin', 'drivers_license', 'voters_card', 'passport', 'cac')),
  id_number text not null,
  document_path text,          -- private bucket path; never localStorage, never public
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'verified', 'rejected', 'expired')),
  reviewer_id uuid references public.participants (id),
  review_notes text not null default '',
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, id_type)
);

alter table public.kyc_verifications enable row level security;

create policy "kyc owner insert and update draft"
  on public.kyc_verifications for insert
  with check (participant_id = auth.uid() and status in ('draft', 'pending_review'));

create policy "kyc owner read own"
  on public.kyc_verifications for select
  using (participant_id = auth.uid());

-- Owners may not flip themselves to verified: verification is admin-only.
create policy "kyc owner update own"
  on public.kyc_verifications for update
  using (participant_id = auth.uid())
  with check (
    participant_id = auth.uid()
    and status in ('draft', 'pending_review', 'rejected', 'expired')
  );

create policy "kyc admin full access"
  on public.kyc_verifications for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- Private KYC document bucket (not public). Storage objects governed by
-- bucket-level policies; keep bucket public = false.
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- ------------------------------------------------------- article FAQs -------

create table if not exists public.article_faqs (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  question text not null,
  answer text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references public.participants (id) on delete set null,
  moderated_by uuid references public.participants (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.article_faqs enable row level security;

create policy "article faqs public read approved"
  on public.article_faqs for select
  using (status = 'approved');

create policy "article faqs signed in submit"
  on public.article_faqs for insert
  with check (submitted_by = auth.uid());

create policy "article faqs admin moderate"
  on public.article_faqs for update
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- ------------------------------------------------------ article surveys ----

create table if not exists public.article_surveys (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.article_surveys enable row level security;

create policy "article surveys public read active"
  on public.article_surveys for select
  using (active = true);

create policy "article surveys admin full access"
  on public.article_surveys for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

create table if not exists public.article_survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.article_surveys (id) on delete cascade,
  participant_id uuid references public.participants (id) on delete set null,
  selected_option text not null,
  created_at timestamptz not null default now()
);

alter table public.article_survey_responses enable row level security;

create policy "survey responses anyone submit"
  on public.article_survey_responses for insert
  with check (selected_option <> '');

create policy "survey responses admin read all"
  on public.article_survey_responses for select
  using (public.app_is_admin());

-- -------------------------------------------------- social distribution ----

-- Queue foundation: draft -> pending_approval -> approved -> scheduled ->
-- publishing -> published | failed (retry increments attempts). Publishing is
-- NOT automated: no OAuth credentials or platform permissions exist yet, and
-- no external publishing may be enabled until verified by the owner.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  article_slug text,
  platform text not null check (platform in ('twitter', 'facebook', 'instagram', 'telegram', 'linkedin', 'youtube')),
  content_override text,          -- platform-specific formatting applied at draft time
  status text not null default 'draft'
    check (status in (
      'draft', 'pending_approval', 'approved', 'scheduled',
      'publishing', 'published', 'failed', 'cancelled'
    )),
  scheduled_for timestamptz,
  published_at timestamptz,
  attempts int not null default 0,
  last_error text,
  external_url text,
  created_by uuid references public.participants (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;

create policy "social posts staff read queue"
  on public.social_posts for select
  using (
    exists (
      select 1
      from public.participants p
      where p.id = auth.uid()
        and ('staff' = any (p.roles) or 'admin' = any (p.roles))
    )
  );

create policy "social posts staff manage drafts"
  on public.social_posts for insert
  with check (
    exists (
      select 1
      from public.participants p
      where p.id = auth.uid()
        and ('staff' = any (p.roles) or 'admin' = any (p.roles))
    )
  );

create policy "social posts staff update"
  on public.social_posts for update
  using (
    exists (
      select 1
      from public.participants p
      where p.id = auth.uid()
        and ('staff' = any (p.roles) or 'admin' = any (p.roles))
    )
  );

-- ------------------------------------------------ language tools records --

-- Reviewed vocabulary and translation records with provenance. A language must
-- NOT be represented as fully supported until its content is reviewed
-- (reviewed = true records reviewed by a named reviewer).
create table if not exists public.language_entries (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('hausa', 'igbo', 'yoruba', 'pidgin', 'tiv', 'english')),
  entry_type text not null check (entry_type in ('word', 'phrase', 'translation')),
  source_text text not null,
  target_text text,
  part_of_speech text,
  definition text not null default '',
  provenance text not null default 'community'
    check (provenance in ('owner_reviewed', 'community', 'machine')),
  reviewed boolean not null default false,
  reviewer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.language_entries enable row level security;

create policy "language entries public read reviewed"
  on public.language_entries for select
  using (reviewed = true);

create policy "language entries admin full access"
  on public.language_entries for all
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- updated_at trigger shared by the tables above
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array [
    'participants', 'provider_profiles', 'service_rate_cards', 'scrap_prices',
    'subscriptions', 'whatsapp_callbacks', 'kyc_verifications', 'article_faqs',
    'social_posts', 'language_entries'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;
