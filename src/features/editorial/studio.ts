import { EDITORIAL_CATEGORIES, type EditorialCategory } from "@/data/wordpressCategories";
import type { EditorialPost } from "@/data/wordpressEditorial";

export const STUDIO_ARTICLES_KEY = "nairaleap.studio.articles.v1";
export const STUDIO_CATEGORIES_KEY = "nairaleap.studio.categories.v1";
export const STUDIO_CHANGE_EVENT = "nairaleap:studio-change";

export type StudioArticle = EditorialPost & {
  status: "published";
  author: string;
  updatedAt: string;
};

export type StudioCategory = EditorialCategory & {
  source: "wordpress" | "studio";
};

const browserStorage = () => (typeof window === "undefined" ? null : window.localStorage);

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const readStudioArticles = (): StudioArticle[] =>
  safeParse<StudioArticle[]>(browserStorage()?.getItem(STUDIO_ARTICLES_KEY) ?? null, []);

export const readStudioCategories = (): StudioCategory[] => {
  const saved = safeParse<StudioCategory[]>(
    browserStorage()?.getItem(STUDIO_CATEGORIES_KEY) ?? null,
    [],
  );
  if (saved.length > 0) return saved;
  return EDITORIAL_CATEGORIES.map((category) => ({ ...category, source: "wordpress" }));
};

const announceChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STUDIO_CHANGE_EVENT));
  }
};

export const saveStudioArticles = (articles: StudioArticle[]) => {
  browserStorage()?.setItem(STUDIO_ARTICLES_KEY, JSON.stringify(articles));
  announceChange();
};

export const saveStudioCategories = (categories: StudioCategory[]) => {
  browserStorage()?.setItem(STUDIO_CATEGORIES_KEY, JSON.stringify(categories));
  announceChange();
};

export const renameStudioCategory = (
  id: number,
  name: string,
  categories: StudioCategory[],
): StudioCategory[] => {
  const cleanName = name.trim();
  const target = categories.find((category) => category.id === id);
  if (!target || !cleanName) return categories;
  const oldPath = target.path;
  const nextPath = [...oldPath.slice(0, -1), cleanName];
  return categories.map((category) => {
    if (category.id === id) {
      return { ...category, name: cleanName, slug: slugify(cleanName), path: nextPath };
    }
    if (category.path.slice(0, oldPath.length).join("/") === oldPath.join("/")) {
      return {
        ...category,
        path: [...nextPath, ...category.path.slice(oldPath.length)],
      };
    }
    return category;
  });
};

export const deleteStudioCategory = (id: number, categories: StudioCategory[]) => {
  const hasChildren = categories.some((category) => category.parent === id);
  if (hasChildren) return categories;
  return categories.filter((category) => category.id !== id);
};

export const mergeStudioArticles = (posts: EditorialPost[]) => {
  const local = readStudioArticles();
  const localBySlug = new Map(local.map((post) => [post.slug, post]));
  const base = posts.filter((post) => !localBySlug.has(post.slug));
  return [...local, ...base];
};

export const createStudioCategory = (
  name: string,
  parentId: number,
  categories: StudioCategory[],
): StudioCategory => {
  const cleanName = name.trim();
  const slug = slugify(cleanName);
  const parent = categories.find((category) => category.id === parentId);
  const nextId = -Math.max(1, ...categories.map((category) => Math.abs(category.id))) - 1;
  return {
    id: nextId,
    name: cleanName,
    slug,
    parent: parent?.id ?? 0,
    count: 0,
    path: parent ? [...parent.path, cleanName] : [cleanName],
    source: "studio",
  };
};

export const createStudioArticle = (input: {
  title: string;
  category: StudioCategory;
  excerpt: string;
  content: string;
  tags: string[];
  image?: string;
  author: string;
}): StudioArticle => {
  const now = new Date();
  const slugBase = slugify(input.title) || `article-${now.getTime()}`;
  return {
    id: -now.getTime(),
    slug: slugBase,
    title: input.title.trim(),
    date: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(now),
    category: input.category.name,
    categoryId: input.category.id,
    categoryPath: input.category.path,
    tags: input.tags.filter(Boolean),
    excerpt: input.excerpt.trim(),
    content: input.content.trim().replace(/\n/g, "<p>")
      ? `<p>${input.content.trim().replace(/\n+/g, "</p><p>")}</p>`
      : "<p></p>",
    sourceUrl: `/articles/${slugBase}`,
    image: input.image?.trim() || undefined,
    status: "published",
    author: input.author.trim() || "NairaLeap Editorial",
    updatedAt: now.toISOString(),
  };
};
