import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CarFront,
  HeartPulse,
  House,
  Leaf,
  Plane,
  Sailboat,
  ShieldCheck,
  Umbrella,
  Users,
} from "lucide-react";
import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import { NairaLeapGuideContainer } from "@/components/ui/NairaLeapGuideContainer";
import { SERVICE_CATALOG, type ServiceDefinition } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: "Insurance — Nairaleap - Service Portal" },
      {
        name: "description",
        content:
          "Explore insurance cover, policy support, claims, renewals and quote requests through the Nairaleap guided insurance navigator.",
      },
      { property: "og:title", content: "Insurance — Nairaleap - Service Portal" },
      {
        property: "og:description",
        content:
          "Describe what you need to protect and Nairaleap will prepare a structured insurance request for review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsurancePage,
});

const INSURANCE_SERVICE = SERVICE_CATALOG.find((service) => service.id === "insurance") ?? null;

type InsuranceOffering = {
  title: string;
  description: string;
  examples: string;
  icon: typeof CarFront;
};

const INSURANCE_OFFERINGS: InsuranceOffering[] = [
  {
    title: "Motor & Auto",
    description:
      "Vehicle protection, third-party, comprehensive, commercial vehicle and fleet enquiries.",
    examples: "Quotes, renewals, policy verification",
    icon: CarFront,
  },
  {
    title: "Health & Medical",
    description: "Individual, family, group and corporate health-cover enquiries.",
    examples: "Plans, comparisons, family cover",
    icon: HeartPulse,
  },
  {
    title: "Life & Family",
    description:
      "Life protection and family financial-support needs, including group-life enquiries.",
    examples: "Term life, group life, family protection",
    icon: Users,
  },
  {
    title: "Home & Property",
    description:
      "Protection for homes, contents, landlords, renters, buildings and property risks.",
    examples: "Home, contents, fire and theft",
    icon: House,
  },
  {
    title: "Business & Commercial",
    description: "SME and commercial risk enquiries for premises, stock, equipment and operations.",
    examples: "SME packages, stock, equipment",
    icon: BriefcaseBusiness,
  },
  {
    title: "Agriculture",
    description:
      "Protection needs connected to farms, crops, livestock, equipment and agricultural activity.",
    examples: "Farm, crop, livestock, equipment",
    icon: Leaf,
  },
  {
    title: "Travel",
    description:
      "Travel and travel-medical protection requests for individuals, families and trips.",
    examples: "Single trip, annual, travel medical",
    icon: Plane,
  },
  {
    title: "Marine, Cargo & Aviation",
    description:
      "Risk enquiries for goods in transit, cargo, vessels, voyages and aviation activity.",
    examples: "Cargo, marine, aviation enquiries",
    icon: Sailboat,
  },
  {
    title: "Liability & Compulsory Cover",
    description:
      "Requests involving third-party, builders, occupiers, public or professional liability.",
    examples: "Third-party, builders, occupiers",
    icon: ShieldCheck,
  },
  {
    title: "Microinsurance, Takaful & Inclusion",
    description: "Lower-cost, cooperative and inclusion-focused protection preferences.",
    examples: "Microinsurance, Takaful, community cover",
    icon: Umbrella,
  },
];

function InsurancePage() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <AppLayout>
      <section aria-labelledby="insurance-title">
        <Container className="pt-10 pb-10 sm:pt-16 sm:pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
              Nairaleap Insurance Navigator
            </span>
            <h1
              id="insurance-title"
              className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              Protect what matters with a{" "}
              <span className="text-gradient-brand">clear next step</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tell us what you need to protect, whether you are requesting new cover, comparing
              options, making a claim, renewing a policy or getting policy support. We will prepare
              a structured request for review by an authorized insurance operator.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BrandButton className="min-h-12 px-6 text-base" onClick={() => setGuideOpen(true)}>
                Start insurance guide
              </BrandButton>
              <a
                href="#insurance-services"
                className="inline-flex min-h-12 items-center px-5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Explore cover types
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section id="insurance-services" aria-labelledby="insurance-services-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Coverage areas</p>
              <h2
                id="insurance-services-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Start with the risk you want to understand
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              The guide can combine categories when your protection need crosses more than one area.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSURANCE_OFFERINGS.map(({ title, description, examples, icon: Icon }) => (
              <GlassCard key={title} className="h-full">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    <p className="mt-3 text-xs font-medium text-primary-glow">{examples}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="insurance-support-title">
        <Container className="pb-14 sm:pb-20">
          <GlassCard className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-primary-glow">Beyond new policies</p>
                <h2
                  id="insurance-support-title"
                  className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl"
                >
                  Claims, renewals and policy support are part of the journey
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Existing policyholders can use the same guide to organise a claim, verify a
                  policy, request a renewal or explain a policy change. No coverage, claim outcome
                  or premium is guaranteed before authorized provider review.
                </p>
              </div>
              <BrandButton variant="ghost" className="min-h-11" onClick={() => setGuideOpen(true)}>
                Get started
              </BrandButton>
            </div>
          </GlassCard>
        </Container>
      </section>

      <NairaLeapGuideContainer
        service={INSURANCE_SERVICE}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </AppLayout>
  );
}
