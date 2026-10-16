# NairaLeap plugin integration foundation

This integration branch contains a **UI-safe foundation only** for three planned plugins. It does not claim full plugin integration or production readiness.

| Plugin                            | Branch change                                                                                                                                                                 | Explicitly unavailable                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Nigerian Language Engine          | Shared accessible language-status selector in portal and editorial navigation. English is active; Hausa, Igbo, Yoruba, and Tiv remain disabled pending reviewed dictionaries. | Whole-site translation, glossary data, provider calls, locale persistence.                    |
| Article Intelligence & Discussion | Read-only “Evidence & discussion — Not enabled” status card on article detail pages.                                                                                          | Arbitrary URL retrieval, evidence/comments/surveys, automated verdicts, publication controls. |
| Voice & Speech Engine             | Clear disclosure around LeapBot's pre-existing, user-clicked browser speech feature.                                                                                          | Microphone, voice commands, recording, enrollment, real TTS provider.                         |

Plugin-specific adaptation and next-gate details:

- [Nigerian Language Engine](./nigerian-language-engine/NAIRALEAP_INTEGRATION.md)
- [Article Intelligence & Discussion](./article-intelligence-discussion/NAIRALEAP_INTEGRATION.md)
- [Voice & Speech Engine](./voice-speech-engine/NAIRALEAP_INTEGRATION.md)

No plugin package was added as a dependency. No new API endpoint, database table, environment variable, permission, or provider credential was introduced. All user-entered content and existing editorial source links retain current behavior.

## Validation

A focused Cypress spec, `cypress/e2e/plugin-integration-status.cy.ts`, passed **4/4** checks: editorial locale status, portal mobile locale status, article route disclosure/no submission controls, and LeapBot speech disclosure. Targeted ESLint, project-wide TypeScript `--noEmit`, production build, targeted Prettier, and `git diff --check` also passed.

The repository-wide `bun run lint` remains red with **11 Prettier errors and 8 warnings across seven unrelated existing files** (`cypress/e2e/service-navigation.cy.ts`, `src/features/editorial/server.ts`, four feature type files, and `src/routes/admin.tsx`). None is in a file changed by this integration branch. The focused lint run over changed source/test files passes. A Vercel preview is a separate preview-only deployment and is not a production release.
