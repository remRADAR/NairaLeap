import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardList } from "lucide-react";

import { BrandButton, Container, GlassCard } from "@/components";
import { listMyServiceRequests } from "@/features/service-requests/server";
import { SERVICE_CATALOG, type ServiceId } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "My Requests — NairaLeap" },
      {
        name: "description",
        content: "Track the service requests you have submitted to NairaLeap.",
      },
    ],
  }),
  loader: () => listMyServiceRequests(),
  component: RequestsPage,
});

const SERVICE_MAP = Object.fromEntries(
  SERVICE_CATALOG.map((service) => [service.id, service]),
) as Record<ServiceId, (typeof SERVICE_CATALOG)[number]>;

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In review",
  resolved: "Resolved",
  rejected: "Needs attention",
  draft: "Draft",
};

function RequestsPage() {
  const { requests } = Route.useLoaderData();

  return (
    <main className="min-h-dvh bg-background pb-20 text-foreground">
      <Container className="py-8 sm:py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-glow">
                  Customer workspace
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  My requests
                </h1>
              </div>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl gradient-brand px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Start a new request
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        {requests.length === 0 ? (
          <GlassCard className="mt-10 p-8 text-center sm:p-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-primary/15 text-primary">
              <ClipboardList className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">No requests yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Choose any service from your dashboard and the guided intake will capture the details
              needed for the NairaLeap team.
            </p>
            <Link to="/dashboard" className="mt-6 inline-flex">
              <BrandButton>Choose a service</BrandButton>
            </Link>
          </GlassCard>
        ) : (
          <section className="mt-10 space-y-4" aria-label="Submitted service requests">
            {requests.map((request) => {
              const service = SERVICE_MAP[request.service_id as ServiceId];
              const RequestIcon = service?.icon ?? ClipboardList;

              return (
                <GlassCard key={request.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <RequestIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-primary-glow">
                          {service?.title ?? request.service_id}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight">
                          Request {request.id.slice(0, 8)}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {STATUS_LABELS[request.status] ?? request.status}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    <span>Schema {request.schema_version}</span>
                    <span>Reference: {request.id}</span>
                  </div>
                </GlassCard>
              );
            })}
          </section>
        )}
      </Container>
    </main>
  );
}
