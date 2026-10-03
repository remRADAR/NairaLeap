# Service Backgrounds and Runtime Audit — 2026-10-02

**Repository:** `remRADAR/NairaLeap`

**Audited base:** `main` at `d47987b` — [PR #1: Add responsive service background images](https://github.com/remRADAR/NairaLeap/pull/1)

**Scope:** verify the claimed background-image upscale work, validate its runtime integration, and repair blockers discovered while continuing the portal increment.

## Executive summary

The merged change did **not** deliver 4K images. It added twelve new portrait WebP service backgrounds, wired through `AppLayout`, and rendered them in a fixed CSS pseudo-element using `background-size: cover`.

The source files are 1.32–1.57 MP, not 4K. Their portrait aspect ratios are also a poor match for a wide desktop background when `cover` is used: a 16:9 viewport displays only 31.5–42.4% of a source image, depending on the asset ratio.

This audit also exposed three unrelated but release-blocking regressions in the repository state: a stale Bun lockfile, incompatible directly installed TanStack package versions after the security patch, and an untyped service-request query result. Those have been corrected and covered by the complete local verification suite.

## Verified background implementation

The merged PR introduced these mappings in `src/components/layout/AppLayout.tsx`:

- One distinct `/service-backgrounds/<service>-background.webp` path for every one of the 12 catalog services.
- `data-service-id` and `service-page-shell` on each canonical service landing route.
- A fixed `::before` background layer with `background-position: center center`, `background-repeat: no-repeat`, and `background-size: cover`.
- A dark gradient overlay and glass-panel treatment to preserve readable foreground content.

A local browser check rendered `/services/agriculture` successfully at desktop size after the dependency repair. The full Cypress suite now verifies that every canonical service route has its intended CSS background URL and that all 12 static WebP URLs return HTTP 200.

## Asset inventory

| Service asset | Dimensions | Pixels | File size |
| --- | ---: | ---: | ---: |
| `agriculture-background.webp` | 861 × 1537 | 1,323,357 | 209.1 KiB |
| `business-briefs-background.webp` | 1023 × 1358 | 1,389,234 | 155.7 KiB |
| `business-funding-background.webp` | 862 × 1537 | 1,324,894 | 90.6 KiB |
| `customer-support-background.webp` | 862 × 1537 | 1,324,894 | 196.8 KiB |
| `distress-sales-background.webp` | 865 × 1537 | 1,329,505 | 196.1 KiB |
| `insurance-background.webp` | 1023 × 1330 | 1,360,590 | 93.4 KiB |
| `mortgage-background.webp` | 864 × 1537 | 1,327,968 | 183.7 KiB |
| `partnerships-background.webp` | 866 × 1537 | 1,331,042 | 64.3 KiB |
| `professional-services-background.webp` | 1023 × 1537 | 1,572,351 | 271.8 KiB |
| `property-listings-background.webp` | 865 × 1537 | 1,329,505 | 113.1 KiB |
| `recycling-scrap-background.webp` | 861 × 1537 | 1,323,357 | 308.2 KiB |
| `vendor-marketplace-background.webp` | 865 × 1537 | 1,329,505 | 388.5 KiB |

### 4K finding

A portrait 4K target is normally **2160 × 3840** (8,294,400 pixels). None of the committed assets meets this threshold.

Two isolated, AI-assisted restoration experiments were made using the mandated strict-preservation prompt:

> Restore and upscale this image to high resolution while preserving every detail exactly as in the original.

The strongest available result was 1536 × 2752 (4,227,072 pixels). It remains below portrait 4K, so it was deliberately **not** committed or represented as 4K. The experiments also produced multi-megabyte PNG files, whereas the committed WebP files are appropriately compressed for a web background. No original asset was overwritten.

### Desktop composition risk

With `background-size: cover` on a 16:9 desktop viewport, the visible source area is approximately:

| Original aspect ratio | Typical committed files | Source area visible at 16:9 |
| --- | --- | ---: |
| 9:16 | Most service backgrounds | 31.5% |
| 3:4 | Business Briefs and Insurance | 42.4% |
| 2:3 | Professional Services | 37.4% |

This is not a loading failure—the background integration works—but it means that a future true-4K asset replacement should provide deliberate **landscape desktop compositions** (and, ideally, separate mobile portraits) rather than only increasing pixel count.

## Implemented continuation

### Dependency and runtime repair

The previous security patch changed `@tanstack/react-start` from `1.168.26` to `1.168.60` in `package.json` but did not update `bun.lock`. A frozen installation therefore failed. The partial upgrade also left direct router dependencies below the versions required by React Start’s internal stack, producing this SSR failure on every route:

```text
TypeError: {} is not iterable
at handleServerRoutes (.../createStartHandler.ts:960)
```

The portal now pins the compatible set and refreshes the lockfile:

| Package | Resolved version |
| --- | ---: |
| `@tanstack/react-start` | `1.168.60` |
| `@tanstack/react-router` | `1.170.41` |
| `@tanstack/router-plugin` | `1.168.42` |

The version relationship was verified against the npm registry metadata before changes were made:

- <https://registry.npmjs.org/@tanstack%2Freact-start/1.168.60>
- <https://registry.npmjs.org/@tanstack%2Freact-router/1.170.41>
- <https://registry.npmjs.org/@tanstack%2Frouter-plugin/1.168.42>

The request-list server function now returns an explicit query projection, and the root error boundary accepts the router’s `unknown` error contract.

### LeapBot continuity repair

While running the portal’s existing Cypress coverage, a service navigation could occur before the delayed bot reply had been persisted. The reply could then be lost after unmounting the old component instance. Transcript persistence now uses a ref-backed snapshot and writes to session storage synchronously before state is updated.

Price/quote guidance also remains on the current page instead of treating a service name in the question as an unsolicited navigation request. This preserves the commercial safety response and makes the user’s next action explicit.

### Regression coverage

- The service-navigation suite now checks that all twelve service pages resolve their mapped CSS background asset and that the asset is served.
- LeapBot coverage asserts that a quote/guarantee request remains on the current page and that replies persist through explicit service navigation.
- Fixed-position LeapBot assertions use rendered geometry rather than Cypress’s unreliable fixed-element clipping heuristic.
- Animation-dependent homepage card checks now test route/link semantics or wait for hydration instead of depending on below-fold reveal timing.

## Verification evidence

The following completed successfully after the changes:

```bash
npm exec --yes --package=bun -- bun install --frozen-lockfile
npm exec --yes --package=bun -- bunx tsc --noEmit
npm exec --yes --package=bun -- bun run lint
npm exec --yes --package=bun -- bun run build
CYPRESS_BASE_URL=http://127.0.0.1:8091 npm exec --yes --package=bun -- bun run e2e
curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:8091/services/agriculture
```

Results:

- Frozen Bun install: passed with no lockfile changes.
- TypeScript: passed.
- ESLint: passed with seven pre-existing `react-refresh/only-export-components` warnings and no errors.
- Production build: passed.
- Cypress: **32 passing** across branding/authentication, LeapBot, and service navigation suites.
- Local Agriculture service route: **HTTP 200**.

## Not verified

- Production deployment and production environment variables.
- Live Supabase authentication, request insertion, RLS behavior, and user-specific request listing; these remain environment-dependent and were not exercised without configured credentials.
- Native 4K source assets or a provider that can faithfully emit 2160 × 3840 portrait assets.

## Next decision gate

To continue the visual asset work, choose one of these intentional asset strategies:

1. **Provide licensed 4K source imagery** for each service, with at least one landscape desktop composition per service; this is the only route that can truthfully claim native 4K.
2. **Approve high-resolution AI restorations** up to the available 1536 × 2752 output, acknowledging that they are not 4K and may introduce generative detail.
3. **Adopt responsive art direction**: landscape desktop assets plus portrait mobile assets, with CSS selecting the correct composition by viewport.

Do not deploy or replace the current compressed WebPs as “4K” without that decision.
