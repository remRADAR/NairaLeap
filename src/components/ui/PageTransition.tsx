import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";
import { PortalBackground } from "../layout/PortalBackground";

interface PageTransitionProps {
  children: ReactNode;
}

/** Keeps route changes visually continuous without delaying router navigation. */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const serviceSlug = /^\/services\/([^/]+)\/?$/.exec(pathname)?.[1];
  const serviceId = SERVICE_CATALOG.find((service) => service.id === serviceSlug)?.id ?? null;

  return (
    <>
      <PortalBackground serviceId={serviceId} />
      <div key={pathname} className="page-transition" data-route-path={pathname}>
        {children}
      </div>
    </>
  );
}
