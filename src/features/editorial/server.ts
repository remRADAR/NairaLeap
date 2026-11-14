import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EDITORIAL_POSTS, type EditorialPost } from "@/data/wordpressEditorial";
import { EDITORIAL_CATEGORIES } from "@/data/wordpressCategories";
import { withEditorialImageFallbacks } from "@/features/editorial/images";
import {
  deleteEditorialCategory,
  findEditorialArticle,
  getEditorialD1,
  listEditorialArticles,
  listEditorialCategories,
  mergeCategories,
  readEditorialHomepage,
  toEditorialSummary,
  upsertEditorialArticle,
  upsertEditorialCategory,
  writeEditorialHomepage,
  type EditorialHomepage,
} from "./d1";
import {
  DEFAULT_HOMEPAGE_SETTINGS,
  DEFAULT_STUDIO_ADS,
  type HomepageSettings,
  type StudioAd,
  type StudioArticle,
  type StudioCategory,
} from "./studio";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type WordPressTerm = { id?: number; name?: string; taxonomy?: string };
type WordPressPost = {
  id?: number;
  slug?: string;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  categories?: number[];
  tags?: number[];
  _embedded?: {
    "wp:term"?: WordPressTerm[][];
    "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
  };
};

const stripHtml = (value: string) =>
  decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const decodeEntities = (value: string) =>
  value
    .replace(/&#8217;|&#x2019;/gi, "’")
    .replace(/&#8216;|&#x2018;/gi, "‘")
    .replace(/&#8220;|&#x201c;/gi, "“")
    .replace(/&#8221;|&#x201d;/gi, "”")
    .replace(/&#038;|&#x26;|&amp;/gi, "&")
    .replace(/&#8211;|&#x2013;/gi, "–")
    .replace(/&#8212;|&#x2014;/gi, "—")
    .replace(/&#039;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"');
const getTerms = (post: WordPressPost) => (post._embedded?.["wp:term"] ?? []).flat().filter((term) => term.name);
const getTermNames = (post: WordPressPost, taxonomy: string) =>
  getTerms(post).filter((term) => term.taxonomy === taxonomy).map((term) => term.name as string);
const toDateLabel = (value: string | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
};
const normalizePost = (post: WordPressPost, index: number): EditorialPost | null => {
  const title = decodeEntities(stripHtml(post.title?.rendered ?? ""));
  const slug = post.slug?.trim();
  if (!title || !slug) return null;
  const categories = getTermNames(post, "category");
  const tags = getTermNames(post, "post_tag");
  const categoryPath = categories.length > 0 ? categories : ["Indicators"];
  return {
    id: post.id ?? index,
    slug,
    title,
    date: toDateLabel(post.date),
    category: categoryPath.at(-1) ?? "Indicators",
    categoryId: post.categories?.[0] ?? 0,
    categoryPath,
    tags,
    excerpt: stripHtml(post.excerpt?.rendered ?? ""),
    content: post.content?.rendered ?? "",
    sourceUrl: post.link ?? `/articles/${slug}`,
    image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  };
};

const getWordPressPosts = async (): Promise<EditorialPost[]> => {
  const baseUrl = import.meta.env.VITE_WORDPRESS_API_URL?.trim();
  if (!baseUrl) return EDITORIAL_POSTS;
  const endpoint = new URL(baseUrl);
  endpoint.searchParams.set("_embed", "1");
  endpoint.searchParams.set("_fields", "id,slug,date,link,title,excerpt,content,categories,tags,_embedded");
  endpoint.searchParams.set("per_page", "24");
  endpoint.searchParams.set("orderby", "date");
  endpoint.searchParams.set("order", "desc");
  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) return EDITORIAL_POSTS;
    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) return EDITORIAL_POSTS;
    const posts = payload.map((post, index) => normalizePost(post as WordPressPost, index)).filter((post): post is EditorialPost => post !== null);
    return posts.length > 0 ? posts : EDITORIAL_POSTS;
  } catch {
    return EDITORIAL_POSTS;
  }
};

const mergePublishedArticles = (base: EditorialPost[], saved: StudioArticle[]) => {
  const savedBySlug = new Map(saved.map((post) => [post.slug, post]));
  const remaining = base.filter((post) => !savedBySlug.has(post.slug));
  return [...saved, ...remaining];
};

const slugifyEditorialTerm = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getEditorialPosts = createServerFn({ method: "GET" }).handler(async () => {
  const base = await getWordPressPosts();
  const db = await getEditorialD1();
  if (!db) return withEditorialImageFallbacks(base.map(toEditorialSummary));
  const saved = await listEditorialArticles(db);
  return withEditorialImageFallbacks(mergePublishedArticles(base, saved).map(toEditorialSummary));
});

const editorialArchiveInput = z.object({
  topic: z.string().optional(),
  page: z.number().int().min(1).default(1),
});

export const getEditorialArchivePage = createServerFn({ method: "GET" })
  .validator((input: unknown) => editorialArchiveInput.parse(input))
  .handler(async ({ data }) => {
    const base = await getWordPressPosts();
    const db = await getEditorialD1();
    const saved = db ? await listEditorialArticles(db) : [];
    const posts = withEditorialImageFallbacks(
      mergePublishedArticles(base, saved).map(toEditorialSummary),
    );
    const filtered = data.topic
      ? posts.filter((post) =>
          [post.category, ...post.categoryPath, ...post.tags].some(
            (value) => slugifyEditorialTerm(value) === data.topic,
          ),
        )
      : posts;
    const pageSize = 24;
    const start = (data.page - 1) * pageSize;
    return { posts: filtered.slice(start, start + pageSize), total: filtered.length };
  });

export const getEditorialTagOptions = createServerFn({ method: "GET" }).handler(async () => {
  const posts = await getWordPressPosts();
  return Array.from(new Set(posts.flatMap((post) => post.tags)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 80);
});

const editorialPostInput = z.object({ slug: z.string().min(1).max(240) });
export const getEditorialPostBySlug = createServerFn({ method: "GET" })
  .validator((input: unknown) => editorialPostInput.parse(input))
  .handler(async ({ data }) => {
    const db = await getEditorialD1();
    const saved = db ? await findEditorialArticle(db, data.slug) : null;
    if (saved) return withEditorialImageFallbacks([saved])[0] ?? null;
    const base = await getWordPressPosts();
    const post = base.find((item) => item.slug === data.slug);
    return post ? withEditorialImageFallbacks([post])[0] ?? null : null;
  });

const requireAdmin = async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.app_metadata?.role !== "admin") {
    throw new Error("You must be an admin to manage editorial content.");
  }
  return data.user;
};

export const getEditorialHomepage = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getEditorialD1();
  if (!db) return { settings: DEFAULT_HOMEPAGE_SETTINGS, ads: DEFAULT_STUDIO_ADS };
  return readEditorialHomepage(db);
});

export const getEditorialStudioState = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const db = await getEditorialD1();
  const homepage = db ? await readEditorialHomepage(db) : { settings: DEFAULT_HOMEPAGE_SETTINGS, ads: DEFAULT_STUDIO_ADS };
  const [articles, categories] = db ? await Promise.all([listEditorialArticles(db), listEditorialCategories(db)]) : [[], []];
  return {
    ...homepage,
    articles,
    categories: mergeCategories(categories),
  };
});

const articleInput = z.object({
  title: z.string().trim().min(1).max(240),
  category: z.object({ id: z.number(), name: z.string(), slug: z.string(), parent: z.number(), count: z.number(), path: z.array(z.string()), source: z.enum(["wordpress", "studio"]) }),
  excerpt: z.string().max(600),
  content: z.string().min(1).max(500_000),
  tags: z.array(z.string().max(100)).max(50),
  image: z.string().max(1_500_000).optional(),
  author: z.string().trim().max(120),
});
export const publishEditorialArticle = createServerFn({ method: "POST" })
  .validator((input: unknown) => articleInput.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const now = new Date();
    const slug = data.title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `article-${now.getTime()}`;
    const article: StudioArticle = {
      id: now.getTime(),
      slug,
      title: data.title,
      date: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(now),
      category: data.category.name,
      categoryId: data.category.id,
      categoryPath: data.category.path,
      tags: Array.from(new Set(data.tags.filter(Boolean))),
      excerpt: data.excerpt.trim() || data.content.slice(0, 180),
      content: `<p>${data.content.trim().replace(/\n+/g, "</p><p>")}</p>`,
      sourceUrl: `/articles/${slug}`,
      image: data.image?.trim() || undefined,
      status: "published",
      author: data.author || "NairaLeap Editorial",
      updatedAt: now.toISOString(),
    };
    const db = await getEditorialD1();
    if (!db) throw new Error("Editorial persistence is not configured in this deployment.");
    await upsertEditorialArticle(db, article);
    return { article };
  });

const homepageInput = z.object({
  settings: z.object({ primaryTickerLabel: z.string().trim().min(1).max(80), secondaryTickerTaxonomy: z.string().max(160), carouselTaxonomy: z.string().max(160), carouselLimit: z.number().int().min(3).max(5000) }),
  ads: z.array(z.object({ slot: z.enum(["top", "bottom"]), label: z.string().trim().min(1).max(80), imageUrl: z.string().max(1_500_000), clickUrl: z.string().max(1000), altText: z.string().trim().min(1).max(160), enabled: z.boolean() })).length(2),
});
export const saveEditorialHomepage = createServerFn({ method: "POST" })
  .validator((input: unknown) => homepageInput.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getEditorialD1();
    if (!db) throw new Error("Editorial persistence is not configured in this deployment.");
    const homepage: EditorialHomepage = { settings: data.settings, ads: data.ads as StudioAd[] };
    await writeEditorialHomepage(db, homepage);
    return homepage;
  });

const categoryInput = z.object({ id: z.number().int(), name: z.string().trim().min(1).max(160), slug: z.string().min(1).max(180), parent: z.number().int(), count: z.number().int().min(0), path: z.array(z.string()).min(1), source: z.enum(["wordpress", "studio"]) });
export const saveEditorialCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) => categoryInput.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getEditorialD1();
    if (!db) throw new Error("Editorial persistence is not configured in this deployment.");
    await upsertEditorialCategory(db, data as StudioCategory);
    return data;
  });
export const removeEditorialCategory = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.number().int() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getEditorialD1();
    if (!db) throw new Error("Editorial persistence is not configured in this deployment.");
    await deleteEditorialCategory(db, data.id);
    return { ok: true };
  });

export { EDITORIAL_CATEGORIES };
