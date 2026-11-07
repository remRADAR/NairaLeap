import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalList, LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { buildLegalHead, LEGAL_DOCUMENTS } from "@/features/legal/legalDocuments";

export const Route = createFileRoute("/privacy-policy")({
  head: () => buildLegalHead("privacy-policy"),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const email = LEGAL_DOCUMENTS["privacy-policy"].contactEmail;

  return (
    <LegalPageLayout
      document={LEGAL_DOCUMENTS["privacy-policy"]}
      kicker="Legal"
      intro={
        <>
          This privacy policy explains what personal information NairaLeap collects across the
          NairaLeap Editorial website and the NairaLeap Services portal, why we collect it, where
          it is stored, who processes it on our behalf, and the rights available to you. It is
          written to reflect how the platform actually works today, and it is framed with
          reference to the Nigeria Data Protection Act 2023 (NDPA). Where an operational fact is
          not yet confirmed, this policy says so instead of inventing it.
        </>
      }
    >
      <LegalSection id="personal-information" title="1. Personal information we collect">
        <p>
          NairaLeap operates two connected experiences that collect different kinds of
          information:
        </p>
        <LegalList
          items={[
            <>
              <strong>NairaLeap Editorial</strong> (the public website, archive and articles)
              works without an account. It stores your preferences — such as interface theme and
              language choices — in your own browser, and it serves published content and
              advertising placements. It does not require you to submit personal information.
            </>,
            <>
              <strong>NairaLeap Services</strong> (the services portal, customer workspace and
              guided onboarding) supports optional user accounts and service requests. This is
              where the personal information described below is collected.
            </>,
          ]}
        />
        <p>
          We do not collect more than the platform needs, and we do not buy or sell personal
          information. Where a fact below — such as a retention period or a lawful basis — is
          still awaiting confirmation by the owner, it is marked{" "}
          <strong>&quot;pending confirmation&quot;</strong> rather than asserted.
        </p>
      </LegalSection>

      <LegalSection id="account-information" title="2. Account information">
        <p>
          If you create a NairaLeap Services account, we collect the information you provide at
          sign-up and sign-in: your email address, your password (stored only as a
          cryptographically hashed value by our authentication provider — never in plain text),
          and basic account metadata such as account creation and sign-in timestamps. If your
          account is designated an administrator account, that designation is stored with your
          account profile.
        </p>
        <p>
          We do not currently collect your name, phone number, address or date of birth as part
          of account creation, and we do not offer social-login options. If you notice content
          on the platform stating otherwise, treat it as outdated.
        </p>
      </LegalSection>

      <LegalSection id="service-request-information" title="3. Service-request information">
        <p>
          NairaLeap Services lets you describe a need and prepare a structured request before
          submitting it. Information connected to a submitted request includes:
        </p>
        <LegalList
          items={[
            "Your account identifier, linking the request to your customer account.",
            "The service category and the structured answers you provide in the guided flow.",
            "The submitted request payload itself, which contains whatever details you chose to enter about your need.",
            "Technical bookkeeping for the request: its status, a submission identifier used to prevent duplicate submissions, the submission source, and timestamps.",
          ]}
        />
        <p>
          You choose what to put in a request. We ask you to review the request before you
          submit it, and we encourage you not to include more personal detail than the request
          needs. Requests are reviewed by the NairaLeap team and, where appropriate, by suitable
          providers and partners, as described in our disclaimer.
        </p>
      </LegalSection>

      <LegalSection id="technical-information" title="4. Technical and diagnostic information">
        <p>
          Like most web platforms, NairaLeap receives standard technical information when you
          use it, such as your request logs, which may include your IP address, browser type and
          the pages requested. This information is processed by our hosting and infrastructure
          providers to deliver, secure and troubleshoot the platform.
        </p>
        <p>
          We do not currently operate our own analytics, tracking or advertising-technology
          cookies. Advertising placements on the editorial website are served as part of the
          site, and we do not attach third-party behavioural tracking profiles to your visits.
        </p>
      </LegalSection>

      <LegalSection id="storage" title="5. Session, authentication and browser storage">
        <p>
          NairaLeap uses the following browser storage, all of which you can inspect and clear
          yourself through your browser settings:
        </p>
        <LegalList
          items={[
            <>
              <strong>Authentication session cookies.</strong> If you sign in, our authentication
              provider sets cookies that keep you signed in. These cookies are used only to
              authenticate you and to protect sessions; they are not advertising or tracking
              cookies.
            </>,
            <>
              <strong>Local preferences (browser localStorage).</strong> Your interface theme
              and language choices, editorial content caches used to speed up the newsroom, and
              the remembered position of the onboarding assistant are stored in your own
              browser.
            </>,
            <>
              <strong>Onboarding state (browser sessionStorage).</strong> While you use the
              guided assistant, your in-progress answers and conversation panel state are held
              in your browser&apos;s session storage and are cleared when you close the tab.
            </>,
          ]}
        />
        <p>
          These browser stores are readable only by this website in your browser. Clearing your
          browser data for this site removes them.
        </p>
      </LegalSection>

      <LegalSection id="purposes" title="6. How and why we use information">
        <p>We use personal information only to operate the platform you are using:</p>
        <LegalList
          items={[
            "To create and secure your account and keep you signed in.",
            "To store, review and progress the service requests you submit.",
            "To provide customer support and respond to your questions, corrections and complaints.",
            "To protect the platform, accounts and requests against misuse, fraud and technical failure.",
            "To keep the service working, fix defects and improve the onboarding experience.",
          ]}
        />
        <p>
          We do not use your account or request information for automated profiling or to sell,
          rent or trade personal information to anyone.
        </p>
      </LegalSection>

      <LegalSection id="lawful-bases" title="7. Legal bases for processing">
        <p>
          We process personal information under the lawful bases recognised by the Nigeria Data
          Protection Act 2023, which include performance of a contract with you (operating your
          account and your requests), our legitimate interests in running and securing the
          platform, and compliance with legal obligations. The exact mapping of each processing
          activity to its NDPA lawful basis is <strong>pending confirmation</strong> by the owner
          and should be finalised with qualified counsel as part of approving this policy.
        </p>
        <p>
          Where consent is required — for example for future direct-marketing features — we will
          ask for it clearly and separately. The editorial website currently does not operate a
          newsletter signup backend, so no email addresses are collected there today; if that
          changes, this policy will be updated to say exactly what is collected and with what
          consent.
        </p>
      </LegalSection>

      <LegalSection id="storage-hosting" title="8. Data storage and hosting">
        <p>
          The NairaLeap application is hosted on a cloud hosting platform (currently Vercel), and
          account and service-request data is stored in a managed database provided by our
          authentication and database provider (currently Supabase). Access to account and
          request data in the database is restricted: customers can access their own requests, and
          administrator-level access is limited to accounts designated as administrators.
        </p>
        <p>
          The physical location of the servers used by these providers — including whether any
          data is hosted outside Nigeria or transferred internationally — is{" "}
          <strong>pending confirmation</strong> with the providers and will be recorded here once
          verified.
        </p>
      </LegalSection>

      <LegalSection id="processors" title="9. Service providers processing on our behalf">
        <p>
          NairaLeap uses a small number of service providers that process personal information
          only on our instructions, to operate the platform:
        </p>
        <LegalList
          items={[
            <>
              <strong>Supabase</strong> — authentication and the database storing accounts and
              service requests.
            </>,
            <>
              <strong>Vercel</strong> — application hosting, delivery and request logs.
            </>,
            <>
              <strong>A payment gateway (optional).</strong> The portal carries integration for a
              payment gateway; payment credentials are handled server-side and card or bank
              details are not collected or stored by NairaLeap itself. Whether and how payment
              processing is activated is <strong>pending confirmation</strong> by the owner.
            </>,
          ]}
        />
        <p>
          If other providers are added, or content integrations (for example the original
          WordPress archive source) begin processing personal information, this section will be
          updated before that processing starts.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="10. Sharing and disclosure">
        <p>
          We do not sell your personal information, and we do not share it for third-party
          marketing. We share personal information only:
        </p>
        <LegalList
          items={[
            "With the service providers listed above, strictly to operate the platform.",
            "Where a service request you submitted needs to be reviewed or fulfilled by a suitable provider or partner, we share the minimum parts of that request needed for them to assess it — and only for requests you chose to submit.",
            "Where we are legally required, or to protect the rights, safety or security of NairaLeap, its users or others.",
          ]}
        />
        <p>
          We require any provider or partner receiving request information to handle it
          confidentially and only for the purpose of assessing the request.
        </p>
      </LegalSection>

      <LegalSection id="international-transfers" title="11. International transfers">
        <p>
          Because our providers are cloud services, some processing may take place outside
          Nigeria. The specific transfer arrangements, safeguards and provider sub-processors
          are <strong>pending confirmation</strong> and will be documented here as part of owner
          approval of this policy, in line with the NDPA&apos;s conditions for transfers of
          personal data.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="12. Retention and deletion">
        <p>
          We keep personal information only as long as needed for the purposes described in this
          policy. Specific retention periods — how long accounts, service requests and technical
          logs are kept after their last use — are{" "}
          <strong>pending confirmation</strong> by the owner and must not be guessed. As
          committed here, once approved they will be published in this section.
        </p>
        <p>
          You may request deletion of your account and request information at any time via the
          contact address below, and we will action deletion in line with the NDPA, subject to
          any records we are legally required to keep.
        </p>
      </LegalSection>

      <LegalSection id="security" title="13. Security safeguards">
        <p>
          We protect personal information with measures appropriate to the platform, including
          password hashing rather than plain-text password storage, authentication cookies
          designed to protect sessions, strict database access rules that ensure each customer
          can access only their own requests, restricted administrator access, and separation of
          secret credentials from the public application. We do not claim security
          certifications we do not hold; any future certifications will be published here when
          they are real.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="14. Your rights">
        <p>
          Under the Nigeria Data Protection Act 2023, you have rights over your personal
          information, including the rights to be informed (this policy), to access and obtain a
          copy of your personal information, to rectify inaccuracies, to request deletion where
          lawful, to object to or restrict certain processing, and to lodge a complaint with the
          Nigeria Data Protection Commission.
        </p>
        <p>
          To exercise any right, contact us at{" "}
          <a href={`mailto:${email}`} className="font-semibold text-[#7a2ce2] hover:underline">
            {email}
          </a>
          . We will verify your identity before making changes to an account. The specific
          response times we commit to are <strong>pending confirmation</strong> by the owner and
          will be published once approved.
        </p>
      </LegalSection>

      <LegalSection id="privacy-requests" title="15. Privacy questions and complaints">
        <p>
          Questions, corrections, privacy requests and complaints about this policy or your
          personal information can be sent to{" "}
          <a href={`mailto:${email}`} className="font-semibold text-[#7a2ce2] hover:underline">
            {email}
          </a>
          . The designation of a formal data-protection officer or privacy contact (and their
          details, if one is appointed) is <strong>pending confirmation</strong> by the owner and
          will be published here once decided.
        </p>
        <p>
          You also have the right to complain to the Nigeria Data Protection Commission if you
          believe your personal information has been mishandled and we have not resolved it.
        </p>
      </LegalSection>

      <LegalSection id="children" title="16. Children and vulnerable users">
        <p>
          NairaLeap is intended for a general audience and is not directed at children. We do not
          knowingly collect personal information from children, and we do not knowingly create
          service accounts for minors. Where a service request concerns a child or a vulnerable
          person, the adult completing the request is responsible for making sure the request and
          any personal information it contains is provided appropriately and lawfully. If you
          believe a child&apos;s personal information has reached us, contact us and we will
          delete it.
        </p>
      </LegalSection>

      <LegalSection id="updates" title="17. Changes to this policy">
        <p>
          This policy states its last-updated date at the top of the page. When we make material
          changes we will update that date and, where the change matters to you, announce it on
          the platform. The current version is always the one published at this address. This
          version is a working draft pending owner approval and legal review, as the banner on
          this page states.
        </p>
        <p>
          See also our{" "}
          <Link to="/disclaimer" className="font-semibold text-[#7a2ce2] hover:underline">
            disclaimer
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
