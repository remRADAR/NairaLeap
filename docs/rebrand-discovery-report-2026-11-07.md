# NairaLeap Corporate Rebrand — Technical Discovery Report

**Date:** 2026-11-07
**Scope:** Phase 1 reconnaissance for the corporate rebrand directive (Naira & Kobo → NairaLeap), About Us, legal pages, and dual-footer reconstruction.
**Base inspected:** `remRADAR/NairaLeap` `main` @ `13a23ee` plus open PRs #11, #12, #13 (read-only; nothing was modified on `main` during reconnaissance).

## 1. Existing implementation

- **Two-experience architecture, already in place.** The editorial website (`/`, `/articles`, `/articles/$slug`, `/archive`) uses `EditorialLayout` (light editorial design, own header/menu, dark-mode CSS class); the services portal (`/services`, `/services/$service`, `/insurance`, `/mortgage`, `/auth`, `/dashboard`, `/requests`, onboarding) uses `AppLayout` (dark glass portal shell). Route-level `head()` support via TanStack Start is already proven by `auth.tsx`, `insurance.tsx`, `mortgage.tsx`, `articles.$slug.tsx`.
- **Migrated archive.** 3,688 WordPress posts from the original Naira & Kobo CMS live in `src/data/wordpressEditorial.ts`, with 385 resolved media files; article pages link back to the original WordPress source.
- **Working integrations.** Supabase Auth (email/password, `@supabase/ssr` cookies), `public.service_requests` table with customer-owns RLS and admin access via `app_metadata.role = 'admin'` (`is_admin()`), admin request queue with follow-up statuses and CSV export, guided onboarding (`NairaLeapGuideContainer`) and LeapBot (`NairaLeapBot`), service backgrounds, i18n scaffolding (English active, Hausa/Igbo/Yoruba/Tiv disabled), Admin Studio at `/admin` guarded by `/admin-login`.
- **Tests.** Cypress suites: `brand-auth`, `service-navigation`, `service-role-profiles`, `ui-interactions`, `leapbot-chauffeur`, `plugin-integration-status`, `admin-studio`, `editorial-homepage`; shared helper `assertServicePage` in `cypress/support/e2e.ts`.

## 2. Missing functionality

- No `/about`, `/disclaimer`, or `/privacy-policy` routes on `main` (only draft versions exist in PR #11, based on an older base `3fa0fcc`).
- No shared legal-document architecture; nothing links to legal pages from either experience.
- No route-level head on `/`, `/services`, `/archive`, `/articles`, `/_authenticated` — these inherit the root head.
- Editorial footer had no legal links, no company links, and no working contact path.

## 3. Incorrect branding found on `main`

- **Root head asserts a service-portal identity for the whole site:** `title`, `application-name`, `apple-mobile-web-app-title`, `og:title`, `og:description` all say "Nairaleap - Service Portal" — so the editorial homepage (the public website) inherits a portal identity.
- **Casing drift:** user-visible strings mix `Nairaleap`, `NairaLeap` (editorial menu button, `ServiceLandingPage` caption, insurance/mortgage heads and body copy, article-route titles, footer copyright).
- **Editorial footer social links are generic platform homepages** (`https://www.facebook.com/`, `https://twitter.com/`, `https://t.me/`, `https://www.instagram.com/`, `https://youtube.com/`) presented as if they were official accounts. No verified NairaLeap social destinations exist.
- **Portal footer dead links:** Careers, Press, Partners, Support, Terms, Cookies render as inert `<span>`s; "About" points to `/#about` which does not exist; Privacy/Terms/Cookies duplicate a "Legal" column without destinations.
- **Copyright lines** are inconsistent ("Nairaleap — Indicator Drivers" vs "Nairaleap - Service Portal").
- **`public/manifest.webmanifest`:** `name: "Nairaleap - Service Portal"`, `short_name: "Nairaleap"` — wrong casing and portal-only naming.
- **Logo accessibility labels:** header `alt`/`aria-label`s use the portal name on both experiences ("Nairaleap blog home", "Go to Nairaleap blog", "Nairaleap - Service Portal").

## 4. Existing reusable components

- `EditorialLayout` / `AppLayout` (shells), `Container`, `GlassCard`, `BrandButton`, `ServiceCard`, `Reveal`.
- Route-level `head()` pattern from `auth.tsx`/`insurance.tsx`.
- PR #11's "Draft — pending owner approval" banner pattern — extracted and generalised into `LegalPageLayout` + `legalDocuments.ts` (PR #11 itself was not merged and is superseded by this work; see §7).

## 5. Required files and routes (as implemented)

- New: `src/features/brand/brand.ts`, `src/features/legal/legalDocuments.ts`, `src/components/legal/LegalPageLayout.tsx`, `src/routes/about.tsx`, `src/routes/disclaimer.tsx`, `src/routes/privacy-policy.tsx`.
- Modified: `__root.tsx`, `index.tsx`, `services.tsx`, `auth.tsx`, `insurance.tsx`, `mortgage.tsx`, `archive.tsx`, `articles.tsx`, `articles.$slug.tsx`, `_authenticated.tsx`, `EditorialLayout.tsx`, `AppLayout.tsx`, `ServiceLandingPage.tsx`, `components/index.ts`, `routeTree.gen.ts` (generator-equivalent additions only), `public/manifest.webmanifest`.
- Tests: new `corporate-pages.cy.ts`, `portal-footer.cy.ts`; updated `brand-auth.cy.ts`, `service-navigation.cy.ts`, `plugin-integration-status.cy.ts`, `cypress/support/e2e.ts`.

## 6. Integration dependencies and verified facts used

- Privacy policy is grounded in the actual inspected flows: Supabase Auth cookies; `public.service_requests` columns and RLS; browser `localStorage` (`nairaleap.locale`, `nairaleap.culture`, `nairaleap.studio.*`, `nairaleap.bot.position`) and `sessionStorage` (`nairaleap.bot.*`, `nairaleap.pending-guide`); providers Supabase + Vercel; optional WordPress API and payment-gateway env vars; the newsletter strip button is inert (no backend). The unused `sidebar.tsx` (`sidebar_state` cookie) is a template with no imports.
- Canonical origin `https://nairaleap.vercel.app` reused from the existing og:image URLs — flagged for owner confirmation.

## 7. Potential regressions and mitigations

- **Route tree:** `routeTree.gen.ts` extended to match generator output for the three new flat routes; a local `vite`/dev run must regenerate it identically (never hand-edit further).
- **Footer suppression rule:** `AppLayout` wraps the footer in `lg:hidden` for compact service pages; preserved and covered by the new portal-footer spec plus the existing `service-navigation` viewport test.
- **Cypress selector churn:** `brand-auth`, `service-navigation`, `plugin-integration-status` and `cypress/support/e2e.ts` assert old strings; all updated to the new titles/labels.
- **PR overlaps:** PR #11 (about/disclaimer/privacy drafts) is superseded — do not merge; PR #13 (Nigerian clock in the newsletter strip) touches `EditorialLayout`'s top strip, which this work does not modify — merge order should rebase whichever lands second; PR #12 (editorial media recovery) does not overlap.

## 8. Recommended implementation order (as executed)

1. Shared brand + legal architecture (`brand.ts`, `legalDocuments.ts`, `LegalPageLayout.tsx`).
2. Legal/corporate routes (`about`, `disclaimer`, `privacy-policy`) and generator-equivalent route-tree update.
3. Route-level metadata corrections (root fallback, editorial, portal, article routes, manifest).
4. Dual footer reconstruction (editorial + portal) with canonical legal links.
5. Test extension and selector updates.
6. Docs: discovery report, owner-approval register, handoff checkpoint.
