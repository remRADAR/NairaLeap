import { Link, createFileRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components";
import { ServiceLandingPage } from "@/components/ui/ServiceLandingPage";
import { getServiceBySlug } from "@/features/services/serviceLandingContent";

export const Route = createFileRoute("/services/$service")({
  head: ({ params }) => {
    const service = getServiceBySlug(params.service);
    return {
      meta: [
        {
          title: service
            ? `${service.title} — Nairaleap - Service Portal`
            : "Service — Nairaleap - Service Portal",
        },
        {
          name: "description",
          content:
            service?.longDescription ?? "Explore Nairaleap services before starting onboarding.",
        },
      ],
    };
  },
  component: ServiceLandingRoute,
});

function ServiceLandingRoute() {
  const { service: slug } = Route.useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Nairaleap services</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            That service is not available.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Return to the service directory to choose from the services currently available on the
            portal.
          </p>
          <Link
            to="/"
            hash="services"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl gradient-brand px-5 text-sm font-semibold text-primary-foreground"
          >
            View services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <AppLayout>
      <ServiceLandingPage service={service} />
    </AppLayout>
  );
}
