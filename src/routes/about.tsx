import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EditorialLayout } from "@/components";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <EditorialLayout>
      <section className="mx-auto w-full max-w-[780px] px-4 pb-16 pt-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">About us</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#242436] sm:text-4xl">
          NairaLeap — Nigerian indicators, explained and actioned.
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#4a4a5e]">
          NairaLeap is a Nigerian editorial and services platform. Our newsroom tracks the
          indicators that move Nigeria&apos;s economy — infrastructure, transportation, energy,
          agriculture, technology, health, education and more — and turns them into clear,
          data-grounded stories. Our service portal helps readers act on those indicators:
          requesting help with agriculture, property, business funding, insurance, mortgages,
          recycling and professional services through a guided, review-before-submit process.
        </p>
      <div className="mx-auto mb-8 max-w-[780px] rounded-xl border border-[#f0d24a] bg-[#fdf8e3] px-5 py-4 text-sm leading-6 text-[#6b5a14]">
        <p className="font-bold uppercase tracking-[0.08em]">Draft — pending owner approval</p>
        <p className="mt-1">
          This About Us page is a clearly marked working draft prepared for the NairaLeap relaunch. Business,
          legal and data-protection details still require review and approval by the NairaLeap
          owner before publication. Contact hello@nairaleap.com to correct or approve this page.
        </p>
      </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">What we do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4a4a5e]">
              <li>• Publish indicator-driven editorial coverage across the Nigerian economy.</li>
              <li>• Operate a guided service portal that prepares structured requests for review by the NairaLeap team and suitable partners.</li>
              <li>• Maintain source-checked reference notes, including a starting insurance product catalogue.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#262638]">Team &amp; contact</h2>
            <p className="mt-3 text-sm leading-6 text-[#4a4a5e]">
              Company registration details, team profiles and office address are pending owner
              confirmation and will be added here. General contact: hello@nairaleap.com.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7a2ce2] transition-all hover:gap-2"
          >
            Explore NairaLeap services <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </EditorialLayout>
  );
}
