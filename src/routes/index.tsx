import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorialLayout } from "@/components";
import { getEditorialPosts } from "@/features/editorial/server";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type HomeSearch = { topic?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search): HomeSearch =>
    typeof search.topic === "string" ? { topic: search.topic } : {},
  loader: async () => ({ posts: await getEditorialPosts() }),
  component: EditorialHomePage,
});

function EditorialHomePage() {
  const { topic } = Route.useSearch();
  const { posts } = Route.useLoaderData();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const filteredPosts = topic
    ? posts.filter((post) =>
        [post.category, ...post.categoryPath, ...post.tags].some(
          (value) => slugify(value) === topic,
        ),
      )
    : posts;
  const heroPosts = filteredPosts.slice(0, 5);

  useEffect(() => {
    setHeroIndex(0);
  }, [topic]);

  useEffect(() => {
    if (heroPaused || heroPosts.length < 2) return;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroPosts.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroPaused, heroPosts.length]);

  const hero = heroPosts[heroIndex] ?? filteredPosts[0];

  if (!hero) {
    return (
      <EditorialLayout>
        <section className="mx-auto max-w-[1180px] px-4 py-16 text-center sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            No matching stories
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-[#262638]">
            We couldn&apos;t find articles for this filter.
          </h1>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg bg-[#7a2ce2] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5"
          >
            View all stories
          </Link>
        </section>
      </EditorialLayout>
    );
  }

  const stories = filteredPosts.filter((post) => post.slug !== hero.slug);
  const segmentMap = new Map<string, { label: string; count: number }>();
  stories.forEach((post) => {
    const label = post.categoryPath[0] ?? post.category;
    const current = segmentMap.get(label);
    segmentMap.set(label, { label, count: (current?.count ?? 0) + 1 });
  });
  const segments = Array.from(segmentMap.values()).slice(0, 3);

  return (
    <EditorialLayout>
      {topic && (
        <div className="animate__animated animate__fadeIn mx-auto mt-4 flex max-w-[1180px] items-center justify-between rounded-xl border border-[#e8e1f5] bg-[#fbfaff] px-4 py-3 sm:mt-6 sm:px-6">
          <p className="text-xs font-semibold text-[#5d5d72]">
            Showing stories for <span className="text-[#6f23dd]">{topic.replaceAll("-", " ")}</span>
          </p>
          <Link to="/" className="text-[11px] font-bold text-[#7a2ce2]">
            Clear filter
          </Link>
        </div>
      )}

      <section className="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6">
        <div
          className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[linear-gradient(115deg,#20202d,#555565)] px-6 py-10 text-white shadow-sm sm:min-h-[410px] sm:px-10 sm:py-14"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
          onFocus={() => setHeroPaused(true)}
          onBlur={() => setHeroPaused(false)}
        >
          {hero.image ? (
            <img
              key={hero.image}
              src={hero.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(164,89,255,0.5),transparent_34%),linear-gradient(90deg,rgba(12,12,24,0.78),rgba(18,18,30,0.12))]"
            aria-hidden="true"
          />
          <div
            key={hero.slug}
            className="animate__animated animate__fadeIn relative flex min-h-[290px] max-w-2xl flex-col justify-end sm:min-h-[330px]"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {hero.category}
            </span>
            <p className="text-xs font-medium text-white/70">{hero.date}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">{hero.excerpt}</p>
            <a
              href={`/articles/${hero.slug}`}
              className="interactive-button mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#5f20c9] transition hover:-translate-y-0.5"
            >
              Read story <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          {heroPosts.length > 1 && (
            <div
              className="absolute bottom-5 right-5 flex items-center gap-2"
              aria-label="Featured story controls"
            >
              <button
                type="button"
                aria-label="Previous featured story"
                onClick={() =>
                  setHeroIndex((current) => (current - 1 + heroPosts.length) % heroPosts.length)
                }
                className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5" aria-hidden="true">
                {heroPosts.map((post, index) => (
                  <span
                    key={post.slug}
                    className={`h-1.5 rounded-full transition-all ${index === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/45"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next featured story"
                onClick={() => setHeroIndex((current) => (current + 1) % heroPosts.length)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <div className="animate__animated animate__fadeInUp mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
            <span className="text-[#7a2ce2]">✦</span> Top Stories
          </h2>
          <Link
            to="/archive"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2] transition hover:gap-2"
          >
            Archive <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stories.slice(0, 8).map((post, index) => (
            <article
              key={post.slug}
              className="editorial-story-card animate__animated animate__fadeInUp group overflow-hidden rounded-xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)]"
              style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#d9c7ff] via-[#8f65d9] to-[#34284e]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <p className="mt-2 text-[10px] text-[#9292a4]">{post.date}</p>
                <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-5 text-[#262638]">
                  <a
                    href={`/articles/${post.slug}`}
                    className="transition-colors hover:text-[#7a2ce2]"
                  >
                    {post.title}
                  </a>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {segments.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-4 pb-10 sm:px-6">
          <div className="animate__animated animate__fadeInUp mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
              Explore by segment
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
              Indicator segments
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {segments.map((segment, index) => (
              <a
                key={segment.label}
                href={`/?topic=${slugify(segment.label)}`}
                className="editorial-segment-card animate__animated animate__fadeInUp group rounded-2xl border border-[#ececf3] bg-white p-5 shadow-[0_8px_24px_rgba(43,25,79,0.05)]"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a2ce2]">
                  0{index + 1}
                </span>
                <h3 className="mt-5 line-clamp-2 text-lg font-extrabold leading-6 text-[#262638]">
                  {segment.label}
                </h3>
                <p className="mt-3 text-xs text-[#89899b]">{segment.count} stories to explore</p>
                <ArrowRight className="mt-5 h-4 w-4 text-[#7a2ce2] transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </section>
      )}

      <section id="all-stories" className="mx-auto max-w-[1180px] px-4 pb-8 sm:px-6">
        <div className="animate__animated animate__fadeInUp mb-5 flex items-center justify-between border-b border-[#e9e9f0] pb-3">
          <h2 className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">Latest stories</h2>
          <Link to="/archive" className="text-xs font-bold text-[#7a2ce2]">
            View archive
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {stories.slice(8).map((post, index) => (
            <article
              key={post.slug}
              className="animate__animated animate__fadeInUp flex gap-4 border-b border-[#efeff4] pb-5"
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#e7d6ff] to-[#78609f]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <p className="mt-1 text-[10px] text-[#9292a4]">{post.date}</p>
                <h3 className="mt-1 text-sm font-bold leading-5 text-[#28283a]">
                  <a
                    href={`/articles/${post.slug}`}
                    className="transition-colors hover:text-[#7a2ce2]"
                  >
                    {post.title}
                  </a>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </EditorialLayout>
  );
}
