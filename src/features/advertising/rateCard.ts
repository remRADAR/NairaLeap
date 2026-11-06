/**
 * Administrative rate-card structure for NairaLeap advertising.
 *
 * IMPORTANT — PRICING POLICY:
 * No advertising prices have been set or approved. Every entry below is a
 * DRAFT with `priceNaira: null`. Rates must be decided and approved by the
 * NairaLeap owner before any price is published or any campaign is sold.
 * Do not invent or guess market rates when filling this in.
 *
 * This module intentionally ships no UI: it is the data contract the future
 * admin advertising screen will read and write, kept separate from placement
 * geometry (./placements) so pricing can evolve without touching pages.
 */

import { AD_PLACEMENTS, type AdPlacement } from "./placements";

export type RateUnit = "per_day" | "per_week" | "per_month" | "per_impression" | "per_click" | "flat";
export type RateCardStatus = "draft" | "active" | "retired";

export interface RateCardEntry {
  /** Must match an enabled placement id in ./placements. */
  placementId: string;
  /** Billing basis for the slot. */
  unit: RateUnit;
  /**
   * Approved price in Naira, or null while the rate is pending owner approval.
   * null MUST render as "Price on application / pending approval", never as 0.
   */
  priceNaira: number | null;
  currency: "NGN";
  /** Draft | active | retired lifecycle. Only "active" rates may be quoted externally. */
  status: RateCardStatus;
  /** ISO date (YYYY-MM-DD) the rate takes effect. null until approved. */
  effectiveFrom: string | null;
  /** ISO date the rate was last verified against a signed agreement or owner confirmation. */
  lastVerifiedAt: string | null;
  /** Free-form notes for the admin team (e.g. targeting restrictions, discounts). */
  notes: string;
}

export const RATE_CARD_STATUS_PENDING_APPROVAL = "PENDING_OWNER_APPROVAL";

/**
 * Draft rate card. One entry per enabled placement, all prices null.
 * The owner fills prices; engineering only maintains the structure.
 */
export const RATE_CARD: RateCardEntry[] = Object.values(AD_PLACEMENTS)
  .filter((placement: AdPlacement) => placement.enabled)
  .map((placement: AdPlacement) => ({
    placementId: placement.id,
    unit: "per_month" as RateUnit,
    priceNaira: null,
    currency: "NGN" as const,
    status: "draft" as RateCardStatus,
    effectiveFrom: null,
    lastVerifiedAt: null,
    notes: RATE_CARD_STATUS_PENDING_APPROVAL,
  }));

export function getRateCardEntry(placementId: string): RateCardEntry | undefined {
  return RATE_CARD.find((entry) => entry.placementId === placementId);
}

export function isRateQuotable(entry: RateCardEntry): boolean {
  return entry.status === "active" && entry.priceNaira !== null && entry.effectiveFrom !== null;
}

/** Formats a rate for display, or the pending-approval label when unset. */
export function formatRate(entry: RateCardEntry): string {
  if (!isRateQuotable(entry) || entry.priceNaira === null) {
    return "Price pending owner approval — contact hello@nairaleap.com";
  }
  return `NGN ${entry.priceNaira.toLocaleString("en-NG")} ${entry.unit.replaceAll("_", " ")}`;
}
