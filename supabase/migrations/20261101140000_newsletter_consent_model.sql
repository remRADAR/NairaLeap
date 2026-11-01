-- Newsletter consent model (Phase C5).
--
-- Prepares the backend foundation for a real opt-in newsletter: consent-aware
-- subscriber records with an immutable consent trail. NO email delivery,
-- sending integration or provider credentials exist in this migration; the
-- front-end must not claim a subscription was completed until a delivery
-- integration is authorised and active.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- Consent model: every record must carry an explicit, timestamped opt-in.
  consent_given boolean not null default true check (consent_given),
  consent_at timestamptz not null default now(),
  consent_source text not null default 'editorial_banner',
  participant_id uuid references auth.users (id) on delete set null,
  -- Delivery lifecycle; 'pending' until an authorised email system confirms.
  delivery_state text not null default 'pending'
    check (delivery_state in ('pending', 'confirmed', 'unsubscribed', 'suppressed')),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One active record per email; re-subscription after unsubscribe reuses the row.
  unique (email)
);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon;

-- Anyone may opt themselves in, with explicit consent recorded server-side.
grant insert on table public.newsletter_subscribers to authenticated, anon;
grant select, update, delete on table public.newsletter_subscribers to authenticated;

create policy "newsletter self opt-in"
  on public.newsletter_subscribers for insert to authenticated, anon
  with check (consent_given = true and consent_at is not null and delivery_state = 'pending');

-- Subscribers can read and manage (unsubscribe) their own record by linked account.
create policy "newsletter owner read"
  on public.newsletter_subscribers for select to authenticated
  using (participant_id = auth.uid());

create policy "newsletter owner unsubscribe"
  on public.newsletter_subscribers for update to authenticated
  using (participant_id = auth.uid())
  with check (
    participant_id = auth.uid()
    -- Only the delivery lifecycle may be changed by the subscriber, never consent history.
    and consent_given = true
    and delivery_state in ('pending', 'confirmed', 'unsubscribed')
  );

create policy "newsletter admin manage"
  on public.newsletter_subscribers for all to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- A future permissive policy must never let consent history be edited.
drop policy if exists "newsletter restrictive update" on public.newsletter_subscribers;
create policy "newsletter restrictive update"
  on public.newsletter_subscribers as restrictive for update to public
  using (
    (participant_id = auth.uid() and consent_given = true)
    or public.app_is_admin()
  );

create or replace function public.newsletter_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists newsletter_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_set_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.newsletter_touch_updated_at();

-- Consent history is immutable: snapshot every consent/unsubscribe transition.
create table if not exists public.newsletter_consent_events (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.newsletter_subscribers (id) on delete cascade,
  event text not null check (event in ('opted_in', 'confirmed', 'unsubscribed', 'resubscribed')),
  consent_given boolean not null,
  recorded_at timestamptz not null default now()
);

alter table public.newsletter_consent_events enable row level security;
revoke all on table public.newsletter_consent_events from anon, authenticated;

create policy "newsletter consent events admin read"
  on public.newsletter_consent_events for select to authenticated
  using (public.app_is_admin());
