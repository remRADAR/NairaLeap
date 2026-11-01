import { getAdPlacement } from "./placements";

interface AdSlotProps {
  /** Placement definition id from ./placements. Unknown ids render nothing. */
  placementId: string;
  /** Visual tone: "editorial" for the light newsroom theme, "portal" for the dark service portal. */
  tone?: "editorial" | "portal";
  className?: string;
}

/**
 * AdSlot — renders a configured advertising placement.
 *
 * The single advertising system for the whole application: every slot on every
 * surface (homepage, article, category/archive, service pages) resolves through
 * this component and the placement definitions. Until campaign administration
 * exists, every slot renders its clearly labelled placeholder at a fixed
 * minimum height so layout never shifts. When campaigns are introduced,
 * creative assignment will be resolved here from the placement id; pages must
 * never hard-code ad markup.
 */
export function AdSlot({ placementId, tone = "editorial", className }: AdSlotProps) {
  const placement = getAdPlacement(placementId);
  if (!placement || !placement.enabled) return null;

  const isPortal = tone === "portal";

  return (
    <section
      aria-label={placement.placeholderLabel}
      data-ad-placement={placement.id}
      data-ad-area={placement.area}
      className={
        isPortal
          ? `mx-auto w-full max-w-5xl px-4 py-3${className ? ` ${className}` : ""}`
          : `editorial-ad-slot mx-auto max-w-[1180px] px-4 py-3 sm:px-6${className ? ` ${className}` : ""}`
      }
    >
      <div
        className={
          isPortal
            ? "flex items-center justify-center rounded-2xl border border-dashed border-glass-border bg-background/40 px-4 text-center"
            : "flex items-center justify-center border-y border-dashed border-[#dcd8e8] bg-[#fbfaff] px-4 text-center"
        }
        style={{ minHeight: `${placement.minPxHeight}px` }}
      >
        <span
          className={
            isPortal
              ? "text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              : "text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa6b8]"
          }
        >
          {placement.placeholderLabel}
        </span>
      </div>
    </section>
  );
}
