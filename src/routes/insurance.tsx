import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  HeartPulse,
  House,
  Leaf,
  Package,
  Plane,
  Sailboat,
  ShieldCheck,
  Umbrella,
  Users,
} from "lucide-react";
import { AppLayout, BrandButton, Container, GlassCard } from "@/components";
import { NairaLeapGuideContainer } from "@/components/ui/NairaLeapGuideContainer";
import { SERVICE_CATALOG, type ServiceDefinition } from "@/features/services/serviceCatalog";
import {
  INSURANCE_CATEGORY_CATALOG,
  type InsuranceCategoryDefinition,
} from "@/features/insurance/catalog";
import {
  INSURANCE_PRODUCT_DISCLOSURE,
  INSURANCE_SOURCE_CHECKED_PRODUCTS,
} from "@/features/insurance/productCatalogue";

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

const INSURANCE_ICONS = {
  car: CarFront,
  health: HeartPulse,
  home: House,
  contents: Package,
  agriculture: Leaf,
  life: Users,
  savings: ShieldCheck,
  annuity: ShieldCheck,
  education: BookOpen,
  group: Users,
  business: BriefcaseBusiness,
  travel: Plane,
  marine: Sailboat,
  liability: ShieldCheck,
  inclusion: Umbrella,
} satisfies Record<InsuranceCategoryDefinition["icon"], typeof CarFront>;

const INSURANCE_OFFERINGS = INSURANCE_CATEGORY_CATALOG.map((category) => ({
  ...category,
  iconComponent: INSURANCE_ICONS[category.icon],
}));

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
              Choose the closest category. Use the request details to note any related risks that
              should be reviewed together.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSURANCE_OFFERINGS.map(
              ({ id, title, description, examples, iconComponent: Icon }) => (
                <GlassCard key={id} className="h-full">
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
              ),
            )}
          </div>
        </Container>
      </section>

      <section id="insurance-products" aria-labelledby="insurance-products-title">
        <Container className="pb-12 sm:pb-16">
          <div className="mb-6 max-w-4xl">
            <p className="text-sm font-medium text-primary-glow">Published product references</p>
            <h2
              id="insurance-products-title"
              className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Source-checked insurer product references
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              These summaries cover selected savings, endowment, annuity and home-cover products and
              were checked against official insurer pages and documents on{" "}
              {INSURANCE_PRODUCT_DISCLOSURE.checkedAt}. That is the source retrieval date, not a
              product effective date; several sources are undated or historical. These references
              are not recommendations, live quotations, policy wording or proof of a NairaLeap
              provider relationship. Confirm availability, eligibility, licensing, product approval,
              rates and terms with the insurer before proceeding.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {INSURANCE_PRODUCT_DISCLOSURE.naicomMcrDisclaimer}{" "}
              {INSURANCE_PRODUCT_DISCLOSURE.quoteDisclaimer}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {INSURANCE_SOURCE_CHECKED_PRODUCTS.map((product) => (
              <GlassCard key={product.id} className="h-full">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-glow">
                      {product.provider.legalName}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.category === "personal-annuity"
                        ? "Personal & retirement annuity"
                        : product.category === "education-endowment"
                          ? "Education & endowment"
                          : product.category === "home-property"
                            ? "Home & household property"
                            : "Savings & investment-linked insurance"}
                    </p>
                  </div>
                  <span className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-muted-foreground">
                    Provider quote required
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {product.intendedCustomer}
                </p>
                <div className="mt-4 space-y-2 rounded-xl border border-glass-border bg-glass p-3 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">
                      Source freshness (checked {product.lastChecked}):
                    </span>{" "}
                    {product.freshnessNote}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Price / rate:</span>{" "}
                    {product.pricingNote}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {product.publishedTerms.map((term) => (
                    <li key={term} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
                <details className="mt-4 rounded-xl border border-glass-border bg-glass p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Formal application and verification notes
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {product.formalApplicationDocuments.map((document) => (
                      <li key={document}>{document}</li>
                    ))}
                    <li>
                      NAICOM's 31 July 2026 minimum-capital compliance list records this legal
                      entity as {product.provider.naicomMcrClass} (
                      {product.provider.naicomMcrReference}). That is not a substitute for checking
                      its current operating licence or product approval.
                    </li>
                    <li>{product.ratingStatus}. No provider is ranked by this portal.</li>
                    <li>{INSURANCE_PRODUCT_DISCLOSURE.relationshipDisclaimer}</li>
                  </ul>
                </details>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-glow underline-offset-4 hover:underline"
                  >
                    Official product page
                  </a>
                  {product.additionalSources?.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-glow underline-offset-4 hover:underline"
                    >
                      {source.label}
                    </a>
                  ))}
                  <a
                    href={product.provider.naicomMcrSource}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-glow underline-offset-4 hover:underline"
                  >
                    NAICOM MCR list
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-glass-border bg-glass p-4 text-sm leading-relaxed text-muted-foreground">
            {INSURANCE_PRODUCT_DISCLOSURE.ratingsDisclaimer} The Leadway Householder reference is
            limited to the published product page and is not a quote. Provider-specific references
            for motor, health, agriculture, group and commercial products are not yet verified in
            this catalogue; use the guide to request a manual review instead.
          </p>
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
