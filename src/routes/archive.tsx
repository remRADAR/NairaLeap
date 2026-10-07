import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Archive, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorialLayout } from "@/components";
import { getEditorialPosts } from "@/features/editorial/server";
import { mergeStudioArticles, STUDIO_CHANGE_EVENT } from "@/features/editorial/studio";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type ArchiveSearch = { topic?: string };

export const Route = createFileRoute("/archive")({
  validateSearch: (search): ArchiveSearch =>
    typeof search.topic === "string" ? { topic: search.topic } : {},
  loader: async () => ({ posts: await getEditorialPosts() }),
  component: ArticleArchivePage,
});

function ArticleArchivePage() {
  const { topic } = Route.useSearch();
  const { posts } = Route.useLoaderData();
  const [allPosts, setAllPosts] = useState(posts);
  useEffect(() => {
    const refresh = () => setAllPosts(mergeStudioArticles(posts));
    refresh();
    window.addEventListener(STUDIO_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(STUDIO_CHANGE_EVENT, refresh);
  }, [posts]);
  const filteredPosts = topic
    ? allPosts.filter((post) =>
        [post.category, ...post.categoryPath, ...post.tags].some(
          (value) => slugify(value) === topic,
        ),
      )
    : allPosts;

  return (
    <EditorialLayout>
      <section className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="animate__animated animate__fadeInUp mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#7a2ce2] transition hover:gap-3"
            >
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a2ce2]">
              <Archive className="h-3.5 w-3.5" /> Editorial archive
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#242436] sm:text-5xl">
              Every indicator, in one place.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#77778a]">
            Browse the complete local editorial collection by topic, category, or tag.
          </p>
        </div>

        {topic && (
          <div className="animate__animated animate__fadeIn mb-6 flex items-center justify-between rounded-xl border border-[#e8e1f5] bg-[#fbfaff] px-4 py-3">
            <p className="text-xs font-semibold text-[#5d5d72]">
              Showing stories for{" "}
              <span className="text-[#6f23dd]">{topic.replaceAll("-", " ")}</span>
            </p>
            <Link to="/archive" className="text-[11px] font-bold text-[#7a2ce2]">
              Clear filter
            </Link>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <article
                key={post.slug}
                className="editorial-story-card animate__animated animate__fadeInUp group overflow-hidden rounded-2xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)]"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#e7d6ff] to-[#78609f]">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-white/70">
                      <Sparkles className="h-7 w-7" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9292a4]">
                    {post.date}
                  </p>
                  <h2 className="mt-2 line-clamp-3 text-base font-extrabold leading-6 text-[#262638]">
                    <a
                      href={`/articles/${post.slug}`}
                      className="transition-colors hover:text-[#7a2ce2]"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#77778a]">
                    {post.excerpt}
                  </p>
                  <a
                    href={`/articles/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2] transition-all hover:gap-2"
                  >
                    Read story <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="animate__animated animate__fadeIn rounded-2xl border border-dashed border-[#dcd2ef] bg-[#fbfaff] px-6 py-16 text-center">
            <h2 className="text-xl font-extrabold text-[#262638]">No stories match this topic.</h2>
            <Link to="/archive" className="mt-5 inline-flex text-xs font-bold text-[#7a2ce2]">
              View the full archive
            </Link>
          </div>
        )}
      </section>
    </EditorialLayout>
  );
}
