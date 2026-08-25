import { createFileRoute, redirect } from "@tanstack/react-router";

import { getServiceBySlug } from "@/features/services/serviceLandingContent";

export const Route = createFileRoute("/_authenticated/onboarding/$service")({
  beforeLoad: ({ params }) => {
    const service = getServiceBySlug(params.service);
    if (!service) {
      throw redirect({ to: "/", hash: "services" });
    }

    throw redirect({
      to: "/services/$service",
      params: { service: service.id },
    });
  },
  component: LegacyOnboardingRedirect,
});

function LegacyOnboardingRedirect() {
  return null;
}
