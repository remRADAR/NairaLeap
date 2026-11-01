import { getAdPlacement } from "./placements";

interface AdSlotProps {
  /** Placement definition id from ./placements. Unknown ids render nothing. */
  placementId: string;
  className?: string;
}

/**
 * AdSlot — renders a configured advertising placement.
 *
 * Until campaign administration exists, every slot renders its clearly labelled
 * placeholder at a fixed minimum height so layout never shifts. When campaigns
 * are introduced, creative assignment will be resolved from the placement id
 * here; pages should never hard-code ad markup again.
 */
export function AdSlot({ placementId, className }: AdSlotProps) {
  const placement = getAdPlacement(placementId);
  if (!placement || !placement.enabled) return null;

  return (
    <section
      aria-label={placement.placeholderLabel}
      data-ad-placement={placement.id}
      data-ad-area={placement.area}
      className={`editorial-ad-slot mx-auto max-w-[1180px] px-4 py-3 sm:px-6${className ? ` ${className}` : ""}`}
    >
      <div
        className="flex items-center justify-center border-y border-dashed border-[#dcd8e8] bg-[#fbfaff] px-4 text-center"
        style={{ minHeight: `${placement.minPxHeight}px` }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa6b8]">
          {placement.placeholderLabel}
        </span>
      </div>
    </section>
  );
}
