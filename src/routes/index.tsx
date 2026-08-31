import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Compass, ClipboardList, FileCheck2, Send, Sparkles } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  AppLayout,
  Container,
  GlassCard,
  BrandButton,
  ServiceCard,
  NairaLeapGuideContainer,
  Reveal,
} from "@/components";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

interface Step {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}

const STEPS: Step[] = [
  { icon: Compass, title: "Choose a Service" },
  { icon: ClipboardList, title: "Answer Simple Questions" },
  { icon: FileCheck2, title: "Review Your Request" },
  { icon: Send, title: "Submit" },
];

function LandingPage() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <AppLayout>
      {/* Hero */}
      <section aria-labelledby="hero-title">
        <Container className="pt-10 pb-14 sm:pt-16 sm:pb-20">
          <Reveal className="mx-auto max-w-3xl text-center" animation="fadeInUp">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
              Welcome to NairaLeap
            </span>
            <h1
              id="hero-title"
              className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              What can we help you <span className="text-gradient-brand">with today?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Browse our services or let NairaLeap Guide help you identify the right solution.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <BrandButton className="min-h-12 px-6 text-base" onClick={() => setGuideOpen(true)}>
                Let NairaLeap Guide You
              </BrandButton>
              <BrandButton
                variant="ghost"
                className="min-h-12 px-6 text-base"
                onClick={() =>
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Browse Services
              </BrandButton>
              <Link
                to="/auth"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-glass hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Access my workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Service Grid */}
      <section id="services" aria-labelledby="services-title">
        <Container className="py-8 sm:py-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 id="services-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Explore services
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Tap any service to learn more.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SERVICE_CATALOG.map((s, index) => (
              <Reveal key={s.id} delay={index * 55} className="h-full">
                <ServiceCard
                  key={s.id}
                  icon={s.icon}
                  title={s.title}
                  description={s.shortDescription}
                  href={`/services/${s.id}`}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Need Help */}
      <section aria-labelledby="need-help-title">
        <Container className="py-8 sm:py-12">
          <Reveal animation="fadeIn" className="w-full">
            <GlassCard className="relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
              />
              <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
                    NairaLeap Guide
                  </div>
                  <h2
                    id="need-help-title"
                    className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
                  >
                    Not sure where to begin?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    NairaLeap Guide will help you identify the right service in just a few simple
                    steps.
                  </p>
                </div>
                <BrandButton
                  data-testid="homepage-guide-trigger"
                  className="min-h-12 shrink-0 px-6 text-base"
                  onClick={() => setGuideOpen(true)}
                >
                  Start with NairaLeap Guide
                </BrandButton>
              </div>
            </GlassCard>
          </Reveal>
        </Container>
      </section>

      {/* How It Works */}
      <section id="about" aria-labelledby="how-title">
        <Container className="py-8 sm:py-12">
          <div className="mb-8 text-center">
            <h2 id="how-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Four simple steps from question to submitted request.
            </p>
          </div>
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
            />
            <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative">
                    <Reveal delay={i * 70} className="h-full">
                      <div className="glass-panel flex h-full flex-col items-center gap-3 p-6 text-center">
                        <div className="relative">
                          <span
                            aria-hidden="true"
                            className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                          >
                            <Icon className="h-6 w-6" />
                          </span>
                          <span
                            aria-hidden="true"
                            className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-glass-border bg-background text-[11px] font-semibold text-foreground"
                          >
                            {i + 1}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </section>

      {/* Reusable NairaLeap Guide container — discovery remains available separately from service pages */}
      <NairaLeapGuideContainer service={null} open={guideOpen} onOpenChange={setGuideOpen} />
    </AppLayout>
  );
}
