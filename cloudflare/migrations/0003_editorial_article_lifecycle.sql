-- Editorial lifecycle for admin-managed articles.
-- Existing published rows remain published; imported WordPress content is still
-- sourced from the repository and is not copied into this table automatically.
ALTER TABLE editorial_articles ADD COLUMN publish_at TEXT;
ALTER TABLE editorial_articles ADD COLUMN created_at TEXT NOT NULL DEFAULT '';

UPDATE editorial_articles
   SET created_at = updated_at
 WHERE created_at = '';

CREATE INDEX IF NOT EXISTS editorial_articles_status_publish_at_idx
  ON editorial_articles (status, publish_at);

-- SQLite cannot alter a CHECK constraint in place. Recreate the table so draft
-- and scheduled rows are accepted while preserving existing records.
CREATE TABLE editorial_articles_lifecycle (
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
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  publish_at TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

INSERT INTO editorial_articles_lifecycle
  (id, slug, title, date_label, category, category_id, category_path, tags,
   excerpt, content, source_url, image, author, status, publish_at, created_at, updated_at)
SELECT id, slug, title, date_label, category, category_id, category_path, tags,
       excerpt, content, source_url, image, author, status, publish_at, created_at, updated_at
  FROM editorial_articles;

DROP TABLE editorial_articles;
ALTER TABLE editorial_articles_lifecycle RENAME TO editorial_articles;

CREATE INDEX IF NOT EXISTS editorial_articles_updated_at_idx
  ON editorial_articles (updated_at DESC);
CREATE INDEX IF NOT EXISTS editorial_articles_status_publish_at_idx
  ON editorial_articles (status, publish_at);
