import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { EditorialLayout } from "@/components";
import { EDITORIAL_POSTS } from "@/data/wordpressEditorial";
import { withEditorialImageFallbacks } from "@/features/editorial/images";

const PAGE_SIZE = 24;
const EDITORIAL_POSTS_WITH_IMAGES = withEditorialImageFallbacks(EDITORIAL_POSTS);
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type ArchiveSearch = { topic?: string; page?: number };

export const Route = createFileRoute("/articles")({
  validateSearch: (search): ArchiveSearch => ({
    topic: typeof search.topic === "string" ? search.topic : undefined,
    page: typeof search.page === "number" && search.page > 0 ? search.page : 1,
  }),
  component: ArticleArchivePage,
});

function ArticleArchivePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { topic, page = 1 } = Route.useSearch();
  if (pathname !== "/articles" && pathname.startsWith("/articles/")) {
    return <Outlet />;
  }

  const filtered = topic
    ? EDITORIAL_POSTS_WITH_IMAGES.filter((post) =>
        [post.category, ...post.categoryPath, ...post.tags].some(
          (value) => slugify(value) === topic,
        ),
      )
    : EDITORIAL_POSTS_WITH_IMAGES;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const posts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageLink = (nextPage: number) =>
    `/articles?${new URLSearchParams({ ...(topic ? { topic } : {}), page: String(nextPage) }).toString()}`;

  return (
    <EditorialLayout>
      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7a2ce2] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to homepage
        </Link>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#e9e9f0] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">
              Nairaleap archive
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#252537] sm:text-4xl">
              All articles
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#77778a]">
              Browse the full editorial archive by indicator category. The homepage stays focused;
              every remaining story lives here.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#f7f2ff] px-3 py-2 text-[11px] font-bold text-[#6f23dd]">
            <Search className="h-3.5 w-3.5" /> {filtered.length} stories
          </div>
        </div>
        {topic && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e8e1f5] bg-[#fbfaff] px-4 py-3">
            <p className="text-xs font-semibold text-[#5d5d72]">
              Category: <span className="text-[#6f23dd]">{topic.replaceAll("-", " ")}</span>
            </p>
            <Link to="/articles" className="text-[11px] font-bold text-[#7a2ce2]">
              Clear category
            </Link>
          </div>
        )}
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to="/articles/$slug"
              params={{ slug: post.slug }}
              className="group overflow-hidden rounded-xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,25,79,0.12)]"
            >
              <div className="h-36 bg-gradient-to-br from-[#d9c7ff] via-[#8f65d9] to-[#34284e]">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <p className="mt-2 text-[10px] text-[#9292a4]">{post.date}</p>
                <h2 className="mt-2 line-clamp-3 text-sm font-bold leading-5 text-[#28283a] group-hover:text-[#7a2ce2]">
                  {post.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-[#e9e9f0] pt-5">
          <span className="text-xs text-[#89899b]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a
                href={pageLink(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#e5dafa] px-3 py-2 text-xs font-bold text-[#6f23dd]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a
                href={pageLink(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#7a2ce2] px-3 py-2 text-xs font-bold text-white"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}
