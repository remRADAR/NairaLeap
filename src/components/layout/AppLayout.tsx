import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NairaLeapBot } from "../ui/NairaLeapBot";
import { NairaLeapGuideContainer } from "../ui/NairaLeapGuideContainer";
import { useAuth } from "@/features/auth";
import { SERVICE_CATALOG, type ServiceId } from "@/features/services/serviceCatalog";
import { WORDPRESS_MAIN_NAVIGATION } from "@/features/navigation-agent/wordpressMainNavigation";

interface AppLayoutProps {
  children: ReactNode;
  serviceId?: ServiceId;
}

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * AppLayout — portal shell.
 * Sticky glass header · WordPress-aligned taxonomy navigation · main outlet · footer.
 */
export function AppLayout({ children, serviceId }: AppLayoutProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div
      className={cn(
        "dark flex min-h-dvh flex-col text-foreground",
        serviceId && "service-page-shell",
      )}
      data-app-hydrated={hydrated ? "true" : "false"}
      data-service-id={serviceId}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <div className={serviceId ? "lg:hidden" : undefined}>
        <Footer />
      </div>
      <NairaLeapBot onGuide={() => setGuideOpen(true)} />
      <NairaLeapGuideContainer service={null} open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { user } = useAuth();

  const closeMenus = () => {
    setOpen(false);
    setActiveSection(null);
  };

  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="glass-panel relative flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/services" aria-label="Nairaleap - Service Portal" className="min-w-0 shrink-0">
            <img
              src="/nairaleap-wordmark.png"
              alt="Nairaleap - Service Portal"
              className="block h-10 w-[10rem] max-w-full object-contain object-left sm:h-11 sm:w-[13rem]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-1 text-sm lg:flex">
            <nav aria-label="Primary" className="flex min-w-0 items-center gap-1">
              {WORDPRESS_MAIN_NAVIGATION.map((section) => {
                const isActive = activeSection === section.label;
                return (
                  <div
                    key={section.label}
                    className="relative"
                    onMouseEnter={() => setActiveSection(section.label)}
                  >
                    <Link
                      to="/"
                      hash={`menu-${slugify(section.label)}`}
                      aria-expanded={isActive}
                      aria-haspopup="true"
                      onClick={() => setActiveSection(isActive ? null : section.label)}
                      className="portal-nav-link inline-flex max-w-[9.5rem] items-center gap-1 rounded-lg px-2.5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated hover:text-foreground active:translate-y-0 active:scale-[0.98] xl:max-w-none xl:text-xs"
                    >
                      {section.label}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", isActive && "rotate-180")}
                        aria-hidden="true"
                      />
                    </Link>
                    {isActive && <MegaMenu section={section} onNavigate={closeMenus} />}
                  </div>
                );
              })}
            </nav>
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="portal-nav-link shrink-0 rounded-lg px-3 py-2 text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <a
              href="/admin"
              className="portal-nav-link shrink-0 rounded-lg border border-primary/40 px-3 py-2 text-primary-glow transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              Admin
            </a>
            <Link
              to="/"
              aria-label="Go to Nairaleap blog"
              title="Go to Nairaleap blog"
              className="portal-nav-link grid h-9 w-9 shrink-0 place-items-center rounded-lg text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/"
              aria-label="Go to Nairaleap blog"
              title="Go to Nairaleap blog"
              className="portal-nav-link grid h-10 w-10 place-items-center rounded-xl border border-glass-border bg-glass text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="interactive-button inline-flex h-10 w-10 items-center justify-center rounded-xl border border-glass-border bg-glass text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 lg:hidden",
            open ? "mt-2 max-h-[75vh] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav
            aria-label="Mobile"
            className="glass-panel flex max-h-[70vh] flex-col overflow-y-auto p-2 text-sm"
          >
            {WORDPRESS_MAIN_NAVIGATION.map((section) => {
              const isActive = activeSection === section.label;
              return (
                <div key={section.label} className="border-b border-border/50 last:border-0">
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onClick={() => setActiveSection(isActive ? null : section.label)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-surface-elevated"
                  >
                    {section.label}
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isActive && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {isActive && (
                    <div className="grid gap-3 px-3 pb-4 pt-1 sm:grid-cols-2">
                      {section.groups.map((group) => (
                        <div key={group.label}>
                          <a
                            href={`/?topic=${slugify(group.label)}`}
                            onClick={closeMenus}
                            className="text-sm font-semibold text-primary-glow hover:text-foreground"
                          >
                            {group.label}
                          </a>
                          <ul className="mt-1 space-y-1 border-l border-border/60 pl-3">
                            {group.items.map((item) => (
                              <li key={item}>
                                <a
                                  href={`/?topic=${slugify(item)}`}
                                  onClick={closeMenus}
                                  className="text-xs text-muted-foreground hover:text-foreground"
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
              to="/"
              onClick={closeMenus}
              className="portal-nav-link rounded-lg px-3 py-3 font-semibold text-foreground"
            >
              Blog
            </Link>
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={closeMenus}
              className="portal-nav-link rounded-lg px-3 py-3 text-foreground"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <a
              href="/admin"
              onClick={closeMenus}
              className="portal-nav-link rounded-lg px-3 py-3 text-primary-glow"
            >
              Admin
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function MegaMenu({
  section,
  onNavigate,
}: {
  section: (typeof WORDPRESS_MAIN_NAVIGATION)[number];
  onNavigate: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(78vw,58rem)] rounded-2xl border border-glass-border bg-[color:var(--surface-elevated)]/95 p-5 shadow-[var(--shadow-elevated)] backdrop-blur-2xl"
      onMouseLeave={() => undefined}
    >
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-border/60 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-glow">
            Primary menu
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{section.label}</h2>
        </div>
        <a
          href={`/?topic=${slugify(section.label)}`}
          onClick={onNavigate}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Explore all
        </a>
      </div>
      <div className="grid max-h-[min(62vh,34rem)] grid-cols-2 gap-x-6 gap-y-5 overflow-y-auto pr-2 xl:grid-cols-3">
        {section.groups.map((group) => (
          <div key={group.label}>
            <a
              href={`/?topic=${slugify(group.label)}`}
              onClick={onNavigate}
              className="text-sm font-semibold text-primary-glow hover:text-foreground"
            >
              {group.label}
            </a>
            <ul className="mt-2 space-y-1.5 border-l border-border/60 pl-3">
              {group.items.map((item) => (
                <li key={item}>
                  <a
                    href={`/?topic=${slugify(item)}`}
                    onClick={onNavigate}
                    className="text-xs leading-5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

type FooterItem = {
  label: string;
  href?: string;
  serviceId?: ServiceId;
};

function Footer() {
  const cols: { title: string; items: FooterItem[] }[] = [
    {
      title: "Company",
      items: [{ label: "About", href: "/#about" }, { label: "Careers" }, { label: "Press" }],
    },
    {
      title: "Services",
      items: SERVICE_CATALOG.slice(0, 4).map((service) => ({
        label: service.title,
        serviceId: service.id,
      })),
    },
    {
      title: "Legal",
      items: [{ label: "Privacy" }, { label: "Terms" }, { label: "Cookies" }],
    },
    {
      title: "Contact",
      items: [
        { label: "Support" },
        { label: "Partners" },
        { label: "hello@nairaleap.com", href: "mailto:hello@nairaleap.com" },
      ],
    },
  ];

  return (
    <footer id="contact" className="mt-16 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6">
        {cols.map((col) => (
          <div key={col.title} className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.serviceId ? (
                    <Link
                      to="/services/$service"
                      params={{ service: item.serviceId }}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.label}
                    </Link>
                  ) : item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 border-t border-border/60 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <p>© {new Date().getFullYear()} Nairaleap - Service Portal</p>
        <p>Connected to the main NairaLeap website</p>
      </div>
    </footer>
  );
}
