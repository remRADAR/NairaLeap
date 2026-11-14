-- Durable editorial studio state. Public seed content remains in the repository; this
-- migration stores admin-authored overrides and homepage presentation controls.
CREATE TABLE IF NOT EXISTS editorial_articles (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  date_label TEXT NOT NULL,
  category TEXT NOT NULL,
  category_id INTEGER NOT NULL DEFAULT 0,
  category_path TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  source_url TEXT NOT NULL,
  image TEXT,
  author TEXT NOT NULL DEFAULT 'NairaLeap Editorial',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status = 'published'),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS editorial_articles_updated_at_idx
  ON editorial_articles (updated_at DESC);

CREATE TABLE IF NOT EXISTS editorial_categories (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent INTEGER NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 0,
  path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'studio' CHECK (source IN ('wordpress', 'studio')),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS editorial_categories_parent_idx
  ON editorial_categories (parent, name);

CREATE TABLE IF NOT EXISTS editorial_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS editorial_ads (
  slot TEXT PRIMARY KEY NOT NULL CHECK (slot IN ('top', 'bottom')),
  label TEXT NOT NULL DEFAULT 'Advertisement',
  image_url TEXT,
  click_url TEXT,
  alt_text TEXT NOT NULL DEFAULT 'Advertisement',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO editorial_ads (slot, label, alt_text, updated_at)
VALUES
  ('top', 'Advertisement', 'Advertisement', datetime('now')),
  ('bottom', 'Advertisement', 'Advertisement', datetime('now'));
