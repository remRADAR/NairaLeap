import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { EditorialLayout } from "@/components";
import { EDITORIAL_POSTS, getEditorialPost } from "@/data/wordpressEditorial";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ params }) => {
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
  loader: ({ params }) => {
    const post = getEditorialPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const post = getEditorialPost(slug);
  if (!post) return null;
  const postIndex = EDITORIAL_POSTS.findIndex((item) => item.slug === post.slug);
  const nextPost = EDITORIAL_POSTS[postIndex + 1];

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
