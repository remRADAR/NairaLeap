/**
 * Canonical NairaLeap brand identity.
 *
 * Single source of truth for the parent brand name, positioning and the
 * shared descriptions used by route metadata, the editorial footer and the
 * services portal footer. Both experiences resolve their naming and shared
 * copy from here so the ecosystem always presents one coherent identity.
 *
 * Business facts that are still unverified (registered entity name, official
 * social accounts, final production domain, contact addresses) are intentionally
 * NOT asserted here. They are tracked in docs/legal-owner-approvals.md and must
 * only be added after owner confirmation.
 */

export const NAIRALEAP_BRAND = {
  name: "NairaLeap",
  tagline: "Indicator Drivers",
  description:
    "NairaLeap is a Nigerian digital media, information and services ecosystem connecting people with the knowledge, opportunities and practical pathways shaping Nigeria's economy.",
} as const;

export const NAIRALEAP_EDITORIAL = {
  name: "NairaLeap Editorial",
  description:
    "Economic indicators, journalism, news and analysis on the forces moving Nigeria's economy — infrastructure, energy, agriculture, business, policy and more.",
} as const;

export const NAIRALEAP_SERVICES = {
  name: "NairaLeap Services",
  description:
    "Service discovery, guided onboarding, request preparation and access to relevant solutions across the Nigerian economy.",
} as const;

/**
 * Production origin. This matches the origin the repository already uses for
 * Open Graph image URLs (`https://nairaleap.vercel.app/nairaleap-wordmark.png`).
 * Confirmation of the final canonical domain is tracked in
 * docs/legal-owner-approvals.md; update this constant once the owner confirms
 * the production domain so canonical and og:url values stay accurate.
 */
export const NAIRALEAP_SITE_ORIGIN = "https://nairaleap.vercel.app";

/**
 * Existing contact address that was already published in the services portal
 * footer before this rebrand. Kept for continuity; verification is tracked in
 * docs/legal-owner-approvals.md and must be confirmed by the owner.
 */
export const NAIRALEAP_CONTACT_EMAIL = "hello@nairaleap.com";
