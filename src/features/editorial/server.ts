import { createServerFn } from "@tanstack/react-start";
import { EDITORIAL_POSTS, type EditorialPost } from "@/data/wordpressEditorial";
import { withEditorialImageFallbacks } from "@/features/editorial/images";

type WordPressTerm = {
  id?: number;
  name?: string;
  taxonomy?: string;
};

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

const toEditorialSummary = (post: EditorialPost): EditorialPost => ({
  ...post,
  content: "",
});

const FALLBACK_POSTS = EDITORIAL_POSTS.map(toEditorialSummary);

const stripHtml = (value: string) =>
  decodeEntities(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

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

const getTerms = (post: WordPressPost) =>
  (post._embedded?.["wp:term"] ?? []).flat().filter((term) => term.name);

const getTermNames = (post: WordPressPost, taxonomy: string) =>
  getTerms(post)
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => term.name as string);

const toDateLabel = (value: string | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const normalizePost = (post: WordPressPost, index: number): EditorialPost | null => {
  const title = decodeEntities(stripHtml(post.title?.rendered ?? ""));
  const slug = post.slug?.trim();
  if (!title || !slug) return null;

  const categories = getTermNames(post, "category");
  const tags = getTermNames(post, "post_tag");
  const categoryPath = categories.length > 0 ? categories : ["Indicators"];
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

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
    content: "",
    sourceUrl: post.link ?? `/articles/${slug}`,
    image: featuredMedia?.source_url,
  };
};

const getWordPressEndpoint = () => {
  const baseUrl = import.meta.env.VITE_WORDPRESS_API_URL?.trim();
  if (!baseUrl) return null;

  const endpoint = new URL(baseUrl);
  endpoint.searchParams.set("_embed", "1");
  endpoint.searchParams.set(
    "_fields",
    "id,slug,date,link,title,excerpt,categories,tags,_embedded",
  );
  endpoint.searchParams.set("per_page", "24");
  endpoint.searchParams.set("orderby", "date");
  endpoint.searchParams.set("order", "desc");
  return endpoint;
};

export const getEditorialPosts = createServerFn({ method: "GET" }).handler(async () => {
  const endpoint = getWordPressEndpoint();
  if (!endpoint) return withEditorialImageFallbacks(FALLBACK_POSTS);

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return withEditorialImageFallbacks(FALLBACK_POSTS);

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) return withEditorialImageFallbacks(FALLBACK_POSTS);

    const posts = payload
      .map((post, index) => normalizePost(post as WordPressPost, index))
      .filter((post): post is EditorialPost => post !== null);
    return withEditorialImageFallbacks(
      posts.length > 0 ? posts.map(toEditorialSummary) : FALLBACK_POSTS,
    );
  } catch {
    return withEditorialImageFallbacks(FALLBACK_POSTS);
  }
});
