# NairaLeap — Blogsy Homepage Checkpoint

## Checkpoint scope

This checkpoint adapts the authenticated WordPress Blogsy homepage at `https://nairaleap.ct.ws/` into the NairaLeap repository while keeping the service portal as the product destination.

### Routes

- `/` — editorial Blogsy-inspired homepage
- `/services` — existing NairaLeap service portal
- `/services/$service` — canonical service landing pages
- `/auth`, `/dashboard`, `/requests`, and onboarding routes — existing portal flows

## Homepage architecture

`src/components/layout/EditorialLayout.tsx` owns the shared editorial shell:

- newsletter strip
- centered Nairaleap wordmark and Indicator Drivers tagline
- exact WordPress Main Navigation taxonomy
- touch-friendly taxonomy submenus for mobile/tablet
- search and dark-mode controls
- indicator ticker
- Services CTA into `/services`
- social footer

`src/routes/index.tsx` composes the homepage sections:

- featured lead story
- Top Stories card grid
- All Stories list

`src/data/wordpressEditorial.ts` contains a reusable snapshot of verified WordPress article titles, dates, categories, excerpts, and source links. It is intentionally isolated so a future WordPress REST/CMS adapter can replace the snapshot without changing page composition.

`src/features/navigation-agent/wordpressMainNavigation.ts` contains the typed navigation taxonomy extracted from the WordPress Main Navigation editor.

## Responsive verification

Validated with Chromium screenshots at:

- mobile: `375 × 812`
- tablet: `768 × 1024`

Verified behaviors:

- taxonomy navigation wraps without horizontal overflow
- Services CTA remains visible
- hero typography remains readable
- Top Stories cards adapt across breakpoints
- ticker clips instead of widening the page
- taxonomy submenu opens on touch devices
- dark-mode control has editorial styles

## Validation commands

```bash
bun install --frozen-lockfile
bunx tsc --noEmit
bun run build
bun run lint
```

TypeScript and production build passed at this checkpoint. The repository-wide lint command still reports pre-existing formatting errors in unrelated feature type files; the responsive editorial files are formatted.

## Local preview

```bash
npm run dev -- --host 0.0.0.0 --port 4173
```

The Vite preview host is allowlisted in `vite.config.ts` for the current sandbox preview hostname.

## Next recommended work

1. Replace the static editorial snapshot with a WordPress REST API/content adapter.
2. Add real featured/top-story image URLs from WordPress media instead of gradient placeholders.
3. Add a functional search overlay and newsletter subscription flow.
4. Preserve `/services` as the portal boundary; do not move service intake back into the editorial homepage.
5. Reconcile remaining repository-wide lint formatting errors before the next feature checkpoint.
