# NairaLeap × Nigerian Language Engine

## Status

**Full-site translation capability; the plugin is not loaded as a runtime dependency.** NairaLeap exposes one shared translation toolbar before both the editorial header and the service-portal header. English, Hausa, Igbo, and Yoruba are selectable through the Google Translate page API and translate the rendered site in place. Nigerian Pidgin and Tiv remain visible as planned locales but disabled until a stable provider or reviewed project dictionaries are available.

This is a site translation feature rather than a visible third-party widget: the project owns the purple toolbar and selection state, while Google Translate performs the DOM translation runtime. User-entered form values are not translated by the application, and the selected locale is persisted locally.

## Frontend adaptation

- Shared component: `src/components/ui/LanguageAvailabilityControl.tsx`.
- Shared toolbar: `src/components/ui/SiteTranslatorToolbar.tsx`.
- Portal placement: `src/components/layout/AppLayout.tsx`, before the portal header.
- Editorial placement: `src/components/layout/EditorialLayout.tsx`, before the editorial header.
- Keyboard/screen-reader label and help text describe whole-site translation; supported Nigerian locales are enabled and incomplete locales remain disabled.
- The document language and `nairaleap.locale` preference update when a locale is selected.

## Plugin API and adoption gate

The related package exports `LanguageRegistry`, seeded language records, and translation interfaces. `LanguageRegistry.resolve()` is locale-record lookup; it does not provide application dictionaries, a React context, a glossary UI, or a production translation provider. NairaLeap therefore does not load that package as a runtime dependency.

Before replacing Google Translate with reviewed first-party dictionaries:

1. Agree the initial locale set and translation provenance with the NairaLeap owner.
2. Create complete, human-reviewed dictionaries for navigation, article pages, services, onboarding, validation/errors, consent, accessibility labels, and LeapBot.
3. Add deterministic locale fallback to English and tests proving missing keys never appear raw.
4. Preserve user-entered names, free text, addresses, IDs, and form values verbatim.
5. Keep Nigerian Pidgin and Tiv unavailable until critical financial, legal, consent, and verification terminology is reviewed.

## Fallback and configuration

Fallback is English; pending/unknown locales are not selectable. The browser loads Google’s public translation runtime when the root provider mounts; no API key is stored in the application. Do not label Nigerian Pidgin or Tiv as supported until a stable provider or reviewed dictionaries exist.

## Verification target

`cypress/e2e/plugin-integration-status.cy.ts` checks the first toolbar, desktop/mobile visibility, supported Nigerian-language options, disabled pending locales, and stored-locale restoration. Google’s live machine-translation quality, glossary coverage, native-speaker review, and provider availability remain external runtime concerns.
