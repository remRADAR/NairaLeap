import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, FileQuestion } from "lucide-react";
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
        { title: post ? `${post.title} — Nairaleap` : "Article not found — Nairaleap" },
        {
          name: "description",
          content: post?.excerpt ?? "This article could not be found on Nairaleap.",
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

function ArticlePage() {
  const { slug } = Route.useParams();
  const { post: loadedPost, allPosts: loadedPosts } = Route.useLoaderData();
  const [post, setPost] = useState<EditorialPostWithImage | null>(loadedPost);
  const [allPosts, setAllPosts] = useState<EditorialPostWithImage[]>(loadedPosts);
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

  if (!post) {
    return (
      <EditorialLayout>
        <section className="mx-auto max-w-[820px] px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f7f2ff]">
            <FileQuestion className="h-7 w-7 text-[#7a2ce2]" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            404 — Article not found
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#262638] sm:text-3xl">
            This story doesn&apos;t exist (or was moved).
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77778a]">
            The article you&apos;re looking for may have been renamed, removed, or the link may be
            incorrect. Browse the full archive to find what you need.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 rounded-lg bg-[#7a2ce2] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#6620c8]"
            >
              <ArrowLeft className="h-4 w-4" /> Browse the archive
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e5dafa] px-4 py-2.5 text-xs font-bold text-[#6f23dd] transition hover:bg-[#f8f4ff]"
            >
              Back to homepage
            </Link>
          </div>
        </section>
      </EditorialLayout>
    );
  }

  const postIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const nextPost = allPosts[postIndex + 1];

  return (
    <EditorialLayout>
      <article className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-16">
        <Link
          to="/archive"
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
              alt={post.title}
              fetchPriority="high"
              decoding="async"
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
