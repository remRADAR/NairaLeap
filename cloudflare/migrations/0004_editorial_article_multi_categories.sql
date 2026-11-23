-- Preserve the primary category columns while storing all categories selected in Admin Studio.
ALTER TABLE editorial_articles ADD COLUMN category_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE editorial_articles ADD COLUMN category_paths TEXT NOT NULL DEFAULT '[]';

UPDATE editorial_articles
SET category_ids = json_array(category_id),
    category_paths = json_array(json(category_path))
WHERE category_ids = '[]' OR category_paths = '[]';
