import type { VoiceConsentRecord, VoiceProfile } from "./types";

/**
 * FOUNDER VOICE ENROLMENT GATE — DISABLED BY DEFAULT.
 *
 * Enrolment may only be enabled when ALL of the following are true:
 *  1. The founder has provided suitable voice recordings.
 *  2. The founder has explicitly authorised voice cloning and its intended
 *     commercial use (recorded in voice_consent_events).
 *  3. Server-side secure storage and provider credentials are configured by
 *     an authorised operator.
 *  4. The cloned voice has been tested and approved.
 *
 * Flipping this constant without those conditions violates the consent and
 * safety model of the Founder Voice Engine.
 */
export const FOUNDER_VOICE_ENROLMENT_ENABLED = false;

export interface EnrolmentContext {
  ownerId: string;
  consent: VoiceConsentRecord;
  /** Paths of staged voice recordings — never auto-uploaded. */
  stagedSamplePaths: string[];
}

/**
 * Records the founder's authorisation and returns the pending profile.
 * Throws while enrolment is disabled: no recordings are uploaded or processed.
 */
export function recordFounderEnrolment(context: EnrolmentContext): VoiceProfile {
  if (!FOUNDER_VOICE_ENROLMENT_ENABLED) {
    throw new Error(
      "Founder voice enrolment is disabled until the founder provides recordings and explicitly authorises cloning and commercial use. No recordings are uploaded or processed.",
    );
  }
  void context;
  // Full enrolment (sample upload, provider cloning, testing) is implemented
  // only after authorisation; see HANDOFF for the activation checklist.
  throw new Error("Enrolment workflow requires authorised server configuration.");
}

/** Revocation: consent withdrawal must immediately deactivate the profile. */
export function revokeFounderProfileReason(): string {
  return "Consent withdrawn: the founder voice must immediately stop being used and the profile must move to 'revoked' pending secure deletion.";
}
