import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildLegalHead, LEGAL_DOCUMENTS } from "@/features/legal/legalDocuments";

export const Route = createFileRoute("/disclaimer")({
  head: () => buildLegalHead("disclaimer"),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPageLayout
      document={LEGAL_DOCUMENTS.disclaimer}
      kicker="Legal"
      intro={
        <>
          This disclaimer applies to the entire NairaLeap ecosystem — the NairaLeap Editorial
          website and the NairaLeap Services portal — including all pages, articles, service
          listings, guided tools, automated assistants and communications published under the
          NairaLeap name. By using this platform you accept this disclaimer in full.
        </>
      }
    >
      <LegalSection id="general-information" title="1. General information">
        <p>
          NairaLeap publishes information about the Nigerian economy, economic indicators,
          markets, public and private services, and related opportunities. All content on this
          platform — including migrated stories from the original Naira &amp; Kobo archive — is
          provided for general informational and educational purposes.
        </p>
        <p>
          Nothing on this platform constitutes professional advice of any kind — financial,
          investment, insurance, mortgage, lending, legal, accounting, tax, property, valuation
          or business advice — and it must not be treated as a substitute for advice from a
          qualified, licensed professional who knows your circumstances. NairaLeap is a media
          and information platform and a service-discovery and request-preparation platform; it
          is not a licensed provider of regulated financial, insurance, mortgage, real-estate
          or legal services, and it does not hold itself out as one.
        </p>
        <p>
          While we take reasonable care over what we publish, NairaLeap does not warrant that
          any information on the platform is complete, accurate, current, fit for a particular
          purpose, or applicable to your situation.
        </p>
      </LegalSection>

      <LegalSection id="editorial-accuracy" title="2. Editorial accuracy and source limitations">
        <p>
          Our editorial content is compiled from official statistics, public records, reputable
          news reporting and our own reporting, including stories migrated from the original
          Naira &amp; Kobo WordPress archive. Migrated stories are preserved as originally
          published, with their original source links; they reflect the information available at
          the time of publication, not today.
        </p>
        <p>
          Economic data is inherently provisional. Figures such as inflation, exchange rates,
          interest rates, fuel and commodity prices, output measures and project timelines are
          revised, restated or contradicted over time, and different official sources may
          disagree. Where we rely on a source, we name it where possible; where figures are
          estimates or unverified, that is what we say they are.
        </p>
        <p>
          Opinions and analysis published on this platform are the views of their authors at
          the time of publication and do not necessarily represent the views of NairaLeap, its
          team, its owner or any partner. Headlines and summaries are editorial aids, not
          statements of fact.
        </p>
      </LegalSection>

      <LegalSection id="financial-information" title="3. Financial and investment information">
        <p>
          Articles and tools that discuss prices, markets, currencies, savings, investment
          opportunities or economic conditions are journalism and general information only.
          They are not a recommendation, solicitation, offer or endorsement to buy, sell or hold
          any asset, security, currency or commodity, and they do not constitute investment
          advice under any applicable Nigerian regulatory framework.
        </p>
        <p>
          Investing involves risk, including total loss of capital. Past performance is never a
          guide to future results. You should always obtain advice from a licensed financial
          adviser or a firm regulated by the appropriate Nigerian authorities before making any
          financial decision. NairaLeap accepts no liability for financial decisions made in
          reliance on our content.
        </p>
      </LegalSection>

      <LegalSection id="insurance" title="4. Insurance information">
        <p>
          Where NairaLeap presents insurance-related information, service descriptions or guided
          pathways, that material is introductory and descriptive only. It is not an insurance
          quote, an insurance contract, a coverage confirmation, a statement of policy terms, or
          advice from a licensed insurance intermediary.
        </p>
        <p>
          Actual coverage, premiums, exclusions, conditions and eligibility can only be
          determined by a licensed insurer or licensed insurance intermediary, in a binding
          policy document. NairaLeap does not underwrite, broker, solicit or approve insurance
          and does not guarantee any outcome of an insurance request submitted through the
          platform.
        </p>
      </LegalSection>

      <LegalSection id="mortgage-lending" title="5. Mortgage and lending information">
        <p>
          Mortgage and lending information on NairaLeap — including rates, requirements,
          eligibility descriptions and guided pathways — is general and indicative only. It is
          not a mortgage offer, a loan offer, a credit decision, a pre-approval, a promise of
          lending, or regulated financial or mortgage advice.
        </p>
        <p>
          Mortgage and loan availability, terms, rates and eligibility are determined solely by
          lenders and regulated institutions based on their own assessment, and they change
          without notice. Submitting a request through NairaLeap Services does not create any
          lender-borrower relationship and does not obligate any lender to lend. NairaLeap is
          not a lender and is not a licensed mortgage broker.
        </p>
      </LegalSection>

      <LegalSection id="property" title="6. Property and real-estate information">
        <p>
          Property listings, land descriptions, price indications, location details and related
          content on NairaLeap are supplied for discovery and informational purposes. They are
          not an offer to sell, an offer to let, a valuation, a title confirmation or a
          representation that any property is available, accurately described, free of
          encumbrance, or legally fit for any purpose.
        </p>
        <p>
          Property information may come from third-party submitters or providers and has not
          been independently verified by NairaLeap. Before acting on any property opportunity
          you should conduct your own inspection and obtain professional verification of title,
          survey, approvals and all relevant documents from qualified professionals — such as a
          licensed surveyor and a legal practitioner. NairaLeap accepts no responsibility for
          any loss arising from reliance on property information published or routed through the
          platform.
        </p>
      </LegalSection>

      <LegalSection id="business-funding" title="7. Business funding and commercial opportunities">
        <p>
          Information about business funding, grants, procurement, partnerships, tenders and
          other commercial opportunities is published and routed for discovery only. It is not
          an offer of funding, a guarantee of access, an endorsement of any opportunity, or a
          representation that any opportunity remains open, genuine or profitable.
        </p>
        <p>
          Opportunities may carry conditions, deadlines or eligibility requirements not fully
          described here, and they may be changed or withdrawn by the parties that control
          them. Any commercial decision is yours to make, ideally with advice from qualified
          legal, financial and business professionals.
        </p>
      </LegalSection>

      <LegalSection
        id="third-parties"
        title="8. Third-party providers and external websites"
      >
        <p>
          NairaLeap may reference, quote or link to third-party providers, partners, government
          bodies, publications and external websites. Such references do not imply endorsement,
          affiliation, verification or any responsibility on the part of NairaLeap for the
          content, accuracy, products, services or practices of those third parties.
        </p>
        <p>
          Where NairaLeap Services helps you prepare and submit a request that may be reviewed
          by a third-party provider or partner, that provider or partner acts in its own name
          and under its own terms. NairaLeap does not control third-party decisions, pricing,
          timelines or standards of service, and any eventual engagement is directly between
          you and that provider.
        </p>
        <p>
          We are not responsible for the content or practices of websites reached through
          external links, and linking to a site does not mean we endorse it. Follow external
          links at your own discretion.
        </p>
      </LegalSection>

      <LegalSection id="advertising" title="9. Advertising and sponsored content">
        <p>
          The NairaLeap Editorial website carries advertising placements. Advertisements are
          paid placements; they are not editorial content, and their presence is not an
          endorsement of the advertiser or its products by NairaLeap.
        </p>
        <p>
          Where content is sponsored, commissioned or otherwise paid for by a third party, it
          is labelled as such. Any editorial content that references an advertiser is produced
          independently under our editorial standards. Advertisers and sponsors have no control
          over our editorial opinions, conclusions or story selection, and the presence of an
          advertisement is never a guarantee, warranty or recommendation of the advertised
          product, service or opportunity.
        </p>
      </LegalSection>

      <LegalSection id="ai-guidance" title="10. AI-assisted guidance and automated tools">
        <p>
          Parts of the NairaLeap Services portal, including the onboarding assistant
          (&quot;LeapBot&quot;) and guided request flows, use automated tools and pre-written
          guidance to help you describe a need and prepare a request.
        </p>
        <p>
          These tools operate from a fixed, curated knowledge base. They do not use machine
          learning over your personal data, they do not learn from your conversation, and they
          are not a human adviser. Their output is general information and form-filling help —
          not professional advice, not an approval, and not a decision. An automated
          assistant can be wrong or incomplete, and you remain responsible for reviewing every
          request before it is submitted.
        </p>
      </LegalSection>

      <LegalSection id="service-requests" title="11. Service requests, reviews and approvals">
        <p>
          NairaLeap Services allows you to prepare and submit service requests for review. A
          submitted request is an expression of interest, not an approved transaction and not a
          contract.
        </p>
        <p>
          All requests are reviewed by the NairaLeap team, and where appropriate by suitable
          providers and partners, before anything proceeds. NairaLeap may decline, delay,
          question or reject a request for any reason, including incomplete information,
          ineligibility, unavailability of a provider, or any activity that appears unlawful,
          risky or fraudulent.
        </p>
        <p>
          Indicative prices, service descriptions, timelines and preliminary guidance shown
          anywhere on the platform are not guaranteed offers, quotations, approvals or
          commitments. Nothing becomes an offer, approval or binding arrangement until it is
          expressly confirmed in writing by the party with authority to give it — and, in every
          case, a final agreement is made directly between you and the relevant provider, not
          with NairaLeap.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="12. Limitation of liability">
        <p>
          To the fullest extent permitted by applicable Nigerian law, NairaLeap, its owner and
          its team accept no liability for any direct, indirect, incidental, consequential or
          punitive loss — including loss of income, profit, savings, data, business or
          opportunity — arising from your use of, or reliance on, this platform or any content,
          tool, service request, guidance or external link on it.
        </p>
        <p>
          Your use of the platform is entirely at your own risk. We provide the platform on an
          &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind,
          express or implied, including warranties of availability, accuracy, completeness,
          security, merchantability or fitness for a particular purpose.
        </p>
        <p>
          Nothing in this disclaimer excludes or limits liability that cannot lawfully be
          excluded or limited under Nigerian law, or any liability arising from fraud. This
          section, like the rest of this page, is working text prepared for review and has not
          been reviewed or approved by qualified legal counsel; it must not be treated as final
          legal language.
        </p>
        <p>
          Questions or corrections regarding this disclaimer can be sent to{" "}
          <a
            href={`mailto:${LEGAL_DOCUMENTS.disclaimer.contactEmail}`}
            className="font-semibold text-[#7a2ce2] hover:underline"
          >
            {LEGAL_DOCUMENTS.disclaimer.contactEmail}
          </a>
          . See also our{" "}
          <Link to="/privacy-policy" className="font-semibold text-[#7a2ce2] hover:underline">
            privacy policy
          </Link>{" "}
          and the{" "}
          <Link to="/about" className="font-semibold text-[#7a2ce2] hover:underline">
            About NairaLeap
          </Link>{" "}
          page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
