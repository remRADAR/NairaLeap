# NairaLeap × Voice & Speech Engine

## Status

**Disclosure around the existing explicit-click browser speech demo; the Voice & Speech Engine package is not loaded as a runtime dependency.** LeapBot already has a “Read the latest response aloud” control backed by the browser's `speechSynthesis` API. This branch adds visible disclosure that speech behavior comes from the browser/device and varies by environment, and that this control does not request microphone access or enroll a voice.

The feature does not add voice commands, microphone capture, recording, enrollment, storage, a real TTS provider, or data submission. No additional consent flow is needed for an action that does not invoke microphone/enrollment, but the read-aloud action remains explicit and user-initiated.

## Frontend adaptation

- Component: `src/components/ui/NairaLeapBot.tsx`.
- The existing icon button references the visible disclosure with `aria-describedby`.
- The disclosure avoids claiming that a browser/OS speech implementation is necessarily offline or that text cannot leave the device; provider behavior can vary by platform.
- Browser speech availability is checked before exposing the action; unsupported browsers retain the rest of LeapBot unchanged.

## Plugin API and adoption gate

The plugin defines a provider interface and session capabilities. Each provider declares placeholder status, and `PlaybackQueue` rejects returned handle metadata that conflicts with that declaration; this consistency check is not a trust boundary against a malicious adapter. Its built-in `SyntheticTestProvider` emits deterministic placeholder bytes and explicitly is not real speech. It is suitable for tests/demos only, not production playback. Queue transitions are serialized; unresolved aborted startup or unconfirmed cancellation blocks later playback instead of claiming stop/quiescence. A future real provider requires an owner/provider decision, cancellation and concurrency tests, a defined error/timeout/cleanup contract, and an approved privacy assessment.

Do not enable `enrollVoice`, audio upload, recording, or voice-command capture without separately approved consent, identity/authorization, retention/deletion, security, and provider terms. Do not claim caller-provided consent IDs prove informed consent.

## Fallback and configuration

If browser speech is unsupported, hide only the read-aloud button; text conversation and navigation remain usable. No new environment variables, credentials, permissions, or external requests are introduced by the disclosure. No voice data is stored by this feature.

## Verification target

`cypress/e2e/plugin-integration-status.cy.ts` verifies that the read-aloud button references the user-facing disclosure when speech capability is available. No microphone permission, audio recording, provider integration, or device-specific speech behavior was exercised.
