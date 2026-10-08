import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorialLayout } from "@/components";
import { getEditorialPosts } from "@/features/editorial/server";
import { withEditorialImageFallbacks } from "@/features/editorial/images";
import {
  mergeStudioArticles,
  readHomepageSettings,
  STUDIO_CHANGE_EVENT,
  type HomepageSettings,
} from "@/features/editorial/studio";

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
  const [allPosts, setAllPosts] = useState(posts);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(readHomepageSettings);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setAllPosts(withEditorialImageFallbacks(mergeStudioArticles(posts)));
      setHomepageSettings(readHomepageSettings());
    };
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
  // The homepage is a showcase, not a second archive: only the first ten
  // editorial posts belong here. Everything else remains in /archive.
  const featuredPosts = filteredPosts.slice(0, 10);
  const heroPosts = featuredPosts.slice(0, 5);
  const matchesTaxonomy = (post: (typeof allPosts)[number], taxonomy: string) =>
    taxonomy === "all" || post.category === taxonomy || post.categoryPath.includes(taxonomy);
  const secondaryTickerPosts = allPosts
    .filter((post) => matchesTaxonomy(post, homepageSettings.secondaryTickerTaxonomy))
    .slice(0, 6);
  const carouselPosts = allPosts
    .filter((post) => matchesTaxonomy(post, homepageSettings.carouselTaxonomy))
    .slice(0, Math.max(3, Math.min(5000, homepageSettings.carouselLimit)));

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

  const stories = featuredPosts.filter((post) => post.slug !== hero.slug);

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

      <section
        aria-label="Featured story"
        className="editorial-hero mx-auto w-full max-w-[1180px] px-4 pt-6 sm:px-6 lg:px-8"
      >
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
              className="editorial-hero-media absolute inset-0 h-full w-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(164,89,255,0.5),transparent_34%),linear-gradient(90deg,rgba(12,12,24,0.78),rgba(18,18,30,0.12))]"
            aria-hidden="true"
          />
          <div
            key={hero.slug}
            className="editorial-hero-copy animate__animated animate__fadeIn relative flex min-h-[290px] max-w-2xl flex-col justify-end sm:min-h-[330px]"
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

      <AdSlot label="Advertisement" />

      <section aria-label="Taxonomy ticker" className="border-b border-[#eceaf2] bg-[#fbfaff] py-3">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 overflow-hidden px-4 sm:px-6">
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a2ce2]">
            {homepageSettings.secondaryTickerTaxonomy === "all"
              ? "Latest"
              : homepageSettings.secondaryTickerTaxonomy}
          </span>
          <div className="ticker-track flex min-w-max gap-8 motion-safe:animate-[ticker_85s_linear_infinite]">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 gap-8" aria-hidden={copy === 1}>
                {secondaryTickerPosts.map((post) => (
                  <a
                    key={`${copy}-${post.slug}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    href={`/articles/${post.slug}`}
                    className="text-xs font-semibold text-[#626277] hover:text-[#7a2ce2]"
                  >
                    {post.title}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-story-grid editorial-below-fold mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
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
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {stories.map((post, index) => (
            <article
              key={post.slug}
              className="editorial-story-card group min-w-0 overflow-hidden rounded-xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,25,79,0.12)]"
              style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#d9c7ff] via-[#8f65d9] to-[#34284e]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <Link
                  to="/archive"
                  search={{ topic: slugify(post.category) }}
                  className="text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7a2ce2] hover:underline"
                >
                  {post.category}
                </Link>
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

      <section
        aria-label="More perspectives"
        className="editorial-below-fold mx-auto max-w-[1180px] px-4 pb-10 sm:px-6"
      >
        <div className="mb-5 flex items-end justify-between border-b border-[#e9e9f0] pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
              More from the desk
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
              More perspectives
            </h2>
          </div>
          <span className="text-xs text-[#89899b]">
            {carouselPosts.length}{" "}
            {homepageSettings.carouselTaxonomy === "all" ? "additional stories" : "stories"}
          </span>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {carouselPosts.map((post) => (
            <a
              key={post.slug}
              href={`/articles/${post.slug}`}
              className="editorial-segment-card group flex min-w-[286px] snap-start gap-4 rounded-xl border border-[#eeeaf5] bg-white p-3 shadow-[0_6px_18px_rgba(43,25,79,0.04)] transition hover:-translate-y-0.5 hover:border-[#d9c7f5] hover:shadow-[0_10px_24px_rgba(43,25,79,0.08)] sm:min-w-[320px] lg:min-w-0 lg:flex-1"
            >
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#e7d6ff]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a2ce2]">
                  {post.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#28283a] group-hover:text-[#7a2ce2]">
                  {post.title}
                </h3>
                <p className="mt-1 text-[10px] text-[#9292a4]">{post.date}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <AdSlot label="Advertisement" />

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-t border-[#e9e9f0] pt-5">
          <p className="text-xs text-[#77778a]">Showing 10 featured stories</p>
          <Link
            to="/archive"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2]"
          >
            Browse all articles <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </EditorialLayout>
  );
}

function AdSlot({ label }: { label: string }) {
  return (
    <section
      aria-label={label}
      className="editorial-ad-slot mx-auto max-w-[1180px] px-4 py-3 sm:px-6"
    >
      <div className="flex min-h-[104px] items-center justify-center border-y border-dashed border-[#dcd8e8] bg-[#fbfaff] px-4 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa6b8]">
          {label}
        </span>
      </div>
    </section>
  );
}
