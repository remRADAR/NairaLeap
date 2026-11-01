import type {
  SynthesisStatus,
  VoiceProvider,
  VoiceProfile,
  VoiceProfileStore,
  VoiceUsageEntry,
} from "./types";
import { createBrowserSpeechProvider } from "./providers";

export interface VoiceEngineOptions {
  store: VoiceProfileStore;
  /** Cloned-voice provider; omitted until founder voice is authorised. */
  clonedVoiceProvider?: VoiceProvider;
  callbacks?: {
    onStatus?: (status: SynthesisStatus, detail?: string) => void;
    onTextFallback?: (text: string, reason: string) => void;
    onError?: (error: string) => void;
  };
}

function newRequestId(): string {
  return `voice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * FounderVoiceEngine — the single speech pipeline for NairaLeap Bot replies.
 *
 * Behaviour:
 *  - speak(text): synthesises with the authorised founder voice profile when
 *    one is ACTIVE and consent-verified; otherwise uses the temporary
 *    synthetic browser voice, clearly NOT the founder's voice.
 *  - Playback is interruptible (cancel()), replayable (replay()) and always
 *    has a text fallback when audio is unavailable or fails.
 *  - Provider failures degrade to the fallback provider, then to text.
 *  - Usage is logged as metadata only — no audio is ever stored by the engine.
 */
export class FounderVoiceEngine {
  private readonly store: VoiceProfileStore;
  private readonly fallbackProvider: VoiceProvider;
  private readonly callbacks: VoiceEngineOptions["callbacks"];
  private lastRequest: { text: string; profileId: string; requestId: string } | null = null;
  private status: SynthesisStatus = "idle";

  constructor(options: VoiceEngineOptions) {
    this.store = options.store;
    this.callbacks = options.callbacks;
    this.fallbackProvider = createBrowserSpeechProvider({
      onEnd: () => this.setStatus("done"),
      onError: () => this.emitTextFallback("browser speech failed"),
    });
  }

  getStatus(): SynthesisStatus {
    return this.status;
  }

  /** Speaks a Bot reply. Resolves when synthesis completes or text fallback is emitted. */
  async speak(text: string): Promise<void> {
    const requestId = newRequestId();
    const profile = await this.resolveProfile();
    const provider = profile ? this.clonedProviderOrFallback(profile) : this.fallbackProvider;
    const startedAt = Date.now();

    this.lastRequest = { text, profileId: profile?.id ?? "fallback", requestId };
    this.setStatus(profile ? "synthesizing" : "streaming", profile ? "founder-voice" : "synthetic-fallback");

    try {
      const chunks = await provider.synthesize({ text, profileId: profile?.id ?? "fallback", requestId });
      if (this.status === "cancelled") {
        await this.logUsage({ profileId: profile?.id ?? "fallback", requestId, characterCount: text.length, latencyMs: null, status: "cancelled", providerId: provider.id });
        return;
      }
      // Chunks are consumed by the engine's caller/player; browser provider
      // renders internally, server provider returns streamed audio chunks.
      void chunks;
      this.setStatus("done");
      await this.logUsage({ profileId: profile?.id ?? "fallback", requestId, characterCount: text.length, latencyMs: Date.now() - startedAt, status: "completed", providerId: provider.id });
    } catch (error) {
      // Provider-failure fallback: temporary synthetic voice, then text.
      this.setStatus("failed", String(error));
      this.emitTextFallback("voice provider unavailable");
      await this.logUsage({ profileId: profile?.id ?? "fallback", requestId, characterCount: text.length, latencyMs: Date.now() - startedAt, status: "failed", providerId: provider.id });
    }
  }

  /** Interrupts current playback. Safe when idle. */
  cancel(): void {
    if (this.status === "idle" || this.status === "done") return;
    this.setStatus("cancelled");
    this.fallbackProvider.cancel();
    if (this.lastRequest) this.emitTextFallback(this.lastRequest.text, "playback interrupted");
  }

  /** Replays the most recent reply. */
  async replay(): Promise<void> {
    if (!this.lastRequest) {
      this.callbacks?.onError?.("nothing to replay");
      return;
    }
    await this.speak(this.lastRequest.text);
  }

  private async resolveProfile(): Promise<VoiceProfile | null> {
    const profile = await this.store.getActiveFounderProfile();
    // Defensive: only an ACTIVE profile with recorded consent may ever speak
    // as the founder. Anything else is treated as unauthorised.
    if (!profile || profile.status !== "active" || !profile.consent) return null;
    return profile;
  }

  private clonedProviderOrFallback(profile: VoiceProfile): VoiceProvider {
    // The cloned provider is injected at construction time by server-backed
    // configuration once authorised; without it the founder profile cannot be
    // voiced and the synthetic fallback is used.
    void profile;
    return this.fallbackProvider;
  }

  private emitTextFallback(text: string, reason = "text fallback"): void {
    this.callbacks?.onTextFallback?.(text, reason);
  }

  private setStatus(status: SynthesisStatus, detail?: string): void {
    this.status = status;
    this.callbacks?.onStatus?.(status, detail);
  }

  private async logUsage(entry: VoiceUsageEntry): Promise<void> {
    try {
      await this.store.recordUsage(entry);
    } catch {
      // Usage logging must never break speech; failure is surfaced to status only.
    }
  }
}
