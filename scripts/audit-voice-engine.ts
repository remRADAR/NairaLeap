/**
 * Founder Voice Engine audit (bun run scripts/audit-voice-engine.ts).
 *
 * Verifies the safety contract without a browser:
 *  1. Enrolment is disabled by default.
 *  2. No provider credentials/API keys exist in the frontend engine files.
 *  3. Pronunciation lexicon covers the required Nigerian terms.
 *  4. The temporary synthetic fallback provider is registered and clearly
 *     labelled as NOT the founder voice.
 *  5. The engine exposes interruption, replay and text fallback paths.
 */
import { readFileSync } from "node:fs";
import {
  FOUNDER_VOICE_ENROLMENT_ENABLED,
  revokeFounderProfileReason,
} from "../src/features/voice-engine/enrolment";
import {
  NIGERIAN_PRONUNCIATION_LEXICON,
  applyPronunciationHints,
} from "../src/features/voice-engine/pronunciation";
import { createBrowserSpeechProvider } from "../src/features/voice-engine/providers";

let failures = 0;
const fail = (message: string) => {
  failures += 1;
  console.error(`FAIL: ${message}`);
};

// 1. Enrolment gate
if (FOUNDER_VOICE_ENROLMENT_ENABLED !== false)
  fail("founder voice enrolment must be disabled by default");
try {
  // Enrolment must throw while disabled — no uploads may occur.
  const { recordFounderEnrolment } = await import("../src/features/voice-engine/enrolment");
  recordFounderEnrolment({
    ownerId: "test",
    consent: { scope: "s", consentedAt: "now", reference: "r" },
    stagedSamplePaths: [],
  });
  fail("recordFounderEnrolment must throw while enrolment is disabled");
} catch (error) {
  const message = String((error as Error).message ?? error);
  if (!message.includes("disabled"))
    fail(`enrolment error should cite the disabled gate: ${message}`);
}
if (!revokeFounderProfileReason().includes("revoked"))
  fail("revocation helper must describe deactivation");

// 2. No credentials in frontend engine files
const engineFiles = [
  "types.ts",
  "pronunciation.ts",
  "providers.ts",
  "engine.ts",
  "enrolment.ts",
  "index.ts",
];
for (const file of engineFiles) {
  const source = readFileSync(`src/features/voice-engine/${file}`, "utf8");
  if (/api[_-]?key\s*[:=]|secret\s*[:=]\s*['"][^'"]{8,}/i.test(source)) {
    fail(`credential-like literal found in ${file}`);
  }
  if (/sk-[a-zA-Z0-9]{16,}/.test(source)) fail(`provider token pattern found in ${file}`);
}

// 3. Pronunciation lexicon
for (const term of ["nairaleap", "lagos", "abuja", "₦", "nin", "cbn"]) {
  if (!(term in NIGERIAN_PRONUNCIATION_LEXICON)) fail(`lexicon missing term: ${term}`);
}
const currencyPronunciation = applyPronunciationHints("₦25,000 in Lagos");
if (currencyPronunciation !== "NY-ra 25,000 in LAH-gos")
  fail(`currency pronunciation mismatch: ${currencyPronunciation}`);

// 4. Fallback provider labelling
const fallback = createBrowserSpeechProvider();
if (fallback.usesClonedVoice) fail("temporary synthetic provider must not claim a cloned voice");
if (!fallback.label.includes("Temporary synthetic"))
  fail("fallback provider must be clearly labelled as temporary/synthetic");

// 5. Engine paths
const engineSource = readFileSync("src/features/voice-engine/engine.ts", "utf8");
for (const required of ["async speak(", "cancel()", "replay()", "onTextFallback", "logUsage"]) {
  if (!engineSource.includes(required)) fail(`engine missing required capability: ${required}`);
}

if (failures > 0) {
  console.error(`\n${failures} voice-engine audit failure(s).`);
  process.exit(1);
}
console.log(
  "Voice-engine audit passed: enrolment disabled, no frontend credentials, lexicon complete, synthetic fallback correctly labelled, engine paths present.\n",
);
