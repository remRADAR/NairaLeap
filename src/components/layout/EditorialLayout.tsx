import { Link } from "@tanstack/react-router";
import { Search, Sun, Moon, ChevronDown, Facebook, Instagram, Send, Youtube } from "lucide-react";
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
  const [active, setActive] = useState<string | null>(null);

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
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-5 sm:px-6">
          <button
            type="button"
            aria-label="Open search"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5]"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link to="/" className="text-center" aria-label="Nairaleap home">
            <span className="block text-2xl font-black tracking-[-0.08em] text-[#6f23dd] sm:text-3xl">
              Nairaleap
            </span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#8f8fa3]">
              Indicator Drivers
            </span>
          </Link>
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setDark((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e5ee] text-[#6e6e82] hover:text-[#8129e5]"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-1 px-4 pb-4 sm:gap-2 sm:px-6">
          {WORDPRESS_MAIN_NAVIGATION.map((section) => {
            const open = active === section.label;
            return (
              <div
                key={section.label}
                className="relative"
                onMouseEnter={() => setActive(section.label)}
                onMouseLeave={() => setActive(null)}
              >
                <a
                  href={`https://nairaleap.ct.ws/category/${slugify(section.label)}/`}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  onClick={(event) => {
                    if (window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) {
                      event.preventDefault();
                      setActive(open ? null : section.label);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#515166] transition hover:bg-[#f3edff] hover:text-[#6f23dd] sm:text-[11px]"
                >
                  {section.label}
                  <ChevronDown className="h-3 w-3" />
                </a>
                {open && (
                  <div className="absolute left-1/2 top-full z-50 grid max-h-[70vh] w-[min(92vw,620px)] -translate-x-1/2 grid-cols-1 gap-4 overflow-y-auto rounded-xl border border-[#e8e1f5] bg-white p-4 text-left shadow-xl sm:grid-cols-3 sm:gap-5 sm:p-5">
                    {section.groups.map((group) => (
                      <div key={group.label}>
                        <a
                          href={`https://nairaleap.ct.ws/category/${slugify(group.label)}/`}
                          className="text-xs font-bold text-[#6f23dd] hover:underline"
                        >
                          {group.label}
                        </a>
                        <ul className="mt-2 space-y-1 border-l border-[#ece5fb] pl-3">
                          {group.items.slice(0, 8).map((item) => (
                            <li key={item}>
                              <a
                                href={`https://nairaleap.ct.ws/category/${slugify(item)}/`}
                                className="text-[11px] leading-5 text-[#77778a] hover:text-[#6f23dd]"
                              >
                                {item}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            to="/services"
            className="ml-1 rounded-md bg-[#7a2ce2] px-4 py-2 text-[11px] font-bold text-white shadow-[0_6px_18px_rgba(122,44,226,0.25)] transition hover:-translate-y-0.5 hover:bg-[#6620c8]"
          >
            Services
          </Link>
        </div>
      </header>
      <div className="border-b border-[#ececf3] bg-white py-2.5">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 overflow-hidden px-4 text-[11px] text-[#77778a] sm:px-6">
          <span className="shrink-0 rounded-full bg-[#eeedf7] px-2 py-1 font-bold text-[#6f23dd]">
            Indicators
          </span>
          <div className="flex min-w-max gap-8">
            {[
              "FRSC commends Dangote Cement on new transport safety policy",
              "UAE envoy: First Abu Dhabi Bank, Etihad Airways will begin Nigeria operations soon",
              "US-Nigeria air strike kills ‘21 ISWAP fighters’ in Borno",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
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
