import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NairaLeapBot } from "../ui/NairaLeapBot";
import { NairaLeapGuideContainer } from "../ui/NairaLeapGuideContainer";
import { useAuth } from "@/features/auth";
import { SERVICE_CATALOG, type ServiceId } from "@/features/services/serviceCatalog";

interface AppLayoutProps {
  children: ReactNode;
  serviceId?: ServiceId;
}

/**
 * AppLayout — portal shell.
 * Sticky glass header · portal-focused navigation · main outlet · footer.
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
        <Footer />
      </div>
      <NairaLeapBot onGuide={() => setGuideOpen(true)} />
      <NairaLeapGuideContainer service={null} open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}

function Header({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="glass-panel relative flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/services" aria-label="Nairaleap — Service Portal" className="min-w-0 shrink-0">
            <img
              src="/nairaleap-wordmark.png"
              alt="Nairaleap — Service Portal"
              className="block h-10 w-[10rem] max-w-full object-contain object-left sm:h-11 sm:w-[13rem]"
            />
          </Link>

          {/* Desktop nav — portal-focused: Sign in + Admin only */}
          <div
            className={cn(
              "hidden min-w-0 flex-1 items-center justify-end gap-2 text-sm",
              compact ? "lg:hidden" : "lg:flex",
            )}
          >
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="portal-nav-link shrink-0 rounded-lg px-4 py-2 font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <a
              href="/admin"
              className="portal-nav-link shrink-0 rounded-lg border border-primary/40 px-4 py-2 font-medium text-primary-glow transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              Admin
            </a>
          </div>

          {/* Mobile nav — menu toggle only */}
          <div className={cn("flex items-center gap-2", !compact && "lg:hidden")}>
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

        {/* Mobile dropdown — portal-focused: Services + Sign in + Admin */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 lg:hidden",
            open ? "mt-2 max-h-[75vh] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav
            aria-label="Portal menu"
            className="glass-panel flex max-h-[70vh] flex-col overflow-y-auto p-2 text-sm"
          >
            <Link
              to="/services"
              onClick={closeMenu}
              className="portal-nav-link rounded-lg px-3 py-3 font-semibold text-foreground"
            >
              Services
            </Link>
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={closeMenu}
              className="portal-nav-link rounded-lg px-3 py-3 text-foreground"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <a
              href="/admin"
              onClick={closeMenu}
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
        <p>© {new Date().getFullYear()} Nairaleap — Service Portal</p>
        <p>Connected to the main NairaLeap website</p>
      </div>
    </footer>
  );
}
