import type { ComponentType, SVGProps } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

/**
 * ServiceCard — glass tile used in the Services grid.
 * Presentation only; no navigation wired yet (Phase 2 = UI foundation).
 */
export function ServiceCard({
  icon: Icon,
  title,
  description,
  className,
  onClick,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title} — ${description}`}
      className={cn(
        "glass-panel group relative flex w-full items-start gap-4 p-5 text-left transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-h-[7rem]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-105"
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-base font-semibold text-foreground">{title}</span>
        <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}
