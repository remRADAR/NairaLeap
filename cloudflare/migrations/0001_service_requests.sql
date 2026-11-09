-- NairaLeap data-collection store.
-- Supabase Auth remains the identity provider during this migration phase;
-- user_id therefore stores the stable Supabase auth.users UUID as text.
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft', 'submitted', 'in_review', 'resolved', 'rejected')),
  submitted_payload TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'portal'
    CHECK (source IN ('portal', 'admin', 'integration')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS service_requests_user_id_created_at_idx
  ON service_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS service_requests_created_at_idx
  ON service_requests (created_at DESC);
