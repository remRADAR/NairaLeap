import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { EditorialLayout } from "@/components";
import { legalReviewNotice, type LegalDocumentMeta } from "@/features/legal/legalDocuments";

/**
 * Shared layout for canonical legal and corporate pages.
 *
 * One reusable shell provides the semantic structure, review-status banner,
 * last-updated stamp and editorial chrome for About, Disclaimer and Privacy
 * Policy. Because both the editorial website and the services portal link to
 * the same canonical routes, there is exactly one version of each document.
 */

interface LegalPageLayoutProps {
  document: LegalDocumentMeta;
  kicker: string;
  /** One-sentence page summary rendered under the title. */
  intro: ReactNode;
  children: ReactNode;
}

export function LegalPageLayout({ document, kicker, intro, children }: LegalPageLayoutProps) {
  return (
    <EditorialLayout>
      <article className="mx-auto w-full max-w-[820px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7a2ce2] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to homepage
        </Link>

        <header className="mt-7 border-b border-[#e9e9f0] pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a2ce2]">
            {kicker}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#242436] sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#4a4a5e]">{intro}</p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9292a4]">
            Last updated: {document.lastUpdated}
          </p>
        </header>

        <div
          className="mt-8 rounded-xl border border-[#f0d24a] bg-[#fdf8e3] px-5 py-4 text-xs leading-6 text-[#6b5a14]"
          role="note"
          aria-label="Review status"
        >
          <p className="font-bold uppercase tracking-[0.08em]">Draft — pending owner approval</p>
          <p className="mt-1">{legalReviewNotice(document)}</p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-7 text-[#4a4a5e]">{children}</div>
      </article>
    </EditorialLayout>
  );
}

interface LegalSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

/** Semantic section wrapper: one h2 per section, optional anchor id. */
export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="scroll-mt-24">
      <h2 id={id ? `${id}-title` : undefined} className="text-lg font-extrabold text-[#262638]">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

/** Styled list used inside legal sections. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
