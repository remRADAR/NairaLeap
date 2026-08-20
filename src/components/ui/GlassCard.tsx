import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * GlassCard — the portal's primary surface primitive.
 * Uses the `glass-panel` utility defined in src/styles.css.
 */
export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-panel p-6 sm:p-8", className)} {...props} />;
}
