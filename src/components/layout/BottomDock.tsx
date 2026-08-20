import { Link } from "@tanstack/react-router";
import { Shield, Home, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BottomDock — always-visible floating glass dock with two portal entry points.
 * Insurance → /insurance · Mortgage → /mortgage
 */
export function BottomDock() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <nav
        aria-label="Portal quick access"
        className="glass-panel pointer-events-auto flex items-center gap-1.5 p-1.5 shadow-[var(--shadow-elevated)]"
      >
        <DockLink to="/insurance" icon={Shield} label="Insurance" />
        <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-glass-border" />
        <DockLink to="/mortgage" icon={Home} label="Mortgage" />
      </nav>
    </div>
  );
}

function DockLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/insurance" | "/mortgage";
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-all",
        "hover:bg-surface-elevated active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-[status=active]:bg-surface-elevated data-[status=active]:text-foreground",
      )}
      activeOptions={{ exact: true }}
      activeProps={{ "aria-current": "page" }}
    >
      <Icon
        className="h-4 w-4 text-primary-glow"
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
