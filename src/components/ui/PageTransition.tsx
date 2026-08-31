import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/** Keeps route changes visually continuous without delaying router navigation. */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div key={pathname} className="page-transition" data-route-path={pathname}>
      {children}
    </div>
  );
}
