import { ArrowLeft, ArrowRight, Check, ClipboardList, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SERVICE_INTELLIGENCE_MAP } from "@/features/service-intelligence-catalog";
import {
  SERVICE_LANDING_CONTENT,
  getServiceBySlug,
} from "@/features/services/serviceLandingContent";
import { SERVICE_CATALOG, type ServiceDefinition } from "@/features/services/serviceCatalog";
import { getPendingGuideServiceId } from "@/features/service-intake/pendingGuide";
import { BrandButton, Container, GlassCard } from "@/components";
import { NairaLeapGuideContainer } from "./NairaLeapGuideContainer";

interface ServiceLandingPageProps {
  service: ServiceDefinition;
}

export function ServiceLandingPage({ service }: ServiceLandingPageProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const content = SERVICE_LANDING_CONTENT[service.id];
  const intelligence = SERVICE_INTELLIGENCE_MAP[service.id];
  const Icon = service.icon;

  useEffect(() => {
    if (getPendingGuideServiceId() === service.id) setGuideOpen(true);
  }, [service.id]);
  const relatedServices = (content.relatedServiceIds ?? [])
    .map((id) => SERVICE_CATALOG.find((item) => item.id === id))
    .filter((item): item is ServiceDefinition => Boolean(item));

  return (
    <>
      <div className="bg-background pb-20 text-foreground">
        <Container className="py-8 sm:py-12">
          <Link
            to="/"
            hash="services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to services
          </Link>

          <section
            className="mt-8 grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16"
            aria-labelledby="service-page-title"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
                Nairaleap service guide
              </div>
              <div className="mt-6 flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">
                    {service.title}
                  </p>
                  <h1
                    id="service-page-title"
                    className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl"
                  >
                    {service.shortDescription}
                  </h1>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {service.longDescription}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <BrandButton
                  data-testid="service-start-onboarding"
                  aria-expanded={guideOpen}
                  aria-controls="nairaleap-guide-dialog"
                  className="min-h-12 px-6 text-base"
                  onClick={() => setGuideOpen(true)}
                >
                  Start onboarding
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </BrandButton>
                <Link
                  to="/"
                  hash="services"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-glass-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Explore another service
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {content.audience}. You can review the service first and decide when you are ready
                to continue.
              </p>
            </div>

            <GlassCard className="relative overflow-hidden p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                      Before you begin
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      A clear path, one step at a time
                    </h2>
                  </div>
                  <ClipboardList className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
                </div>
                <ol className="mt-7 space-y-4">
                  {content.process.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm leading-relaxed text-muted-foreground">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                {intelligence?.estimatedCompletionTime ? (
                  <p className="mt-7 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    Typical guided completion: {intelligence.estimatedCompletionTime}. Your request
                    may need additional review information.
                  </p>
                ) : null}
              </div>
            </GlassCard>
          </section>

          <section
            className="mt-16 grid gap-6 lg:grid-cols-2"
            aria-label={`${service.title} information`}
          >
            <GlassCard className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                What this service is
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Understand the purpose first
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {content.purpose}
              </p>
              <div className="mt-6 rounded-2xl border border-glass-border bg-glass p-4 text-sm leading-relaxed text-foreground">
                {content.informationIntro}
              </div>
            </GlassCard>

            <GlassCard className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                What you’ll provide
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                The information is grouped for clarity
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {content.information.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </section>

          <section
            className="mt-6 grid gap-6 lg:grid-cols-2"
            aria-label={`${service.title} request guidance`}
          >
            <GlassCard className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                Common request types
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Start with the outcome you want
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.examples.map((example) => (
                  <li
                    key={example}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                After submission
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">What happens next</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {content.afterSubmission}
              </p>
            </GlassCard>
          </section>

          {content.boundary ? (
            <section className="mt-6" aria-labelledby="service-boundary-title">
              <div className="border-l-2 border-primary/50 bg-primary/5 px-5 py-4 sm:px-6">
                <h2 id="service-boundary-title" className="text-sm font-semibold text-foreground">
                  Important boundary
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {content.boundary}
                </p>
              </div>
            </section>
          ) : null}

          <section className="mt-16" aria-labelledby="service-cta-title">
            <GlassCard className="relative overflow-hidden p-6 sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
              />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                    Ready to continue?
                  </p>
                  <h2 id="service-cta-title" className="mt-2 text-3xl font-semibold tracking-tight">
                    Start when you feel ready.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    The guided flow will take you through the questions relevant to {service.title}.
                    You can review your answers before anything is submitted.
                  </p>
                </div>
                <BrandButton
                  data-testid="service-start-onboarding-secondary"
                  aria-expanded={guideOpen}
                  aria-controls="nairaleap-guide-dialog"
                  className="min-h-11 shrink-0 px-6 text-base"
                  onClick={() => setGuideOpen(true)}
                >
                  Start onboarding
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </BrandButton>
              </div>
            </GlassCard>
          </section>

          {relatedServices.length > 0 ? (
            <section className="mt-14" aria-labelledby="related-services-title">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-glow">
                    You may also need
                  </p>
                  <h2
                    id="related-services-title"
                    className="mt-2 text-2xl font-semibold tracking-tight"
                  >
                    Related services
                  </h2>
                </div>
                <Link
                  to="/"
                  hash="services"
                  className="text-sm text-primary transition-colors hover:text-primary-glow"
                >
                  View all
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {relatedServices.map((related) => {
                  const RelatedIcon = related.icon;
                  return (
                    <Link
                      key={related.id}
                      to="/services/$service"
                      params={{ service: related.id }}
                      className="glass-panel group flex items-start gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                        <RelatedIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {related.title}
                        </span>
                        <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {related.shortDescription}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </Container>
      </div>

      <NairaLeapGuideContainer service={service} open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
