# Brain-Box Browser Check

**Date:** 20 August 2026  
**Runtime:** Local Vite server at `http://127.0.0.1:8081/`  
**Status:** Partial verification in progress

## Verified behavior

The landing page rendered the NairaLeap dark glassmorphism shell and exposed the following public actions: `Let NairaLeap Guide You`, `Browse Services`, each service card, and `Start with NairaLeap Guide`.

Clicking `Let NairaLeap Guide You` opened the full-screen Guide dialog. The dialog displayed the new `NairaLeap Guide · brain box` label, four-stage progress indicator (`Understand`, `Questions`, `Rundown`, `Submit`), and the first discovery question instead of the former placeholder-only experience.

The first discovery answer advanced to question two, and the second answer advanced to question three. This confirms the new Guide state machine and existing QuestionEngine are connected in the browser. The test used the visible intent choice `Make an investment` and the answer `Myself`.

## Still to verify in this browser run

The remaining discovery answer, explicit candidate-service resolution, a direct service-card path, the service-specific generated question set, final rundown, pricing status, authentication boundary, and authenticated submission still require verification.

The third answer advanced to question three and the fourth answer advanced to question four. The fourth screen visibly offered `Guide me to the right service` and `I already know the service I need`, confirming that the previously unused discovery signal is now part of an actual staged flow. The remaining verification target is the recommendation and service-specific question stage.

After submitting discovery, the Guide displayed an explicit recommendation panel for `Investment` with four candidate services: Agriculture, Business Funding, Property Listings, and Partnerships. Each candidate had a clear `Use this path` action, and the user could return with `Change my answers`. This verifies that the old `Recommended service loaded… future step` stop has been replaced by a real choice stage.

Choosing Agriculture from the recommendation panel opened the service-specific Agriculture flow. The browser showed `Question 1 of 13` with the real `Full name` intake field and the Questions stage highlighted. This verifies the recommendation-to-intake transition. The modal was then closed cleanly back to the landing page.

The direct Business Briefs card path was also exercised. The service preview opened, `Continue` opened the guided-request gateway, and `Start Guided Request` opened the brain box directly on Business Briefs question 1 of 8. This verifies direct service selection bypasses generic discovery while still using the shared question engine and staged Guide shell.

In the direct Business Briefs flow, entering a name advanced the engine to question 2 of 8, which rendered an accessible email input with the expected `you@example.com` placeholder and follow-up helper text. This verifies the blueprint field-type adapter is active in the browser, not just compiling in TypeScript.

The Business Briefs email field accepted `ada@example.com` and enabled the Next action, confirming semantic input validation participates in the shared engine’s progression logic.

The Business Briefs flow rendered a real `Brief type` single-choice step with four options, then a required `Sectors of interest` multi-choice step with six meaningful sector options. Selecting Market updates enabled progression, and the multi-choice screen correctly remained gated until at least one sector was selected.

After completing the required Business Briefs frequency answer, the flow advanced to question 6 of 8, an optional phone field with the semantic `tel` input and the expected Nigerian placeholder. This confirms optional blueprint fields are included in the same question flow and do not prevent the user from continuing.

The completed Business Briefs flow reached the final `Rundown` stage. The browser displayed the structured answers (name, email, brief type, sector, frequency), team response expectation (`1–2 minutes`), priority (`low`), workflow (`auto submit`), a documents section, and the pricing disclosure `Quote required after review`. The unauthenticated boundary correctly showed `Sign in to submit` instead of pretending that persistence occurred. This is the key proof that the former brain-box stop has been removed through the final review stage.

## Production verification

The Vercel production alias `https://nairaleap.vercel.app/` loaded successfully. Clicking the live hero CTA opened the new `NairaLeap Guide · brain box` dialog with the `Understand → Questions → Rundown → Submit` progress model and the first discovery question. This confirms the READY production deployment for commit `17b31b3` is publicly serving the new navigator.
