import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CarFront,
  ClipboardList,
  HeartPulse,
  House,
  Leaf,
  Plane,
  Scale,
  ShieldCheck,
  Umbrella,
  Users,
} from "lucide-react";
import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import {
  NairaLeapGuideContainer,
  type OnboardingRole,
} from "@/components/ui/NairaLeapGuideContainer";
import type { AnswersState } from "@/features/question-engine";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: "Insurance — Nairaleap - Service Portal" },
      {
        name: "description",
        content:
          "Compare cover, get a quote, or make a claim through the Nairaleap guided insurance navigator. See indicative starting prices across motor, health, life, home, business and more.",
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

type InsuranceFlow = {
  value: string;
  role: OnboardingRole;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
};

const INSURANCE_FLOWS: InsuranceFlow[] = [
  {
    value: "compare-cover",
    role: "compare-cover",
    title: "Compare Cover",
    description:
      "See indicative starting prices across motor, health, life, home, business, agriculture, travel, liability and microinsurance.",
    icon: Scale,
  },
  {
    value: "get-quote",
    role: "get-quote",
    title: "Get a Quote",
    description:
      "Tell us what you want to protect and receive a structured quote request routed to licensed insurers.",
    icon: ClipboardList,
  },
  {
    value: "make-claim",
    role: "make-claim",
    title: "Make a Claim",
    description:
      "Report an incident and start a claim. NairaLeap will organise the details for the insurer's review.",
    icon: ShieldCheck,
  },
];

type InsuranceCompareOffer = {
  category: string;
  cover: string;
  indicativeFrom: string;
  period: string;
};

const INSURANCE_COMPARE_OFFERS: InsuranceCompareOffer[] = [
  { category: "Motor", cover: "Third-party only", indicativeFrom: "₦5,000", period: "per year" },
  { category: "Motor", cover: "Comprehensive", indicativeFrom: "₦25,000", period: "per year" },
  { category: "Health", cover: "Individual / family plan", indicativeFrom: "₦60,000", period: "per year" },
  { category: "Life", cover: "Term life", indicativeFrom: "₦10,000", period: "per year" },
  { category: "Home", cover: "Home & contents", indicativeFrom: "₦15,000", period: "per year" },
  { category: "Business", cover: "SME package", indicativeFrom: "₦30,000", period: "per year" },
  { category: "Agriculture", cover: "Crop / livestock", indicativeFrom: "₦8,000", period: "per season" },
  { category: "Travel", cover: "Single trip", indicativeFrom: "₦5,500", period: "per trip" },
  { category: "Liability", cover: "General liability", indicativeFrom: "₦12,000", period: "per year" },
  { category: "Micro / Takaful", cover: "Microinsurance", indicativeFrom: "₦1,500", period: "per year" },
];

type InsuranceCategory = {
  value: string;
  title: string;
  description: string;
  icon: typeof CarFront;
};

const INSURANCE_CATEGORIES: InsuranceCategory[] = [
  {
    value: "motor-auto",
    title: "Motor & Auto",
    description: "Vehicle protection, third-party, comprehensive, commercial vehicle and fleet enquiries.",
    icon: CarFront,
  },
  {
    value: "health-medical",
    title: "Health & Medical",
    description: "Individual, family, group and corporate health-cover enquiries.",
    icon: HeartPulse,
  },
  {
    value: "life-family",
    title: "Life & Family",
    description: "Life protection and family financial-support needs, including group-life enquiries.",
    icon: Users,
  },
  {
    value: "home-property",
    title: "Home & Property",
    description: "Protection for homes, contents, landlords, renters, buildings and property risks.",
    icon: House,
  },
  {
    value: "business-commercial",
    title: "Business & Commercial",
    description: "SME and commercial risk enquiries for premises, stock, equipment and operations.",
    icon: BriefcaseBusiness,
  },
  {
    value: "agriculture",
    title: "Agriculture",
    description: "Protection needs connected to farms, crops, livestock, equipment and agricultural activity.",
    icon: Leaf,
  },
  {
    value: "travel",
    title: "Travel",
    description: "Travel and travel-medical protection requests for individuals, families and trips.",
    icon: Plane,
  },
  {
    value: "liability-compulsory",
    title: "Liability & Compulsory Cover",
    description: "Requests involving third-party, builders, occupiers, public or professional liability.",
    icon: ShieldCheck,
  },
  {
    value: "micro-takaful-inclusion",
    title: "Microinsurance, Takaful & Inclusion",
    description: "Lower-cost, cooperative and inclusion-focused protection preferences.",
    icon: Umbrella,
  },
];

function InsurancePage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideAnswers, setGuideAnswers] = useState<AnswersState>({});
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>("compare-cover");

  const openGuide = (initialAnswers: AnswersState, role: OnboardingRole = "compare-cover") => {
    setGuideAnswers(initialAnswers);
    setOnboardingRole(role);
    setGuideOpen(true);
  };

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
              Compare cover with indicative starting prices, get a quote, or make a claim. NairaLeap
              will prepare a structured request for review by an authorized insurance operator.
            </p>
          </div>
        </Container>
      </section>

      <section id="insurance-flows" aria-labelledby="insurance-flows-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Insurance flows</p>
              <h2
                id="insurance-flows-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                What would you like to do?
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Select a flow to start. You can review and edit your answers before submitting.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {INSURANCE_FLOWS.map(({ value, role, title, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => openGuide({ insuranceRequestType: value }, role)}
                className="group h-full text-left"
              >
                <GlassCard className="h-full transition hover:-translate-y-0.5 hover:border-primary/40">
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
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section id="insurance-compare" aria-labelledby="insurance-compare-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Compare cover</p>
              <h2
                id="insurance-compare-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Indicative starting prices
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              These are indicative starting prices only. Final premiums are confirmed by a licensed
              insurer.
            </p>
          </div>
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-glass-border bg-glass/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Cover</th>
                    <th className="px-4 py-3 font-medium">Indicative from</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {INSURANCE_COMPARE_OFFERS.map((offer, index) => (
                    <tr
                      key={`${offer.category}-${offer.cover}`}
                      className={index % 2 === 1 ? "bg-glass/30" : ""}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{offer.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{offer.cover}</td>
                      <td className="px-4 py-3 font-semibold text-gradient-brand">
                        {offer.indicativeFrom}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{offer.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Indicative starting prices only — final premium is confirmed by a licensed insurer.
            NairaLeap does not set, underwrite, or guarantee premiums. Terms, exclusions, claims
            decisions and cover are determined by the licensed operator.
          </p>
        </Container>
      </section>

      <section id="insurance-categories" aria-labelledby="insurance-categories-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Coverage areas</p>
              <h2
                id="insurance-categories-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Start with the risk you want to understand
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Select a category to compare cover. You can also get a quote or make a claim from the
              flows above.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSURANCE_CATEGORIES.map(({ value, title, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  openGuide(
                    { insuranceRequestType: "compare-cover", insuranceCategory: value },
                    "compare-cover",
                  )
                }
                className="group h-full text-left"
              >
                <GlassCard className="h-full transition hover:-translate-y-0.5 hover:border-primary/40">
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
                    </div>
                  </div>
                </GlassCard>
              </button>
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
                  Claims, quotes and comparisons are part of the journey
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Use the flows above to compare cover, get a quote, or make a claim. No coverage,
                  claim outcome or premium is guaranteed before authorized provider review.
                </p>
              </div>
              <BrandButton
                variant="ghost"
                className="min-h-11"
                onClick={() => openGuide({ insuranceRequestType: "compare-cover" }, "compare-cover")}
              >
                Get started
              </BrandButton>
            </div>
          </GlassCard>
        </Container>
      </section>

      <NairaLeapGuideContainer
        service={INSURANCE_SERVICE}
        onboardingRole={onboardingRole}
        initialAnswers={guideAnswers}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </AppLayout>
  );
}
