import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NairaLeapBot } from "../ui/NairaLeapBot";
import { NairaLeapGuideContainer } from "../ui/NairaLeapGuideContainer";
import { LanguageAvailabilityControl } from "../ui/LanguageAvailabilityControl";
import { useAuth } from "@/features/auth";
import { type ServiceId } from "@/features/services/serviceCatalog";
import { NAIRALEAP_SERVICES, NAIRALEAP_CONTACT_EMAIL } from "@/features/brand/brand";

interface AppLayoutProps {
  children: ReactNode;
  serviceId?: ServiceId;
}

/**
 * AppLayout — portal shell.
 * Sticky glass header · portal navigation · main outlet · footer.
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
      <Header compact={Boolean(serviceId)} />
      <main className="min-h-0 flex-1">{children}</main>
      <div className={serviceId ? "lg:hidden" : undefined}>
        <Footer onOpenGuide={() => setGuideOpen(true)} />
      </div>
      <NairaLeapBot onGuide={() => setGuideOpen(true)} />
      <NairaLeapGuideContainer service={null} open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}

function Header({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const closeMenus = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="glass-panel relative flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/services" aria-label="NairaLeap Services home" className="min-w-0 shrink-0">
            <img
              src="/nairaleap-wordmark.png"
              alt="NairaLeap Services"
              className="block h-10 w-[10rem] max-w-full object-contain object-left sm:h-11 sm:w-[13rem]"
            />
          </Link>

          <div
            className={cn(
              "hidden min-w-0 flex-1 items-center justify-end gap-1 text-sm",
              compact ? "lg:hidden" : "lg:flex",
            )}
          >
            <LanguageAvailabilityControl theme="portal" />
            <Link
              to="/services"
              className="portal-nav-link shrink-0 rounded-lg px-3 py-2 text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              Services
            </Link>
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
              aria-label="Go to the NairaLeap main website"
              title="Go to the NairaLeap main website"
              className="portal-nav-link grid h-9 w-9 shrink-0 place-items-center rounded-lg text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className={cn("flex items-center gap-2", !compact && "lg:hidden")}>
            <Link
              to="/"
              aria-label="Go to the NairaLeap main website"
              title="Go to the NairaLeap main website"
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
            aria-label={compact ? "Portal menu" : "Mobile"}
            className="glass-panel flex max-h-[70vh] flex-col overflow-y-auto p-2 text-sm"
          >
            <Link
              to="/services"
              onClick={closeMenus}
              className="portal-nav-link rounded-lg px-3 py-3 font-semibold text-foreground"
            >
              Services
            </Link>
            <div className="border-b border-border/50 px-3 py-3">
              <LanguageAvailabilityControl theme="portal" />
            </div>
            <Link
              to="/"
              onClick={closeMenus}
              className="portal-nav-link rounded-lg px-3 py-3 font-semibold text-foreground"
            >
              Main website
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

type FooterItem = {
  label: string;
  href?: string;
};

function FooterLink({ item }: { item: FooterItem }) {
  const linkClassName =
    "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (item.href.startsWith("/")) {
    return (
      <Link to={item.href} className={linkClassName}>
        {item.label}
      </Link>
    );
  }
  return (
    <a href={item.href} className={linkClassName}>
      {item.label}
    </a>
  );
}

/**
 * Portal footer. Keeps the NairaLeap Services product identity while connecting
 * the portal to the wider NairaLeap ecosystem and linking to the same canonical
 * About, Disclaimer and Privacy Policy routes used by the editorial website.
 */
function Footer({ onOpenGuide }: { onOpenGuide: () => void }) {
  const { user } = useAuth();

  const cols: { title: string; items: FooterItem[] }[] = [
    {
      title: "Platform",
      items: [
        { label: "Explore Services", href: "/services" },
        { label: "NairaLeap Guide" },
        { label: user ? "Customer Workspace" : "Sign in", href: user ? "/dashboard" : "/auth" },
        { label: "Main Website", href: "/" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About NairaLeap", href: "/about" },
        { label: "Contact and Support", href: `mailto:${NAIRALEAP_CONTACT_EMAIL}` },
      ],
    },
    {
      title: "Legal and Trust",
      items: [
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Privacy Policy", href: "/privacy-policy" },
      ],
    },
  ];

  return (
    <footer id="contact" className="mt-16 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="min-w-0">
          <img
            src="/nairaleap-wordmark.png"
            alt="NairaLeap Services"
            className="block h-9 w-[10rem] max-w-full object-contain object-left"
            decoding="async"
          />
          <p className="mt-4 text-sm font-semibold text-foreground">{NAIRALEAP_SERVICES.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            {NAIRALEAP_SERVICES.description}
          </p>
          <Link
            to="/"
            className="mt-3 inline-flex text-sm font-semibold text-primary-glow transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Visit the main NairaLeap website
          </Link>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title} className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.label === "NairaLeap Guide" ? (
                    <button
                      type="button"
                      onClick={onOpenGuide}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      NairaLeap Guide
                    </button>
                  ) : (
                    <FooterLink item={item} />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 border-t border-border/60 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <p>© {new Date().getFullYear()} NairaLeap. All rights reserved.</p>
        <p>NairaLeap Services is part of the NairaLeap ecosystem.</p>
      </div>
    </footer>
  );
}

