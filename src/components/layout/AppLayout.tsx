import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomDock } from "./BottomDock";
import { NairaLeapBot } from "../ui/NairaLeapBot";
import { NairaLeapGuideContainer } from "../ui/NairaLeapGuideContainer";
import { useAuth } from "@/features/auth";
import { SERVICE_CATALOG, type ServiceId } from "@/features/services/serviceCatalog";

interface AppLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Services", hash: "services" },
  { label: "About", hash: "about" },
  { label: "Contact", hash: "contact" },
] as const;

/**
 * AppLayout — portal shell.
 * Sticky glass header · main outlet · footer · floating dock.
 * Adds bottom padding so the fixed dock never overlaps page content.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div
      className="dark flex min-h-dvh flex-col text-foreground"
      data-app-hydrated={hydrated ? "true" : "false"}
    >
      <Header />
      <main className="flex-1 pb-32 sm:pb-28">{children}</main>
      <Footer />
      <BottomDock />
      <NairaLeapBot onGuide={() => setGuideOpen(true)} />
      <NairaLeapGuideContainer service={null} open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="glass-panel flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Nairaleap - Service Portal" className="min-w-0 shrink">
            <img
              src="/nairaleap-wordmark.png"
              alt="Nairaleap - Service Portal"
              className="block h-10 w-[10rem] max-w-full object-contain object-left sm:h-11 sm:w-[13rem]"
            />
          </Link>

          <div className="hidden items-center gap-1 text-sm sm:flex">
            <nav aria-label="Primary" className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to="/"
                  hash={item.hash}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated hover:text-foreground active:translate-y-0 active:scale-[0.98]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="rounded-lg px-3 py-2 text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.98]"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-glass-border bg-glass text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-elevated active:translate-y-0 active:scale-[0.96] sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            "sm:hidden overflow-hidden transition-all duration-300",
            open ? "mt-2 max-h-64 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav aria-label="Mobile" className="glass-panel flex flex-col p-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to="/"
                hash={item.hash}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-foreground transition-all duration-200 ease-out hover:bg-surface-elevated active:scale-[0.98]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-foreground transition-all duration-200 ease-out hover:bg-surface-elevated active:scale-[0.98]"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
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
        <p>© {new Date().getFullYear()} Nairaleap - Service Portal</p>
        <p>Connected to the main NairaLeap website</p>
      </div>
    </footer>
  );
}
