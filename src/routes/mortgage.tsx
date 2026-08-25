import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  FileCheck2,
  Globe2,
  HandCoins,
  Hammer,
  Home,
  KeyRound,
  Landmark,
  Paintbrush,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import { NairaLeapGuideContainer } from "@/components/ui/NairaLeapGuideContainer";
import { SERVICE_CATALOG, type ServiceDefinition } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/mortgage")({
  head: () => ({
    meta: [
      { title: "Mortgage — Nairaleap - Service Portal" },
      {
        name: "description",
        content:
          "Explore home purchase, construction, renovation, NHF, rent-to-own, refinancing and mortgage-support pathways through the Nairaleap Mortgage Navigator.",
      },
      { property: "og:title", content: "Mortgage — Nairaleap - Service Portal" },
      {
        property: "og:description",
        content:
          "Describe your housing-finance need and Nairaleap will prepare a structured request for review by a suitable verified finance partner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MortgagePage,
});

const MORTGAGE_SERVICE = SERVICE_CATALOG.find((service) => service.id === "mortgage") ?? null;

type MortgageOffering = {
  title: string;
  description: string;
  examples: string;
  icon: typeof Home;
};

const MORTGAGE_OFFERINGS: MortgageOffering[] = [
  {
    title: "Home Purchase",
    description: "Prepare a request to finance a completed house, apartment or estate unit.",
    examples: "Purchase finance, home search, offer review",
    icon: Home,
  },
  {
    title: "Land & Build",
    description: "Explore a pathway for land purchase together with a future building project.",
    examples: "Land-and-build, title context, project planning",
    icon: Landmark,
  },
  {
    title: "Construction Finance",
    description: "Structure the information needed when you own land or construction has started.",
    examples: "Self-build, staged works, construction support",
    icon: Hammer,
  },
  {
    title: "Renovation Finance",
    description: "Organise a request to improve, extend or repair an existing home.",
    examples: "Home improvement, repairs, extensions",
    icon: Paintbrush,
  },
  {
    title: "Rent-to-Own",
    description:
      "Explore rent-to-own and affordable-housing routes where a suitable partner exists.",
    examples: "Affordable housing, occupancy-to-ownership",
    icon: KeyRound,
  },
  {
    title: "NHF / FMBN Pathways",
    description:
      "Request guidance on whether an NHF or FMBN-related route may be relevant to review.",
    examples: "NHF questions, application support, documents",
    icon: ShieldCheck,
  },
  {
    title: "Diaspora Mortgage",
    description:
      "Prepare a housing-finance enquiry for Nigerians living or earning outside Nigeria.",
    examples: "Diaspora income, property plans, partner routing",
    icon: Globe2,
  },
  {
    title: "Refinance or Transfer",
    description: "Organise an enquiry about refinancing, balance transfer or a change of lender.",
    examples: "Existing mortgage, refinance, transfer review",
    icon: RefreshCw,
  },
  {
    title: "Repayment Support",
    description:
      "Structure a request about repayment difficulty, arrears, statements or next steps.",
    examples: "Servicing support, statements, restructuring enquiry",
    icon: HandCoins,
  },
  {
    title: "Developer & Estate Finance",
    description:
      "Prepare a finance enquiry for developers, cooperatives or estate-related projects.",
    examples: "Estate development, cooperative, project finance",
    icon: Building2,
  },
  {
    title: "Mortgage Readiness",
    description:
      "Understand the information and documents an authorised finance partner may review.",
    examples: "Affordability context, document readiness, guidance",
    icon: FileCheck2,
  },
];

function MortgagePage() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <AppLayout>
      <section aria-labelledby="mortgage-title">
        <Container className="pt-10 pb-10 sm:pt-16 sm:pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Home className="h-3.5 w-3.5 text-primary-glow" aria-hidden="true" />
              Nairaleap Mortgage Navigator
            </span>
            <h1
              id="mortgage-title"
              className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              Find a clearer path to <span className="text-gradient-brand">home finance</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tell us whether you want to buy, build, renovate, refinance or understand your
              mortgage options. We will turn the need into a structured request for review by a
              suitable verified finance partner where available.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BrandButton className="min-h-12 px-6 text-base" onClick={() => setGuideOpen(true)}>
                Start mortgage guide
              </BrandButton>
              <a
                href="#mortgage-services"
                className="inline-flex min-h-12 items-center px-5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Explore mortgage services
              </a>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Nairaleap does not approve loans, set rates, validate title, or issue a binding offer.
              Eligibility, affordability, terms, approval and disbursement remain subject to partner
              review.
            </p>
          </div>
        </Container>
      </section>

      <section id="mortgage-services" aria-labelledby="mortgage-services-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Housing-finance pathways</p>
              <h2
                id="mortgage-services-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Start with the property or finance need
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              The guide can capture one clear purpose or combine related needs for a more complete
              review request.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MORTGAGE_OFFERINGS.map(({ title, description, examples, icon: Icon }) => (
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

      <section aria-labelledby="mortgage-process-title">
        <Container className="pb-14 sm:pb-20">
          <GlassCard className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-primary-glow">A review-ready first step</p>
                <h2
                  id="mortgage-process-title"
                  className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl"
                >
                  From housing need to a partner-ready request
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  The guide asks about your purpose, applicant profile, property stage, location,
                  income context and timeline. Before submission, you can review your answers and
                  see the documents a finance partner may request. No rate, repayment, approval or
                  disbursement outcome is promised in the portal.
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
        service={MORTGAGE_SERVICE}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </AppLayout>
  );
}
