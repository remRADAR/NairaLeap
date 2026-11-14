import type { EditorialPost } from "@/data/wordpressEditorial";
import { EDITORIAL_CATEGORIES } from "@/data/wordpressCategories";
import type { HomepageSettings, StudioAd, StudioArticle, StudioCategory } from "./studio";

const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  primaryTickerLabel: "Latest",
  secondaryTickerTaxonomy: "all",
  carouselTaxonomy: "all",
  carouselLimit: 5,
};

const DEFAULT_ADS: StudioAd[] = [
  { slot: "top", label: "Advertisement", imageUrl: "", clickUrl: "", altText: "Advertisement", enabled: true },
  { slot: "bottom", label: "Advertisement", imageUrl: "", clickUrl: "", altText: "Advertisement", enabled: true },
];

type EditorialArticleRow = {
  id: string;
  slug: string;
  title: string;
  date_label: string;
  category: string;
  category_id: number;
  category_path: string;
  tags: string;
  excerpt: string;
  content: string;
  source_url: string;
  image: string | null;
  author: string;
  updated_at: string;
};

type EditorialCategoryRow = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  path: string;
  source: "wordpress" | "studio";
};

type EditorialAdRow = {
  slot: "top" | "bottom";
  label: string;
  image_url: string | null;
  click_url: string | null;
  alt_text: string;
  enabled: number;
};

export type EditorialHomepage = {
  settings: HomepageSettings;
  ads: StudioAd[];
};

export type EditorialStudioState = EditorialHomepage & {
  articles: StudioArticle[];
  categories: StudioCategory[];
};

const getEnv = () =>
  (globalThis as typeof globalThis & { __env__?: { NAIRALEAP_DB?: D1Database } }).__env__;

export const getEditorialD1 = async (): Promise<D1Database | null> => getEnv()?.NAIRALEAP_DB ?? null;

const parseJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const rowToArticle = (row: EditorialArticleRow): StudioArticle => ({
  id: Number(row.id) || 0,
  slug: row.slug,
  title: row.title,
  date: row.date_label,
  category: row.category,
  categoryId: row.category_id,
  categoryPath: parseJson<string[]>(row.category_path, [row.category]),
  tags: parseJson<string[]>(row.tags, []),
  excerpt: row.excerpt,
  content: row.content,
  sourceUrl: row.source_url,
  image: row.image ?? undefined,
  status: "published",
  author: row.author,
  updatedAt: row.updated_at,
});

const rowToCategory = (row: EditorialCategoryRow): StudioCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  parent: row.parent,
  count: row.count,
  path: parseJson<string[]>(row.path, [row.name]),
  source: row.source,
});

const rowToAd = (row: EditorialAdRow): StudioAd => ({
  slot: row.slot,
  label: row.label,
  imageUrl: row.image_url ?? "",
  clickUrl: row.click_url ?? "",
  altText: row.alt_text,
  enabled: row.enabled === 1,
});

export const listEditorialArticles = async (db: D1Database): Promise<StudioArticle[]> => {
  const result = await db
    .prepare(
      `select id, slug, title, date_label, category, category_id, category_path, tags,
              excerpt, content, source_url, image, author, updated_at
         from editorial_articles
        where status = 'published'
        order by updated_at desc
        limit 500`,
    )
    .all<EditorialArticleRow>();
  return result.results.map(rowToArticle);
};

export const findEditorialArticle = async (
  db: D1Database,
  slug: string,
): Promise<StudioArticle | null> => {
  const row = await db
    .prepare(
      `select id, slug, title, date_label, category, category_id, category_path, tags,
              excerpt, content, source_url, image, author, updated_at
         from editorial_articles
        where slug = ?1 and status = 'published'
        limit 1`,
    )
    .bind(slug)
    .first<EditorialArticleRow>();
  return row ? rowToArticle(row) : null;
};

export const upsertEditorialArticle = async (db: D1Database, article: StudioArticle) => {
  await db
    .prepare(
      `insert into editorial_articles
        (id, slug, title, date_label, category, category_id, category_path, tags,
         excerpt, content, source_url, image, author, status, updated_at)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'published', ?14)
       on conflict(slug) do update set
         title = excluded.title, date_label = excluded.date_label, category = excluded.category,
         category_id = excluded.category_id, category_path = excluded.category_path,
         tags = excluded.tags, excerpt = excluded.excerpt, content = excluded.content,
         source_url = excluded.source_url, image = excluded.image, author = excluded.author,
         updated_at = excluded.updated_at`,
    )
    .bind(
      article.id,
      article.slug,
      article.title,
      article.date,
      article.category,
      article.categoryId,
      JSON.stringify(article.categoryPath),
      JSON.stringify(article.tags),
      article.excerpt,
      article.content,
      article.sourceUrl,
      article.image ?? null,
      article.author,
      article.updatedAt,
    )
    .run();
};

export const readEditorialHomepage = async (db: D1Database): Promise<EditorialHomepage> => {
  const [settingsResult, adsResult] = await Promise.all([
    db.prepare("select key, value from editorial_settings where key = 'homepage'").all<{ key: string; value: string }>(),
    db
      .prepare(
        `select slot, label, image_url, click_url, alt_text, enabled
           from editorial_ads
          order by case slot when 'top' then 0 else 1 end
          limit 2`,
      )
      .all<EditorialAdRow>(),
  ]);
  const settings = {
    ...DEFAULT_HOMEPAGE_SETTINGS,
    ...parseJson<Partial<HomepageSettings>>(settingsResult.results[0]?.value ?? "{}", {}),
  };
  const adsBySlot = new Map(adsResult.results.map((row) => [row.slot, rowToAd(row)]));
  return {
    settings,
    ads: DEFAULT_ADS.map((ad) => adsBySlot.get(ad.slot) ?? ad),
  };
};

export const writeEditorialHomepage = async (
  db: D1Database,
  homepage: EditorialHomepage,
): Promise<void> => {
  const now = new Date().toISOString();
  await db
    .prepare(
      `insert into editorial_settings (key, value, updated_at) values ('homepage', ?1, ?2)
       on conflict(key) do update set value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(JSON.stringify(homepage.settings), now)
    .run();
  for (const ad of homepage.ads) {
    await db
      .prepare(
        `insert into editorial_ads (slot, label, image_url, click_url, alt_text, enabled, updated_at)
         values (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         on conflict(slot) do update set label = excluded.label, image_url = excluded.image_url,
           click_url = excluded.click_url, alt_text = excluded.alt_text,
           enabled = excluded.enabled, updated_at = excluded.updated_at`,
      )
      .bind(ad.slot, ad.label, ad.imageUrl || null, ad.clickUrl || null, ad.altText, ad.enabled ? 1 : 0, now)
      .run();
  }
};

export const listEditorialCategories = async (db: D1Database): Promise<StudioCategory[]> => {
  const result = await db
    .prepare("select id, name, slug, parent, count, path, source from editorial_categories order by path limit 1000")
    .all<EditorialCategoryRow>();
  return result.results.map(rowToCategory);
};

export const upsertEditorialCategory = async (db: D1Database, category: StudioCategory) => {
  await db
    .prepare(
      `insert into editorial_categories (id, name, slug, parent, count, path, source, updated_at)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       on conflict(id) do update set name = excluded.name, slug = excluded.slug,
         parent = excluded.parent, count = excluded.count, path = excluded.path,
         source = excluded.source, updated_at = excluded.updated_at`,
    )
    .bind(category.id, category.name, category.slug, category.parent, category.count, JSON.stringify(category.path), category.source, new Date().toISOString())
    .run();
};

export const deleteEditorialCategory = async (db: D1Database, id: number) => {
  await db.prepare("delete from editorial_categories where id = ?1 and source = 'studio'").bind(id).run();
};

export const mergeCategories = (saved: StudioCategory[]): StudioCategory[] => {
  const byId = new Map<number, StudioCategory>(EDITORIAL_CATEGORIES.map((category) => [category.id, { ...category, source: "wordpress" as const }]));
  for (const category of saved) byId.set(category.id, category);
  return Array.from(byId.values()).sort((a, b) => a.path.join("/").localeCompare(b.path.join("/")));
};

export const toEditorialSummary = (post: EditorialPost): EditorialPost => ({ ...post, content: "" });
