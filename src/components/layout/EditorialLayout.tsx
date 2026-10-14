import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  Facebook,
  Instagram,
  Menu,
  Moon,
  Search,
  Send,
  Sun,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { WORDPRESS_MAIN_NAVIGATION } from "@/features/navigation-agent/wordpressMainNavigation";
import { cn } from "@/lib/utils";

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function EditorialLayout({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const routeKey = useRouterState({
    select: (state) => `${state.location.pathname}:${JSON.stringify(state.location.search)}`,
  });

  return (
    <div
      className={cn(
        "editorial-page min-h-dvh bg-[#fcfcfd] text-[#151523]",
        dark && "editorial-dark",
      )}
    >
      <SubscribeBanner />
      <header className="border-b border-[#ededf4] bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <Link to="/" className="flex min-w-0 items-center" aria-label="Nairaleap blog home">
            <img
              src="/nairaleap-wordmark.png"
              alt="Nairaleap"
              className="h-8 w-auto max-w-[11rem] object-contain object-left sm:h-10 sm:max-w-[15rem]"
              decoding="async"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setDark((value) => !value)}
              className="editorial-control grid h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5]"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "editorial-control inline-flex h-10 items-center gap-2 rounded-full border border-[#e5e5ee] px-3 text-[#626277] transition hover:border-[#d8c9f3] hover:text-[#8129e5]",
                menuOpen && "editorial-control-active",
              )}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Menu</span>
            </button>
            <Link
              to="/archive"
              aria-label="Search articles"
              className="editorial-control grid h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5]"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {menuOpen && <EditorialMenu onNavigate={() => setMenuOpen(false)} />}
      </header>
      <LatestTicker />
      <main key={routeKey} className="page-transition">
        {children}
      </main>
      <footer className="mt-16 border-t border-[#e9e9f0] bg-white px-4 py-10 text-center text-xs text-[#858598]">
        <div className="flex justify-center gap-4">
          <a
            href="https://www.facebook.com/"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7a2ce2]"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://twitter.com/"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7a2ce2]"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="https://t.me/"
            aria-label="Telegram"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7a2ce2]"
          >
            <Send className="h-4 w-4" />
          </a>
          <a
            href="https://www.instagram.com/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7a2ce2]"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://youtube.com/"
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7a2ce2]"
          >
            <Youtube className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Nairaleap — Indicator Drivers</p>
      </footer>
    </div>
  );
}

function SubscribeBanner() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.includes("@") && email.includes(".")) {
      setDone(true);
    }
  };

  return (
    <div className="border-b border-[#ececf3] bg-[#f9007a] px-4 py-2 text-center text-xs font-medium text-white">
      {done ? (
        <span>✓ Thanks for subscribing! Check your inbox to confirm.</span>
      ) : open ? (
        <form className="inline-flex items-center gap-2" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-48 rounded-full px-3 py-1 text-xs text-[#262638] outline-none placeholder:text-[#9292a4] sm:w-56"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#f9007a] transition hover:bg-white/90"
          >
            Subscribe
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/70 transition-colors hover:text-white"
            aria-label="Close subscribe form"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <>
          Subscribe to our newsletter &amp; never miss our best posts.{" "}
          <button
            className="ml-1 font-bold underline underline-offset-2 transition hover:text-white/80"
            onClick={() => setOpen(true)}
          >
            Subscribe Now!
          </button>
        </>
      )}
    </div>
  );
}

function LatestTicker() {
  const [items, setItems] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { EDITORIAL_POSTS } = await import("@/data/wordpressEditorial");
        if (!active) return;
        setItems(
          EDITORIAL_POSTS.slice(0, 10).map((post) => ({
            slug: post.slug,
            title: post.title,
          })),
        );
      } catch {
        // Ticker stays hidden if posts can't be loaded
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-[#ececf3] bg-white py-2.5">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 overflow-hidden px-4 text-[11px] text-[#77778a] sm:px-6">
        <span className="shrink-0 rounded-full bg-[#eeedf7] px-2 py-1 font-bold text-[#6f23dd]">
          Latest
        </span>
        <div className="editorial-ticker flex min-w-0 flex-1 overflow-hidden">
          <div className="editorial-ticker-track flex min-w-max gap-8 pr-8">
            {[0, 1].flatMap((copy) =>
              items.map((item) => (
                <Link
                  key={`${copy}-${item.slug}`}
                  to="/articles/$slug"
                  params={{ slug: item.slug }}
                  tabIndex={copy === 1 ? -1 : undefined}
                  aria-hidden={copy === 1}
                  className="whitespace-nowrap transition-colors hover:text-[#7a2ce2]"
                >
                  {item.title}
                </Link>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialMenu({ onNavigate }: { onNavigate: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleSection = (label: string) => {
    setOpenSection((current) => (current === label ? null : label));
    setOpenGroup(null);
  };

  return (
    <nav
      aria-label="Editorial menu"
      className="editorial-menu border-t border-[#ededf4] bg-[#fbfaff] px-4 py-4 sm:px-6"
    >
      <div className="mx-auto max-w-[1180px] rounded-2xl border border-[#e8e1f5] bg-white p-4 shadow-[0_18px_42px_rgba(43,25,79,0.12)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeaf6] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">Menu</p>
            <p className="mt-1 text-sm font-semibold text-[#303044]">
              Browse the indicator archive by category.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/services"
              onClick={onNavigate}
              className="rounded-full bg-[#7a2ce2] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#6620c8]"
            >
              Nairaleap services
            </Link>
            <Link
              to="/admin"
              onClick={onNavigate}
              className="rounded-full border border-[#e5dafa] px-3 py-2 text-[11px] font-bold text-[#6f23dd] hover:bg-[#f8f4ff]"
            >
              Admin Studio
            </Link>
          </div>
        </div>
        <div className="divide-y divide-[#eeeaf6] overflow-hidden rounded-xl border border-[#eeeaf6]">
          {WORDPRESS_MAIN_NAVIGATION.map((section) => {
            const sectionOpen = openSection === section.label;
            return (
              <div key={section.label}>
                <button
                  type="button"
                  aria-expanded={sectionOpen}
                  onClick={() => toggleSection(section.label)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#303044] transition hover:bg-[#faf8ff]"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#7a2ce2] transition-transform",
                      sectionOpen && "rotate-180",
                    )}
                  />
                </button>
                {sectionOpen && (
                  <div className="editorial-menu-section border-t border-[#eeeaf6] bg-[#fcfbff] px-3 py-2">
                    {section.groups.map((group) => {
                      const groupKey = `${section.label}:${group.label}`;
                      const groupOpen = openGroup === groupKey;
                      return (
                        <div key={group.label} className="border-b border-[#f0ecf7] last:border-0">
                          <button
                            type="button"
                            aria-expanded={groupOpen}
                            onClick={() =>
                              setOpenGroup((current) => (current === groupKey ? null : groupKey))
                            }
                            className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#6f23dd] transition hover:bg-[#f8f4ff]"
                          >
                            <span>{group.label}</span>
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform",
                                groupOpen && "rotate-180",
                              )}
                            />
                          </button>
                          {groupOpen && (
                            <ul className="editorial-menu-items grid gap-1 border-l border-[#ece5fb] pb-3 pl-3 sm:grid-cols-2 lg:grid-cols-3">
                              {group.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to="/archive"
                                    search={{ topic: slugify(item) }}
                                    onClick={onNavigate}
                                    className="block rounded-md px-2 py-1.5 text-[11px] leading-5 text-[#77778a] hover:bg-white hover:text-[#6f23dd]"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
