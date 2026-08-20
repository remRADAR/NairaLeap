import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Container — Apple-inspired max-width + horizontal padding for page sections. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}
