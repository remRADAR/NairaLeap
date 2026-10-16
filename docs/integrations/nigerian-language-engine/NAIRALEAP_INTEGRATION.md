# NairaLeap × Nigerian Language Engine

## Status

**UI foundation only; the plugin is not loaded as a runtime dependency.** In this branch NairaLeap exposes the current interface-language availability in both the portal and editorial navigation. English remains the only enabled interface locale. Hausa, Igbo, Yoruba, and Tiv are shown as disabled pending complete, human-reviewed dictionaries.

This is not a site translation feature: selecting a non-English locale is not possible, no content is translated, and no dictionary/glossary data is served. No language package, API, or provider is called from the browser.

## Frontend adaptation

- Shared component: `src/components/ui/LanguageAvailabilityControl.tsx`.
- Portal placement: `src/components/layout/AppLayout.tsx`, in the desktop navigation and mobile menu.
- Editorial placement: `src/components/layout/EditorialLayout.tsx`.
- Keyboard/screen-reader label and help text state that English is the only enabled language; each pending locale option is disabled.
- The document remains `lang="en"`. No locale preference is persisted because there is no alternative locale to select.

## Plugin API and adoption gate

The package exports `LanguageRegistry`, seeded language records, and translation interfaces. `LanguageRegistry.resolve()` is locale-record lookup; it does not provide application dictionaries, a React context, a glossary UI, or a production translation provider. PR [nigerian-language-engine #7](https://github.com/remRADAR/nigerian-language-engine/pull/7) proposes alias/locale lookup fixes and quality gates but remains a separate review; do not assume that PR has merged or that the NairaLeap branch consumes it.

Before runtime adoption:

1. Agree the initial locale set and translation provenance with the NairaLeap owner.
2. Create complete, human-reviewed dictionaries for navigation, article pages, services, onboarding, validation/errors, consent, accessibility labels, and LeapBot.
3. Add deterministic locale fallback to English and tests proving missing keys never appear raw.
4. Preserve user-entered names, free text, addresses, IDs, and form values verbatim.
5. Keep every language unavailable until critical financial, legal, consent, and verification terminology is reviewed.

## Fallback and configuration

Fallback is English; pending/unknown locales are not selectable. No new environment variables, credentials, permissions, or external requests are required by this UI foundation. Do not add live machine translation or claim full language support as a fallback.

## Verification target

`cypress/e2e/plugin-integration-status.cy.ts` checks the active English value and disabled locale options. Test the same control at desktop and mobile breakpoints. Whole-site translation, glossary coverage, native-speaker review, and route/form-state preservation remain unimplemented and unverified.
