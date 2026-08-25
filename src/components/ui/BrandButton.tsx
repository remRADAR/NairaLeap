import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** BrandButton — portal-wide button primitive using design tokens only. */
export function BrandButton({ variant = "primary", className, ...props }: BrandButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95",
        variant === "ghost" &&
          "border border-glass-border bg-glass text-foreground hover:bg-surface-elevated",
        className,
      )}
      {...props}
    />
  );
}
