import type { SynthesisRequest, AudioChunk, VoiceProvider } from "./types";
import { applyPronunciationHints } from "./pronunciation";

/**
 * TEMPORARY SYNTHETIC DEMONSTRATION VOICE.
 *
 * Uses the browser's built-in speechSynthesis. This is NOT the founder voice
 * and must never be represented as such. It exists so the Bot remains audible
 * while founder authorisation, enrolment and provider configuration are
 * pending. Browsers without speechSynthesis receive the text fallback.
 */
class BrowserSpeechProvider implements VoiceProvider {
  readonly id = "browser-speech";
  readonly label = "Temporary synthetic voice (browser)";
  readonly supportsStreaming = false;
  readonly usesClonedVoice = false;

  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(private readonly callbacks: { onEnd?: () => void; onError?: () => void } = {}) {}

  async synthesize(request: SynthesisRequest): Promise<AudioChunk[]> {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) {
      throw new Error("speechSynthesis unavailable");
    }
    // Interrupt anything already speaking.
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(applyPronunciationHints(request.text));
    utterance.rate = 1;
    utterance.pitch = 1;
    this.utterance = utterance;
    utterance.onend = () => this.callbacks.onEnd?.();
    utterance.onerror = () => this.callbacks.onError?.();
    synth.speak(utterance);
    // Browser speech renders client-side; no audio buffers are returned.
    return [{ data: null, textAlternative: request.text }];
  }

  cancel(): void {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    this.utterance = null;
    synth?.cancel();
  }
}

/**
 * SERVER-BACKED CLONED-VOICE PROVIDER (contract).
 *
 * The intended final mechanism: audio is produced by a server endpoint that
 * holds the provider credentials and uses the founder's authorised cloned
 * voice model. The frontend only fetches audio — never a provider key, never a
 * hard-coded commercial provider. The concrete provider is selected in server
 * configuration; swapping providers requires no Bot changes.
 */
export interface ServerVoiceProviderConfig {
  /** Public endpoint that synthesises speech server-side. */
  endpoint: string;
  /** Identifier stored in the voice profile. */
  providerId: string;
  label: string;
}

export function createServerVoiceProvider(
  config: ServerVoiceProviderConfig,
  callbacks: { onEnd?: () => void; onError?: (message: string) => void } = {},
): VoiceProvider {
  return {
    id: config.providerId,
    label: config.label,
    supportsStreaming: true,
    usesClonedVoice: true,
    async synthesize(request: SynthesisRequest): Promise<AudioChunk[]> {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileId: request.profileId,
          requestId: request.requestId,
          text: applyPronunciationHints(request.text),
        }),
      });
      if (!response.ok || !response.body) {
        const message = `Voice provider unavailable (HTTP ${response.status})`;
        callbacks.onError?.(message);
        throw new Error(message);
      }
      // Streaming consumption keeps playback interruptible; the chunks are
      // relayed to the engine's player as they arrive.
      const reader = response.body.getReader();
      const chunks: AudioChunk[] = [];
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push({ data: value?.buffer ?? null, textAlternative: null });
        }
      } catch (error) {
        callbacks.onError?.(String(error));
        throw error;
      }
      callbacks.onEnd?.();
      return chunks;
    },
    cancel(): void {
      // Fetch-based streaming cannot be hard-cancelled portably; the engine
      // ignores further chunks after cancel() and falls back to text.
    },
  };
}

export function createBrowserSpeechProvider(
  callbacks: { onEnd?: () => void; onError?: () => void } = {},
): VoiceProvider {
  return new BrowserSpeechProvider(callbacks);
}
