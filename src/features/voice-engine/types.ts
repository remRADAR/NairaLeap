/**
 * Founder Voice Engine — type contracts.
 *
 * Objective: NairaLeap Bot's spoken vocal identity is the authorised, cloned
 * voice of the NairaLeap founder. The engine is provider-independent: any
 * voice-cloning provider is adapted behind VoiceProvider, and the Bot's
 * conversational intelligence is untouched — only the vocal identity changes.
 *
 * SAFETY MODEL (non-negotiable):
 *  - Founder voice enrolment is DISABLED until the founder provides suitable
 *    recordings and explicitly authorises cloning and commercial use.
 *  - No founder recordings are uploaded or processed while enrolment is
 *    disabled. Nothing may claim the Bot speaks in the founder's voice until
 *    authorisation, enrolment and testing are complete.
 *  - Until then the engine uses a clearly-labelled TEMPORARY SYNTHETIC voice
 *    (browser speechSynthesis) as the demonstration fallback.
 *  - Provider credentials live ONLY server-side. The frontend receives audio,
 *    never API keys.
 */

export type VoiceProfileType = "founder" | "system";

export type VoiceProfileStatus =
  | "draft"                    // created, no samples, no consent — cannot be used
  | "pending_consent"          // samples staged, awaiting founder authorisation
  | "consent_recorded"         // explicit consent captured; not yet active
  | "active"                   // authorised, enrolled and tested — usable
  | "revoked"                  // consent withdrawn — must not be used
  | "deleted";                 // secure deletion completed — must never be reused

export type SynthesisStatus = "idle" | "synthesizing" | "streaming" | "done" | "failed" | "cancelled";

export interface VoiceConsentRecord {
  /** Scope of the consent text the founder approved, e.g. "nairaleap-bot-commercial-v1". */
  scope: string;
  /** ISO timestamp of explicit authorisation. */
  consentedAt: string;
  /** Reference to the signed/approved consent document or approval record. */
  reference: string;
}

export interface VoiceProfile {
  id: string;
  type: VoiceProfileType;
  /** Auth account owning the profile (the founder's account). */
  ownerId: string;
  providerId: string;
  /** Provider-side voice model identifier — never a secret. */
  externalVoiceId: string | null;
  status: VoiceProfileStatus;
  consent: VoiceConsentRecord | null;
  createdAt: string;
  updatedAt: string;
}

export interface SynthesisRequest {
  text: string;
  profileId: string;
  /** Optional correlation id for usage logging and replay. */
  requestId: string;
}

export type AudioChunk = { data: ArrayBuffer | null; textAlternative: string | null };

export interface VoiceProvider {
  /** Stable identifier used in profiles and configuration. */
  id: string;
  label: string;
  /** Whether the provider can stream audio as it is generated. */
  supportsStreaming: boolean;
  /** True when this provider renders with an authorised cloned voice profile. */
  usesClonedVoice: boolean;
  /**
   * Synthesises speech for an already-prepared text.
   * Implementations must never require frontend credentials.
   */
  synthesize(request: SynthesisRequest): Promise<AudioChunk[]>;
  /** Best-effort stop of in-flight synthesis. */
  cancel(): void;
}

export interface VoiceEngineCallbacks {
  onStatus?(status: SynthesisStatus, detail?: string): void;
  /** Text fallback whenever audio cannot be produced or is cancelled. */
  onTextFallback?(text: string, reason: string): void;
  onError?(error: string): void;
}

export interface VoiceProfileStore {
  /** Active, consent-verified founder profile, or null when not authorised. */
  getActiveFounderProfile(): Promise<VoiceProfile | null>;
  /** Operational usage logging — metadata only, never audio. */
  recordUsage(entry: VoiceUsageEntry): Promise<void>;
}

export interface VoiceUsageEntry {
  profileId: string;
  requestId: string;
  characterCount: number;
  /** Milliseconds from request to first audio / completion. */
  latencyMs: number | null;
  status: "completed" | "failed" | "cancelled" | "text_fallback";
  /** Provider that served the request (or "fallback"). */
  providerId: string;
}
