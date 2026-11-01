import { createFileRoute } from "@tanstack/react-router";
import { EditorialLayout } from "@/components";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <EditorialLayout>
      <section className="mx-auto w-full max-w-[780px] px-4 pb-16 pt-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">Legal</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#242436] sm:text-4xl">
          Disclaimer
        </h1>
      <div className="mx-auto mb-8 max-w-[780px] rounded-xl border border-[#f0d24a] bg-[#fdf8e3] px-5 py-4 text-sm leading-6 text-[#6b5a14]">
        <p className="font-bold uppercase tracking-[0.08em]">Draft — pending owner approval</p>
        <p className="mt-1">
          This Disclaimer is a clearly marked working draft prepared for the NairaLeap relaunch. Business,
          legal and data-protection details still require review and approval by the NairaLeap
          owner before publication. Contact hello@nairaleap.com to correct or approve this page.
        </p>
      </div>
        <div className="space-y-8 text-sm leading-7 text-[#4a4a5e]">
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">Editorial content</h2>
            <p className="mt-2">
              All articles and indicators on NairaLeap are published for general information
              purposes. While we track official and reputable sources, figures change and
              official revisions occur. Always confirm critical figures with the primary source
              before relying on them.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">No financial or professional advice</h2>
            <p className="mt-2">
              Nothing on NairaLeap is investment, legal, tax, insurance or other regulated
              professional advice. Insurance product references and indicative amounts are not an
              insurer&apos;s confirmed quotation; terms, exclusions and benefits must be confirmed
              by a licensed provider. Service pages are introductions, not offers, and outcomes
              depend on partner review and approval.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">External links</h2>
            <p className="mt-2">
              We link to third-party sources and partners for context. We do not control their
              content and are not responsible for it.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">Advertising</h2>
            <p className="mt-2">
              Advertisements and sponsored placements are clearly labelled. Sponsored content is
              the advertiser&apos;s responsibility and is not editorial endorsement. Advertising
              terms and rate cards: [pending owner approval — no rates are published yet].
            </p>
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}
