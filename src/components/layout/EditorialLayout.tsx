import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Facebook,
  Instagram,
  Menu,
  Moon,
  Search,
  Send,
  Sun,
  X,
  Youtube,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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

  return (
    <div
      className={cn(
        "editorial-page min-h-dvh bg-[#fcfcfd] text-[#151523]",
        dark && "editorial-dark",
      )}
    >
      <div className="border-b border-[#ececf3] bg-[#f9007a] px-4 py-2 text-center text-xs font-medium text-white">
        Subscribe to our newsletter &amp; never miss our best posts.{" "}
        <button className="ml-1 font-bold underline underline-offset-2">Subscribe Now!</button>
      </div>
      <header className="border-b border-[#ededf4] bg-white">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e5e5ee] px-3 text-[#626277] transition hover:border-[#d8c9f3] hover:text-[#8129e5]"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Menu</span>
            </button>
            <Link
              to="/articles"
              aria-label="Search articles"
              className="hidden h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5] sm:grid"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
          <Link to="/" className="text-center" aria-label="Nairaleap home">
            <span className="block text-2xl font-black tracking-[-0.08em] text-[#6f23dd] sm:text-3xl">
              Nairaleap
            </span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#8f8fa3]">
              Indicator Drivers
            </span>
          </Link>
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setDark((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5]"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && <EditorialMenu onNavigate={() => setMenuOpen(false)} />}
      </header>
      <div className="border-b border-[#ececf3] bg-white py-2.5">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 overflow-hidden px-4 text-[11px] text-[#77778a] sm:px-6">
          <span className="shrink-0 rounded-full bg-[#eeedf7] px-2 py-1 font-bold text-[#6f23dd]">
            Indicators
          </span>
          <div className="flex min-w-max gap-8 motion-safe:animate-[ticker_42s_linear_infinite]">
            <span>Latest indicators and stories from across Nigeria</span>
            <span aria-hidden="true">•</span>
            <span>Explore the archive by category</span>
            <span aria-hidden="true">•</span>
            <span>Read the latest Nairaleap editorial briefings</span>
          </div>
        </div>
      </div>
      <main>{children}</main>
      <footer className="mt-16 border-t border-[#e9e9f0] bg-white px-4 py-10 text-center text-xs text-[#858598]">
        <div className="flex justify-center gap-4">
          <a href="https://www.facebook.com/" aria-label="Facebook">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://twitter.com/" aria-label="Twitter">
            <Send className="h-4 w-4" />
          </a>
          <a href="https://t.me/" aria-label="Telegram">
            <Send className="h-4 w-4" />
          </a>
          <a href="https://www.instagram.com/" aria-label="Instagram">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://youtube.com/" aria-label="YouTube">
            <Youtube className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Nairaleap — Indicator Drivers</p>
      </footer>
    </div>
  );
}

function EditorialMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav
      aria-label="Editorial menu"
      className="border-t border-[#ededf4] bg-[#fbfaff] px-4 py-4 sm:px-6"
    >
      <div className="mx-auto max-h-[62vh] max-w-[1180px] overflow-y-auto rounded-2xl border border-[#e8e1f5] bg-white p-4 shadow-[0_18px_42px_rgba(43,25,79,0.12)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeaf6] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">Menu</p>
            <p className="mt-1 text-sm font-semibold text-[#303044]">
              Browse the indicator archive by category.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/articles"
              onClick={onNavigate}
              className="rounded-full border border-[#e5dafa] px-3 py-2 text-[11px] font-bold text-[#6f23dd] hover:bg-[#f8f4ff]"
            >
              Article archive
            </Link>
            <Link
              to="/services"
              onClick={onNavigate}
              className="rounded-full bg-[#7a2ce2] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#6620c8]"
            >
              Nairaleap services
            </Link>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORDPRESS_MAIN_NAVIGATION.map((section) => (
            <div key={section.label} className="min-w-0">
              <p className="border-b border-[#eeeaf6] pb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#303044]">
                {section.label}
              </p>
              <div className="mt-3 space-y-4">
                {section.groups.map((group) => (
                  <div key={group.label}>
                    <Link
                      to="/articles"
                      search={{ topic: slugify(group.label) }}
                      onClick={onNavigate}
                      className="text-xs font-bold text-[#6f23dd] hover:underline"
                    >
                      {group.label}
                    </Link>
                    <ul className="mt-2 grid gap-x-3 gap-y-1 border-l border-[#ece5fb] pl-3">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Link
                            to="/articles"
                            search={{ topic: slugify(item) }}
                            onClick={onNavigate}
                            className="text-[11px] leading-5 text-[#77778a] hover:text-[#6f23dd]"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
