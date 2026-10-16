import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorialLayout } from "@/components";
import {
  withEditorialImageFallbacks,
  type EditorialPostWithImage,
} from "@/features/editorial/images";
import { mergeStudioArticles, STUDIO_CHANGE_EVENT } from "@/features/editorial/studio";

export const Route = createFileRoute("/articles/$slug")({
  head: async ({ params }) => {
    const { getEditorialPost } = await import("@/data/wordpressEditorial");
    const post = getEditorialPost(params.slug);
    return {
      meta: [
        { title: post ? `${post.title} — Nairaleap` : "Article — Nairaleap" },
        {
          name: "description",
          content: post?.excerpt ?? "Read the latest Nairaleap indicator story.",
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const { EDITORIAL_POSTS, getEditorialPost } = await import("@/data/wordpressEditorial");
    const post = getEditorialPost(params.slug);
    return {
      post: post ? withEditorialImageFallbacks([post])[0] : null,
      allPosts: withEditorialImageFallbacks(mergeStudioArticles(EDITORIAL_POSTS)),
    };
  },
  component: ArticlePage,
});

type ArticleLoaderData = {
  post: EditorialPostWithImage | null;
  allPosts: EditorialPostWithImage[];
};

function ArticlePage() {
  const { slug } = Route.useParams();
  const { post: loadedPost, allPosts: loadedPosts } =
    Route.useLoaderData() as unknown as ArticleLoaderData;
  const [post, setPost] = useState(loadedPost);
  const [allPosts, setAllPosts] = useState(loadedPosts);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { EDITORIAL_POSTS } = await import("@/data/wordpressEditorial");
      const nextPosts = withEditorialImageFallbacks(mergeStudioArticles(EDITORIAL_POSTS));
      if (!active) return;
      setAllPosts(nextPosts);
      setPost(nextPosts.find((item) => item.slug === slug) ?? null);
    };
    void refresh();
    window.addEventListener(STUDIO_CHANGE_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(STUDIO_CHANGE_EVENT, refresh);
    };
  }, [slug]);
  if (!post) return null;
  const postIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const nextPost = allPosts[postIndex + 1];

  return (
    <EditorialLayout>
      <article className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7a2ce2] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all stories
        </Link>
        <header className="mt-8 border-b border-[#e9e9f0] pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a2ce2]">
            {post.category}
          </p>
          <div
            className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-[#858598]"
            aria-label="Category hierarchy"
          >
            {post.categoryPath.map((segment, index) => (
              <span key={`${segment}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                <span>{segment}</span>
              </span>
            ))}
          </div>
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover shadow-[0_12px_28px_rgba(43,25,79,0.12)]"
            />
          )}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#232336] sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#858598]">
            <CalendarDays className="h-4 w-4" /> {post.date}
          </div>
          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Article tags">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f7f2ff] px-3 py-1 text-[11px] font-semibold text-[#6f2bd4]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div className="article-copy mt-9" dangerouslySetInnerHTML={{ __html: post.content }} />
        <section
          aria-labelledby="article-intelligence-status-title"
          data-testid="article-intelligence-availability"
          className="mt-10 rounded-2xl border border-[#e8e1f5] bg-[#fbfaff] p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="article-intelligence-status-title"
              className="text-base font-extrabold text-[#303044] sm:text-lg"
            >
              Evidence &amp; discussion
            </h2>
            <span className="rounded-full bg-[#f2ebff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f23dd]">
              Not enabled
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#66667a]">
            This page shows the migrated article and its original-source link only. Safe source
            retrieval and authenticated, revision-bound editorial review are not connected, so
            evidence submissions, comments, and automated verdicts are unavailable.
          </p>
        </section>
        <footer className="mt-12 border-t border-[#e9e9f0] pt-6">
          <p className="text-xs text-[#858598]">
            Migrated to Nairaleap from the WordPress editorial archive. Read the original source at{" "}
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#7a2ce2] hover:underline"
            >
              the original WordPress article
            </a>
            .
          </p>
          {nextPost && (
            <Link
              to="/articles/$slug"
              params={{ slug: nextPost.slug }}
              className="mt-6 flex items-center justify-between rounded-xl bg-[#f7f2ff] px-4 py-4 text-sm font-bold text-[#5f20c9] hover:bg-[#efe5ff]"
            >
              <span>Next story: {nextPost.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </footer>
      </article>
    </EditorialLayout>
  );
}
