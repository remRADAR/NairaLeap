import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SERVICE_INTELLIGENCE_MAP } from "@/features/service-intelligence-catalog";
import { getPendingGuideServiceId } from "@/features/service-intake/pendingGuide";
import type { ServiceDefinition } from "@/features/services/serviceCatalog";
import { Container } from "@/components";
import { NairaLeapGuideContainer, type OnboardingRole } from "./NairaLeapGuideContainer";

interface ServiceLandingPageProps {
  service: ServiceDefinition;
}

export function ServiceLandingPage({ service }: ServiceLandingPageProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>("customer");
  const intelligence = SERVICE_INTELLIGENCE_MAP[service.id];
  const Icon = service.icon;

  useEffect(() => {
    if (getPendingGuideServiceId() === service.id) {
      setOnboardingRole("customer");
      setGuideOpen(true);
    }
  }, [service.id]);

  const startOnboarding = (role: OnboardingRole) => {
    setOnboardingRole(role);
    setGuideOpen(true);
  };

  return (
    <>
      <main className="service-page-content min-h-[calc(100dvh-5rem)] text-foreground">
        <Container className="flex min-h-[calc(100dvh-5rem)] items-center py-6 sm:py-10">
          <section
            aria-labelledby="service-page-title"
            className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-glass-border bg-background/75 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
              />
              <div className="relative">
                <Link
                  to="/"
                  hash="services"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to services
                </Link>
                <div className="mt-10 flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">
                      Nairaleap service
                    </p>
                    <h1
                      id="service-page-title"
                      className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl"
                    >
                      {service.title}
                    </h1>
                  </div>
                </div>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {service.longDescription}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {service.examples.slice(0, 3).map((example) => (
                    <span
                      key={example}
                      className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {example}
                    </span>
                  ))}
                </div>
              </div>
              <p className="relative mt-10 text-xs leading-relaxed text-muted-foreground">
                Choose how you are using this service. NairaLeap will take you straight into the
                relevant guided onboarding and let you review everything before submission.
              </p>
            </div>

            <div className="flex flex-col justify-center border-t border-glass-border bg-glass/35 p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-glow">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Start onboarding
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                What brings you here?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Select one path. You can pause, edit your answers, and review the request before it
                is submitted.
              </p>

              <div className="mt-7 grid gap-3">
                <button
                  type="button"
                  data-testid="service-start-onboarding"
                  data-onboarding-role="customer"
                  aria-expanded={guideOpen}
                  aria-controls="nairaleap-guide-dialog"
                  onClick={() => startOnboarding("customer")}
                  className="group rounded-2xl border border-primary/35 bg-primary/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block text-base font-semibold text-foreground">
                        I&apos;m a customer
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        I want to find, request, buy, access, or get help with this service.
                      </span>
                    </span>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </button>
                <button
                  type="button"
                  data-testid="service-seller-onboarding"
                  onClick={() => startOnboarding("seller")}
                  className="group rounded-2xl border border-glass-border bg-background/45 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block text-base font-semibold text-foreground">
                        I&apos;m a seller or provider
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        I want to list, supply, partner, sell, or offer this service.
                      </span>
                    </span>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-glass-border pt-4 text-xs text-muted-foreground">
                <span>{intelligence?.estimatedCompletionTime ?? "A few minutes"}</span>
                <span>Review before submit</span>
              </div>
            </div>
          </section>
        </Container>
      </main>
      <NairaLeapGuideContainer
        service={service}
        onboardingRole={onboardingRole}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </>
  );
}
