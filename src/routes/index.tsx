import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock3, Pause, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorialLayout } from "@/components";
import { EDITORIAL_POSTS } from "@/data/wordpressEditorial";

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
  component: EditorialHomePage,
});

function EditorialHomePage() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { topic } = Route.useSearch();
  const filteredPosts = topic
    ? EDITORIAL_POSTS.filter((post) =>
        [post.category, ...post.categoryPath, ...post.tags].some(
          (value) => slugify(value) === topic,
        ),
      )
    : EDITORIAL_POSTS;
  const homepagePool = (topic ? filteredPosts : EDITORIAL_POSTS).filter((post) => post.image);
  const homepagePosts = homepagePool.slice(0, 10);
  const heroSlides = homepagePosts.slice(0, 5);
  const lead = heroSlides[activeHeroIndex] ?? heroSlides[0];
  const supportingStories = homepagePosts.filter((post) => post.slug !== lead?.slug);
  const tickerPosts = EDITORIAL_POSTS.slice(0, 20);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2 || heroPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroPaused, heroSlides.length, prefersReducedMotion]);

  useEffect(() => {
    setActiveHeroIndex((index) => Math.min(index, Math.max(heroSlides.length - 1, 0)));
  }, [topic, heroSlides.length]);

  const showPreviousHero = () => {
    setActiveHeroIndex((index) => (index - 1 + heroSlides.length) % heroSlides.length);
  };

  const showNextHero = () => {
    setActiveHeroIndex((index) => (index + 1) % heroSlides.length);
  };

  if (!lead) {
    return (
      <EditorialLayout>
        <section className="mx-auto max-w-[1180px] px-4 py-20 text-center sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
            No matching stories
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-[#262638]">
            We couldn&apos;t find articles for this category.
          </h1>
          <Link
            to="/articles"
            className="mt-6 inline-flex rounded-lg bg-[#7a2ce2] px-4 py-2.5 text-xs font-bold text-white"
          >
            Open article archive
          </Link>
        </section>
      </EditorialLayout>
    );
  }

  return (
    <EditorialLayout>
      <section className="mx-auto max-w-[1180px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        {topic && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e8e1f5] bg-[#fbfaff] px-4 py-3">
            <p className="text-xs font-semibold text-[#5d5d72]">
              Showing {homepagePosts.length} stories for{" "}
              <span className="text-[#6f23dd]">{topic.replaceAll("-", " ")}</span>
            </p>
            <Link to="/" className="text-[11px] font-bold text-[#7a2ce2]">
              Clear category
            </Link>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">
              Nairaleap editorial desk
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#252537] sm:text-3xl">
              What is shaping Nigeria today
            </h1>
          </div>
          <Link
            to="/articles"
            className="hidden items-center gap-1 text-xs font-bold text-[#7a2ce2] sm:inline-flex"
          >
            Archive <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
          <section
            aria-label="Featured stories"
            aria-roledescription="carousel"
            className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[#272638] text-white shadow-[0_16px_40px_rgba(43,25,79,0.14)] sm:min-h-[400px]"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocus={() => setHeroPaused(true)}
            onBlur={() => setHeroPaused(false)}
          >
            {lead.image && (
              <img
                src={lead.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-65 transition-opacity duration-500"
              />
            )}
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,17,31,0.94),rgba(18,17,31,0.3)),linear-gradient(0deg,rgba(18,17,31,0.92),transparent_65%)]"
              aria-hidden="true"
            />
            <div className="relative flex min-h-[360px] max-w-2xl flex-col justify-end p-6 pb-20 sm:min-h-[400px] sm:p-9 sm:pb-24">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {lead.category}
              </span>
              <p className="text-xs font-medium text-white/70">{lead.date}</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">
                {lead.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{lead.excerpt}</p>
              <Link
                to="/articles/$slug"
                params={{ slug: lead.slug }}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#5f20c9] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#272638]"
              >
                Read story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {heroSlides.length > 1 && (
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between gap-3 sm:left-9 sm:right-9">
                <div className="flex items-center gap-2" aria-label="Choose featured story">
                  {heroSlides.map((post, index) => (
                    <button
                      key={post.slug}
                      type="button"
                      aria-label={`Show featured story ${index + 1}: ${post.title}`}
                      aria-current={index === activeHeroIndex ? "true" : undefined}
                      onClick={() => setActiveHeroIndex(index)}
                      className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        index === activeHeroIndex
                          ? "w-7 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous featured story"
                    onClick={showPreviousHero}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={
                      heroPaused
                        ? "Resume featured story autoplay"
                        : "Pause featured story autoplay"
                    }
                    onClick={() => setHeroPaused((paused) => !paused)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {heroPaused ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Next featured story"
                    onClick={showNextHero}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
          <aside className="rounded-2xl border border-[#ebe8f2] bg-white p-5 shadow-[0_10px_26px_rgba(43,25,79,0.06)]">
            <div className="flex items-center justify-between border-b border-[#eeeaf6] pb-3">
              <h2 className="text-sm font-extrabold text-[#29293b]">Latest indicators</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9a98aa]">
                <Clock3 className="h-3.5 w-3.5" /> Live desk
              </span>
            </div>
            <div className="divide-y divide-[#f0eef5]">
              {tickerPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.slug}
                  to="/articles/$slug"
                  params={{ slug: post.slug }}
                  className="block py-3 first:pt-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a2ce2]">
                    {post.category}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-[#303044] hover:text-[#6f23dd]">
                    {post.title}
                  </p>
                  <p className="mt-1 text-[10px] text-[#9a98aa]">{post.date}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <AdSlot label="Advertisement" />

      <section className="border-y border-[#eceaf2] bg-white py-3">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 overflow-hidden px-4 sm:px-6">
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a2ce2]">
            20 on the desk
          </span>
          <div className="ticker-track flex min-w-max gap-8 motion-safe:animate-[ticker_70s_linear_infinite]">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 gap-8" aria-hidden={copy === 1}>
                {tickerPosts.map((post) => (
                  <Link
                    key={`${copy}-${post.slug}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    to="/articles/$slug"
                    params={{ slug: post.slug }}
                    className="text-xs font-semibold text-[#626277] hover:text-[#7a2ce2]"
                  >
                    {post.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-9 sm:px-6">
        <div className="mb-5 flex items-end justify-between border-b border-[#e9e9f0] pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
              Curated now
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
              Top stories
            </h2>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2]"
          >
            View archive <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportingStories.slice(0, 4).map((post) => (
            <StoryCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between border-b border-[#e9e9f0] pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2ce2]">
              More from the desk
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
              More perspectives
            </h2>
          </div>
          <span className="text-xs text-[#89899b]">5 additional stories</span>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {supportingStories.slice(4, 9).map((post) => (
            <Link
              key={post.slug}
              to="/articles/$slug"
              params={{ slug: post.slug }}
              className="group flex min-w-[286px] snap-start gap-4 rounded-xl border border-[#eeeaf5] bg-white p-3 shadow-[0_6px_18px_rgba(43,25,79,0.04)] transition hover:-translate-y-0.5 hover:border-[#d9c7f5] hover:shadow-[0_10px_24px_rgba(43,25,79,0.08)] sm:min-w-[320px] lg:min-w-0 lg:flex-1"
            >
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#e7d6ff]">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
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
            </Link>
          ))}
        </div>
      </section>

      <AdSlot label="Advertisement" />
    </EditorialLayout>
  );
}

function AdSlot({ label }: { label: string }) {
  return (
    <section aria-label={label} className="mx-auto max-w-[1180px] px-4 py-3 sm:px-6">
      <div className="flex min-h-[104px] items-center justify-center border-y border-dashed border-[#dcd8e8] bg-[#fbfaff] px-4 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa6b8]">
          {label}
        </span>
      </div>
    </section>
  );
}

function StoryCard({ post }: { post: (typeof EDITORIAL_POSTS)[number] }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#ececf3] bg-white shadow-[0_8px_24px_rgba(43,25,79,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,25,79,0.12)]">
      <div className="h-36 bg-gradient-to-br from-[#d9c7ff] via-[#8f65d9] to-[#34284e]">
        {post.image && (
          <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7a2ce2]">
          {post.category}
        </p>
        <p className="mt-2 text-[10px] text-[#9292a4]">{post.date}</p>
        <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-5 text-[#262638]">
          <Link to="/articles/$slug" params={{ slug: post.slug }} className="hover:text-[#7a2ce2]">
            {post.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
