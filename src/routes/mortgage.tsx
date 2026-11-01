import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Hammer,
  Home,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import {
  NairaLeapGuideContainer,
  type OnboardingRole,
} from "@/components/ui/NairaLeapGuideContainer";
import type { AnswersState } from "@/features/question-engine";
import { SERVICE_CATALOG } from "@/features/services/serviceCatalog";

export const Route = createFileRoute("/mortgage")({
  head: () => ({
    meta: [
      { title: "Mortgage — Nairaleap - Service Portal" },
      {
        name: "description",
        content:
          "Buy a home or build, renovate, or explore NHF / FMBN pathways through the Nairaleap Mortgage Navigator. Developers and mortgage banks can onboard with a KYC profile.",
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

type MortgagePathway = {
  value: string;
  title: string;
  description: string;
  examples: string;
  icon: typeof Home;
};

const MORTGAGE_PATHWAYS: MortgagePathway[] = [
  {
    value: "buy-or-build",
    title: "Buy a Home / Build",
    description:
      "Prepare a request to finance a completed home, buy land and build, or fund a construction project.",
    examples: "Home purchase, land-and-build, construction finance",
    icon: Home,
  },
  {
    value: "renovate",
    title: "Renovate",
    description:
      "Organise a request to improve, extend, or repair an existing home.",
    examples: "Home improvement, repairs, extensions",
    icon: Hammer,
  },
  {
    value: "nhf-fmbn",
    title: "Explore NHF / FMBN Pathways",
    description:
      "Request guidance on whether an NHF or FMBN-related route may be relevant to your housing-finance need.",
    examples: "NHF questions, FMBN pathways, application support",
    icon: ShieldCheck,
  },
];

type MortgageRoleCard = {
  role: OnboardingRole;
  mortgageRoleValue: string;
  title: string;
  description: string;
  icon: typeof Building2;
};

const MORTGAGE_ROLE_CARDS: MortgageRoleCard[] = [
  {
    role: "developer",
    mortgageRoleValue: "developer",
    title: "Developer",
    description:
      "Onboard your estate or development project with a KYC profile — location, size, facilities, pricing, and company details.",
    icon: Building2,
  },
  {
    role: "mortgage-bank",
    mortgageRoleValue: "mortgage-bank",
    title: "Mortgage Bank",
    description:
      "Onboard your mortgage bank or lending institution with a KYC profile — bank name, RC number, license type, years in operation, and AOB notes.",
    icon: Landmark,
  },
];

function MortgagePage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideAnswers, setGuideAnswers] = useState<AnswersState>({});
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>("customer");

  const openGuide = (initialAnswers: AnswersState, role: OnboardingRole = "customer") => {
    setGuideAnswers(initialAnswers);
    setOnboardingRole(role);
    setGuideOpen(true);
  };

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
              Choose your mortgage pathway — buy a home or build, renovate, or explore NHF / FMBN
              pathways. We will turn your need into a structured request for review by a suitable
              verified finance partner.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Nairaleap does not approve loans, set rates, validate title, or issue a binding offer.
              Eligibility, affordability, terms, approval and disbursement remain subject to partner
              review.
            </p>
          </div>
        </Container>
      </section>

      <section id="mortgage-pathways" aria-labelledby="mortgage-pathways-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Mortgage pathways</p>
              <h2
                id="mortgage-pathways-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Choose your pathway
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Select the pathway that best describes your housing-finance need. You can review and
              edit your answers before submitting.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {MORTGAGE_PATHWAYS.map(({ value, title, description, examples, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => openGuide({ mortgageRequestType: value })}
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
                      <p className="mt-3 text-xs font-medium text-primary-glow">{examples}</p>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section id="mortgage-roles" aria-labelledby="mortgage-roles-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-glow">Partner onboarding</p>
              <h2
                id="mortgage-roles-title"
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Choose your role
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Developers and mortgage banks can onboard with a KYC profile. Home applicants can use
              any pathway above.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {MORTGAGE_ROLE_CARDS.map(({ role, mortgageRoleValue, title, description, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => openGuide({ mortgageRole: mortgageRoleValue }, role)}
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
                      <p className="mt-3 text-xs font-medium text-primary-glow">KYC onboarding</p>
                    </div>
                  </div>
                </GlassCard>
              </button>
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
                  The guide asks about your pathway, location, and housing-finance need. Developers
                  and mortgage banks provide KYC details. Before submission, you can review your
                  answers and see the documents a finance partner may request. No rate, repayment,
                  approval or disbursement outcome is promised in the portal.
                </p>
              </div>
              <BrandButton
                variant="ghost"
                className="min-h-11"
                onClick={() => openGuide({})}
              >
                Get started
              </BrandButton>
            </div>
          </GlassCard>
        </Container>
      </section>

      <NairaLeapGuideContainer
        service={MORTGAGE_SERVICE}
        onboardingRole={onboardingRole}
        initialAnswers={guideAnswers}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </AppLayout>
  );
}
