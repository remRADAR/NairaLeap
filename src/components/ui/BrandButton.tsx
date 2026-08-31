import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";
type Size = "default" | "sm";

interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** BrandButton — portal-wide button primitive using design tokens only. */
export function BrandButton({
  variant = "primary",
  size = "default",
  className,
  ...props
}: BrandButtonProps) {
  return (
    <button
      className={cn(
        "interactive-button inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
        size === "sm" ? "min-h-9 gap-1.5 rounded-lg px-3 py-2 text-xs" : "px-5 py-2.5",
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
