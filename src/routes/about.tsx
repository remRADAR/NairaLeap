import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { LegalList, LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildLegalHead, LEGAL_DOCUMENTS } from "@/features/legal/legalDocuments";

export const Route = createFileRoute("/about")({
  head: () => buildLegalHead("about"),
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalPageLayout
      document={LEGAL_DOCUMENTS.about}
      kicker="About us"
      intro={
        <>
          NairaLeap is a Nigerian digital media, information and services ecosystem connecting
          people with the knowledge, opportunities and practical pathways shaping Nigeria&apos;s
          economy. This page explains who we are, where we came from, and what the change from
          Naira &amp; Kobo to NairaLeap means for the work we do.
        </>
      }
    >
      <LegalSection id="our-story" title="Our story: from Naira &amp; Kobo to NairaLeap">
        <h3 className="text-base font-extrabold text-[#303044]">Where we started</h3>
        <p>
          NairaLeap began as <strong>Naira &amp; Kobo</strong>, an editorial project built on a
          simple conviction: the numbers that shape everyday life in Nigeria — prices, wages,
          infrastructure, energy, policy, business — should be understandable to the people they
          affect most. The name came from the currency itself, because the currency is where the
          economy stops being an abstraction and becomes daily reality.
        </p>
        <p>
          The team built a WordPress newsroom around that idea and published thousands of stories
          tracking the indicators that move the Nigerian economy — transport and infrastructure,
          energy, agriculture, technology, health, education, security and more. That archive now
          lives on inside NairaLeap: more than 3,600 published stories from the original Naira
          &amp; Kobo newsroom were migrated, preserved and remain readable here.
        </p>

        <h3 className="text-base font-extrabold text-[#303044]">What the journey taught us</h3>
        <p>
          Running the archive taught us two things. First, that Nigerians do not only want to
          understand the economy — they want to act inside it: to find farmland or buyers, to list
          or rent property, to raise business funding, to arrange insurance, to explore a
          mortgage, to reach a professional who can help. Second, that a newsroom alone cannot
          carry that second half of the journey. Information without a next step is only half a
          service.
        </p>

        <h3 className="text-base font-extrabold text-[#303044]">Why NairaLeap</h3>
        <p>
          NairaLeap is the answer to those lessons. The new name keeps the Nigerian currency at
          the heart of the identity, and adds the second idea the project grew into: the leap
          — from information to action, from understanding Nigeria to moving Nigeria forward. The
          Naira &amp; Kobo newsroom was not a false start; it was the foundation. Every story in
          the archive is still part of this platform, and the editorial standards it set still
          govern what we publish.
        </p>

        <h3 className="text-base font-extrabold text-[#303044]">What the rebrand means</h3>
        <p>
          The rebrand is not a change of owner, mission or values — it is a widening of what the
          platform exists to do. Naira &amp; Kobo explained the economy. NairaLeap explains it
          and then helps you do something about it. Everything published before the transition
          remains accessible, and readers of the original newsroom will find the same archive,
          the same categories and the same focus on Nigerian economic life.
        </p>
      </LegalSection>

      <LegalSection id="ecosystem" title="The NairaLeap ecosystem">
        <p>
          NairaLeap operates as one ecosystem with two connected experiences, sharing the same
          corporate identity, accountability standards, legal framework and privacy commitments:
        </p>
        <LegalList
          items={[
            <>
              <strong>NairaLeap Editorial</strong> — the public newsroom and archive. Economic
              indicators, news, journalism and analysis on the forces moving Nigeria&apos;s
              economy.
            </>,
            <>
              <strong>NairaLeap Services</strong> — the services portal. Service discovery,
              guided onboarding, request preparation and access to relevant solutions, built
              around one clear promise: review what you are submitting before anything is sent.
            </>,
          ]}
        />
        <p>
          The two experiences are connected on purpose. A story about housing finance can lead
          to a mortgage pathway. Coverage of an agricultural season can lead to a farm request.
          The editorial website communicates what NairaLeap knows, reports and publishes; the
          services portal communicates what NairaLeap helps visitors discover and pursue.
        </p>
      </LegalSection>

      <LegalSection id="mission" title="Our editorial mission and values">
        <p>
          Our mission is to make the Nigerian economy legible — to track the indicators that
          matter, explain them in plain language, and connect them to real decisions in
          people&apos;s lives and businesses.
        </p>
        <LegalList
          items={[
            <>
              <strong>Clarity first.</strong> Economic information is only useful when an
              ordinary reader can act on it. We write for the reader, not for the archive.
            </>,
            <>
              <strong>Sources and limits.</strong> We work from official and reputable sources,
              and we say when a figure is provisional, revised or contested. Our{" "}
              <Link to="/disclaimer" className="font-semibold text-[#7a2ce2] hover:underline">
                disclaimer
              </Link>{" "}
              sets out exactly how our information should and should not be relied on.
            </>,
            <>
              <strong>Respect for the archive.</strong> The migrated Naira &amp; Kobo stories are
              preserved as published, with their original source links intact.
            </>,
            <>
              <strong>Accessibility and language.</strong> Our interface is currently published
              in English. Additional Nigerian languages will only be enabled when complete,
              human-reviewed translations are ready — never machine-published half-translations.
            </>,
            <>
              <strong>Correction culture.</strong> When we get something wrong, we correct it
              and say so. Accountability is part of the product, not an afterthought.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="services" title="Services and opportunities">
        <p>
          NairaLeap Services helps visitors turn a need into a structured, reviewable request.
          Current service areas include agriculture, property listings, business funding,
          partnerships, a vendor marketplace, distress sales, recycling and scrap, business
          briefs, professional services, customer support, insurance and mortgage pathways.
        </p>
        <p>
          The portal is a preparation and routing layer, not the final decision-maker. Requests
          are reviewed by the NairaLeap team and, where appropriate, by suitable providers and
          partners — and indicative prices, service descriptions and preliminary guidance are
          never guaranteed offers or approvals. You can read the full terms of reliance in our{" "}
          <Link to="/disclaimer" className="font-semibold text-[#7a2ce2] hover:underline">
            disclaimer
          </Link>
          .
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2] transition-all hover:gap-2"
        >
          Explore NairaLeap Services <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </LegalSection>

      <LegalSection id="vision" title="Our vision for Nigeria">
        <p>
          We believe a better-informed Nigeria is a stronger Nigeria — and that information is
          most powerful when it ends in action. Our vision is a country where the person reading
          about an economic opportunity is one clear, honest step away from pursuing it: where
          understanding the economy and participating in it are part of the same journey.
        </p>
        <p>
          That is what the leap in our name stands for. From understanding Nigeria to moving
          Nigeria forward.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact and accountability">
        <p>
          NairaLeap is operated by a Nigerian team. Formal business details — the registered
          entity behind the platform, its registration particulars and its official addresses —
          are being confirmed by the owner and will be published on this page as soon as they are
          verified. We deliberately do not publish incorporation details we cannot yet stand
          behind.
        </p>
        <p>
          Questions, corrections, content complaints and privacy requests can be sent to{" "}
          <a
            href={`mailto:${LEGAL_DOCUMENTS.about.contactEmail}`}
            className="font-semibold text-[#7a2ce2] hover:underline"
          >
            {LEGAL_DOCUMENTS.about.contactEmail}
          </a>
          . If you believe anything on this platform is inaccurate or misleading, tell us and we
          will address it.
        </p>
        <p>
          Our shared legal framework — the same documents linked from every part of the
          ecosystem — is the{" "}
          <Link to="/disclaimer" className="font-semibold text-[#7a2ce2] hover:underline">
            site disclaimer
          </Link>{" "}
          and the{" "}
          <Link to="/privacy-policy" className="font-semibold text-[#7a2ce2] hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
