/**
 * Advertising placement definitions for NairaLeap.
 *
 * Every renderable ad slot in the application resolves to one of the placement
 * definitions below. Placements are grouped by surface area (homepage, article,
 * category and service pages) so campaigns can be targeted per area without
 * hard-coding slots into page markup.
 *
 * NOTE: These definitions describe WHERE an advertisement can appear. They do
 * not contain any campaign, creative or price data. Campaign assignment and
 * rate-card pricing are administered separately (see ./rateCard) and require
 * explicit owner approval before anything paid goes live.
 */

export type AdArea = "homepage" | "article" | "category" | "service";

export interface AdPlacement {
  /** Stable identifier used by pages and the rate card. */
  id: string;
  /** Surface area the slot belongs to. */
  area: AdArea;
  /** Human-readable position name shown in admin tooling. */
  position: string;
  /** Short description of where the slot renders. */
  description: string;
  /** Accessible label / placeholder text while no campaign is assigned. */
  placeholderLabel: string;
  /** Minimum rendered height in px so layout does not shift when a campaign loads. */
  minPxHeight: number;
  /** Slots can be switched off globally without removing markup. */
  enabled: boolean;
}

export const AD_PLACEMENTS: Record<string, AdPlacement> = {
  "homepage-top": {
    id: "homepage-top",
    area: "homepage",
    position: "Homepage — below hero",
    description: "Leaderboard slot directly under the featured story hero, above the taxonomy ticker.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "homepage-bottom": {
    id: "homepage-bottom",
    area: "homepage",
    position: "Homepage — above footer note",
    description: "Leaderboard slot after the perspectives carousel, above the archive footer note.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "article-inline": {
    id: "article-inline",
    area: "article",
    position: "Article — mid-body",
    description: "In-content slot inserted between article body sections.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "article-end": {
    id: "article-end",
    area: "article",
    position: "Article — after body",
    description: "Slot after the article body, before related-content sections.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "category-list-top": {
    id: "category-list-top",
    area: "category",
    position: "Archive / category — above grid",
    description: "Leaderboard slot above the archive story grid.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "category-sidebar": {
    id: "category-sidebar",
    area: "category",
    position: "Archive / category — sidebar",
    description: "Vertical slot reserved for a future archive sidebar rail.",
    placeholderLabel: "Advertisement",
    minPxHeight: 250,
    enabled: false,
  },
  "service-landing-top": {
    id: "service-landing-top",
    area: "service",
    position: "Service landing — above hero card",
    description: "Slot above the service landing hero card on /services/$service pages.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
  "service-landing-footer": {
    id: "service-landing-footer",
    area: "service",
    position: "Service landing — above portal footer",
    description: "Slot at the bottom of service landing pages, above the portal footer.",
    placeholderLabel: "Advertisement",
    minPxHeight: 104,
    enabled: true,
  },
};

export function getAdPlacement(id: string): AdPlacement | undefined {
  return AD_PLACEMENTS[id];
}

export function listPlacementsByArea(area: AdArea): AdPlacement[] {
  return Object.values(AD_PLACEMENTS).filter((placement) => placement.area === area);
}
