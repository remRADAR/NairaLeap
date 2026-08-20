import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { AppLayout, Container, GlassCard } from "@/components";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: "Insurance Portal — NairaLeap" },
      {
        name: "description",
        content:
          "The NairaLeap Insurance Portal — coming soon. Discover and request insurance services in one place.",
      },
      { property: "og:title", content: "Insurance Portal — NairaLeap" },
      {
        property: "og:description",
        content: "The NairaLeap Insurance Portal — coming soon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsurancePage,
});

function InsurancePage() {
  return (
    <AppLayout>
      <section aria-labelledby="insurance-title">
        <Container className="pt-10 pb-14 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
              Insurance Portal
            </span>
            <h1
              id="insurance-title"
              className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              Insurance <span className="text-gradient-brand">coming soon</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A dedicated space for discovering and requesting insurance services is on the way.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-8 sm:py-12">
          <GlassCard>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What to expect</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Guided intake, curated providers, and structured requests — built on the same
              NairaLeap Guide experience you already know.
            </p>
          </GlassCard>
        </Container>
      </section>
    </AppLayout>
  );
}
