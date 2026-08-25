# Nairaleap Native Language & Display System

## Architecture and implementation brief

**Project:** Nairaleap - Service Portal  
**Repository:** [`remRADAR/NairaLeap`](https://github.com/remRADAR/NairaLeap)  
**Date:** 25 August 2026  
**Author:** Manus AI  
**Status:** Architecture proposal; no locale or theme application code was changed in this pass

## Executive recommendation

Nairaleap should add language and display preferences as **native platform capabilities**, not as isolated widgets. The correct implementation is a small, typed preference layer at the application root, a scalable language registry, lazy-loaded approved dictionaries, deterministic fallback behaviour, and centralized theme tokens. The existing dark purple interface remains the baseline. The new White mode should be a deliberate Nairaleap light theme rather than a generic inversion.

The safest first release is **English as the complete baseline plus a verified translation pilot for a small number of locales**. The portal should not label a language as fully supported until its critical navigation, onboarding, consent, financial, verification and error terminology has been human-reviewed. The registry must be able to contain more languages than the first release without requiring changes to navigation components.

## Current verified baseline

The current repository uses TanStack Start, React, Vite and Tailwind CSS. The root route loads the global stylesheet and currently renders the document shell with `lang="en"`. The global stylesheet is dark-only for now, with existing Nairaleap purple, glass, background and foreground tokens. The shared `AppLayout` contains the primary desktop/mobile navigation. The current service catalog, Guide, onboarding, authentication and service routes render user-facing strings directly in components or feature configuration rather than through a translation function.

This means the first implementation should introduce the preference and token foundations before attempting a complete portal-wide translation migration. A partial migration that leaves critical labels, validation messages or consent text untranslated would create a misleading experience.

## Target experience

The user can open a compact **Language** control and a compact **Display** control from the existing navigation. On desktop, both sit within the current navigation without displacing the primary links. On mobile, they move into the existing mobile menu panel. Language selection preserves the current route, service, form values, progress and agent context. Display selection changes only the visual theme and preserves language and workflow state.

The user-facing language label should show an English name and native name where available, such as `Yorùbá — Yorùbá`, rather than exposing internal codes. A globe/language icon should represent language; a national flag should not be used as a proxy for language.

## Logical architecture

```text
RootShell
  ├─ PreferenceProvider
  │    ├─ LocaleStore
  │    └─ DisplayStore
  ├─ Navigation
  │    ├─ LanguageSelector
  │    └─ DisplaySelector
  └─ Application content
       ├─ t(key, variables)
       ├─ service/page content
       ├─ onboarding content
       └─ Navigation Agent content

LocaleStore
  ├─ NigerianLanguageRegistry
  ├─ lazy locale loader
  ├─ fallback resolver
  ├─ missing-key reporter
  └─ session/local/account persistence

DisplayStore
  ├─ data-theme="dark" | "light"
  ├─ centralized CSS tokens
  ├─ system-safe initial default
  └─ reduced-motion-compatible transition
```

Language and display preferences must be independent. Changing language must not change theme; changing theme must not change language.

## Language registry

The registry is the source of truth for selectable languages and publishing status. It must be configuration-driven and must not be embedded in the navigation component.

```ts
export type TranslationStatus =
  | "planned"
  | "draft"
  | "partial"
  | "review"
  | "verified";

export type NigerianLanguage = {
  languageId: string;
  languageName: string;
  nativeName?: string;
  iso639_1?: string;
  iso639_3?: string;
  glottocode?: string;
  regions: string[];
  states?: string[];
  languageFamily?: string;
  writingSystem?: string;
  direction: "ltr" | "rtl";
  translationStatus: TranslationStatus;
  translationSource?: string;
  reviewStatus: "unreviewed" | "in_review" | "verified";
  enabled: boolean;
};
```

The model deliberately supports both two-letter and three-letter identifiers because not every language or variety will have the same identifier coverage. Codes must come from a verified language-data source; engineers must not infer or invent them. Regions and states are many-to-many metadata and must not be treated as exact language boundaries.

The initial registry can include English and the priority Nigerian languages named by the supplied brief, but only locales with approved dictionaries should be enabled for full interface switching. Registered but incomplete languages should display `Partial translation` or `Translation in progress` and should not be presented as fully supported.

## Locale dictionary and translation contract

User-facing strings must resolve through a centralized translation function. React components should receive translation keys, not translated literals.

```ts
export type LocaleDictionary = Record<string, string>;

export type TranslationResult = {
  text: string;
  locale: string;
  sourceLocale: string;
  missing: boolean;
};

export function t(
  key: string,
  variables?: Record<string, string | number>,
): string;
```

The locale directory should be organized by locale identifier, for example:

```text
src/locales/
  en/
    common.ts
    services.ts
    onboarding.ts
    agent.ts
    consent.ts
  ha/
    common.ts
    services.ts
    onboarding.ts
    agent.ts
    consent.ts
```

The initial English dictionary is the migration baseline. Locale modules should be lazy-loaded so the initial bundle does not contain every language. Loaded dictionaries may be cached for the current session. The production interface must use approved dictionaries rather than translating every screen through a live machine-translation request.

Fallback resolution is deterministic:

1. Look up the selected locale key.
2. Look up an approved regional or locale fallback if configured.
3. Fall back to English.
4. Report the missing key to development or administrative telemetry without exposing the key to the user.

The fallback system must never render `undefined`, a raw translation key or an internal error string.

## Translation scope and quality gate

A locale is not complete when only navigation is translated. The migration inventory must include navigation, service discovery, service pages, onboarding labels and instructions, validation and error states, review and completion states, Guide/agent copy, consent explanations, accessibility labels, footer content and display-control labels.

Critical terminology—especially finance, mortgage, insurance, land ownership, verification, consent, agricultural terms and regulatory statements—requires human review. Each translation record should carry status and provenance. Machine-assisted translation may help draft a dictionary but cannot set `verified` status.

User-entered data is never translated automatically. Names, farm names, addresses, free text, identifiers and submitted values remain exactly as entered. Only Nairaleap interface content and approved system-generated copy is localized.

## Preference persistence

The preference provider should use the existing account/session architecture when a user is authenticated and a minimal local preference mechanism for unauthenticated visitors. Persist only the selected locale and display mode. Do not store conversation content, form values or sensitive onboarding data in the preference record.

On initial render, the system must avoid a theme flash or hydration mismatch. The selected preference should be resolved before the client applies the final document theme where practical, or the implementation should use a small deterministic bootstrap strategy. The root document `lang` attribute should track the selected locale, and the `dir` attribute should track the registry direction.

## Display system

The current dark theme is the visual authority and should remain purple-led, calm, readable and high contrast. Add a dedicated light theme using centralized tokens rather than component-level color overrides.

```css
:root,
[data-theme="dark"] {
  --background: ...;
  --surface: ...;
  --surface-elevated: ...;
  --text-primary: ...;
  --text-secondary: ...;
  --border: ...;
  --accent: ...;
  --accent-hover: ...;
  --input-background: ...;
  --navigation-background: ...;
  --glass-background: ...;
  --glass-border: ...;
  --shadow: ...;
}

[data-theme="light"] {
  --background: #ffffff;
  --surface: ...;
  --surface-elevated: ...;
  --text-primary: ...;
  --text-secondary: ...;
  --border: ...;
  --accent: ...;
  --accent-hover: ...;
  --input-background: ...;
  --navigation-background: ...;
  --glass-background: ...;
  --glass-border: ...;
  --shadow: ...;
}
```

The actual values should be derived from the existing stylesheet and verified for contrast; placeholders above are architectural examples, not implementation values. White mode should use a white background, purple type and controls, neutral/purple-tinted surfaces and restrained borders. It should not simply invert the dark palette.

The display control should be compact, keyboard accessible and recognizable through icon plus text/state. Its cool-blue glass influence should remain confined to the control surface and active state; it must not override Nairaleap’s purple brand identity.

## Navigation integration

The navigation should expose two native controls without overcrowding the existing links.

| Surface | Desktop | Mobile |
|---|---|---|
| Language | Compact globe/language button with current language label | Full-width menu row or compact trigger inside mobile menu |
| Display | Compact moon/sun or Dark/White control | Same control inside mobile menu |
| Language panel | Searchable popover with recommended languages first | Constrained bottom sheet/popover with safe-area padding |
| Theme panel | Two-state compact toggle | Two-state compact toggle inside menu |

Both controls require visible focus states, accessible names, keyboard operation, Escape-to-close, outside-click handling, and touch targets that remain comfortable on small screens.

## Navigation Agent integration

The future Navigation Agent should consume the same locale store and translation dictionary. Its visible message is the canonical source for any later TTS call. If a selected locale lacks a verified agent dictionary or supported voice, the agent must remain usable in English or the approved fallback and must explain voice unavailability without blocking navigation.

The agent should receive the current locale, display mode, route, service and onboarding stage as context. It must not translate user-entered values or silently alter form data when the language changes.

## State preservation contract

Changing language or display mode must preserve:

- current route and browser history;
- selected service;
- current onboarding stage;
- entered values and saved progress;
- validation state where safe;
- review state;
- Navigation Agent context.

The preference update must be a presentation/state update, not a route remount that resets the onboarding engine. If a translation changes text length, layouts must remain responsive and validation messages must remain associated with their fields.

## Accessibility and performance requirements

Both themes must be checked for text, control, input, disabled, focus and error contrast. Status must not be communicated by color alone. All labels must remain semantic, and changing locale must update the document language for assistive technology.

Locale dictionaries should be lazy-loaded and cached after selection. The initial English path should not wait on a translation API. Theme switching should use a restrained transition and respect `prefers-reduced-motion`; language switching may use an instant update or subtle fade but must not cause disorienting motion. The language selector must remain usable with keyboard, screen readers, touch and narrow viewports.

## Staged implementation plan

### Stage 0 — Preference and token foundation

Add typed `LocaleStore` and `DisplayStore` providers at the root, persist minimal preferences, add `data-theme` token branches, synchronize document `lang`/`dir`, and add the navigation control shells without enabling incomplete translations.

**Exit evidence:** dark mode remains visually unchanged, White mode renders without token leaks, preference changes preserve route/form state, refresh persistence works, and targeted accessibility checks pass.

### Stage 1 — English dictionary migration

Create the English dictionary and migrate shared navigation, shell, buttons, common form controls, errors, Guide labels and footer content. Keep service-specific content in typed configuration while replacing visible literals with keys.

**Exit evidence:** English visual output matches the current portal, missing-key reporting is clean for migrated surfaces, and no raw keys appear to users.

### Stage 2 — Verified language pilot

Enable only languages whose core dictionary and critical terminology have human review. Add searchable registry UI, recommended ordering, status labels and lazy-loading. Start with a small verified pilot rather than claiming complete Nigerian language coverage.

**Exit evidence:** language switching works on homepage, service pages and onboarding without losing data; fallback is tested; each enabled locale passes native review for consent, finance, verification and error text.

### Stage 3 — Service, onboarding and agent coverage

Complete translation-key migration across service catalog content, dedicated service pages, question sets, review/rundown, consent and the future Navigation Agent. Add field-help and quick-action dictionaries. Keep unsupported service copy in English fallback with visible status policy.

**Exit evidence:** all visible critical surfaces resolve through the dictionary, user-entered data remains unchanged, and agent responses match the selected approved locale.

### Stage 4 — Voice and expanded registry

Only after locale quality is established, connect supported voice configurations behind explicit activation and feature flags. Expand the registry as verified translation resources become available. Retire or downgrade locales whose review status expires.

**Exit evidence:** visible text equals spoken text, unsupported voices fall back safely, no credentials reach the client, and locale changes are auditable.

## Open decisions

| Decision | Recommendation | Status |
|---|---|---|
| First enabled non-English locales | Select only after linguistic review and content inventory; do not equate “listed” with “supported.” | Requires product/content approval |
| Language identifiers | Store verified ISO 639-1/639-3 and Glottocode fields where available; never invent codes. | Requires source verification |
| Translation ownership | Assign a named reviewer for agriculture, finance, consent and verification terminology per locale. | Required |
| Persistence source | Authenticated account preference plus minimal local fallback for guests. | Recommended |
| Theme default | Preserve current dark mode as the default baseline. | Recommended |
| Agent language behaviour | Use approved dictionary; fallback to English when locale content is incomplete. | Required |
| Voice enablement | Separate later feature flag with authorization, provider and quality gates. | **UNVERIFIED** |

## Acceptance criteria

The system is ready for a controlled release only when language and display controls are native to desktop and mobile navigation, the two preferences are independent, current route and onboarding data survive changes, the root document language updates, missing translations fall back safely, no unsupported locale is presented as complete, White mode is a true Nairaleap theme, the dark baseline remains intact, critical translations are human-reviewed, user data is never auto-translated, and the Navigation Agent follows the selected approved language without exposing secrets or blocking navigation.

## References

1. `Pasted_content_17.txt` — supplied Nairaleap Native Language & Display System master implementation prompt, reviewed from the user attachment.
2. [`src/routes/__root.tsx`](../src/routes/__root.tsx) — current document shell, metadata and global stylesheet loading.
3. [`src/styles.css`](../src/styles.css) — current dark-only design tokens and motion safeguards.
4. [`src/components/layout/AppLayout.tsx`](../src/components/layout/AppLayout.tsx) — current shared navigation shell.
5. [`src/features/services/serviceCatalog.ts`](../src/features/services/serviceCatalog.ts) — current top-level service registry.
6. [`src/features/intent-discovery/intentDiscoveryCatalog.ts`](../src/features/intent-discovery/intentDiscoveryCatalog.ts) — current centralized intent configuration.
7. [`src/components/ui/NairaLeapGuideContainer.tsx`](../src/components/ui/NairaLeapGuideContainer.tsx) — current guided flow and existing brain-box-like routing surface.
