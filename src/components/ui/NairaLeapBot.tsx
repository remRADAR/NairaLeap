import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Grip, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandButton } from "./BrandButton";
import { GlassCard } from "./GlassCard";

type BotExpression = "idle" | "curious" | "thinking" | "talking" | "sleeping" | "success";

type BotPosition = {
  right: number;
  bottom: number;
};

const DEFAULT_POSITION: BotPosition = { right: 24, bottom: 92 };
const POSITION_KEY = "nairaleap.bot.position";
const IDLE_TIMEOUT_MS = 10_000;

const BOT_MESSAGES = {
  idle: "Need help finding the right NairaLeap service?",
  curious: "I can guide you to a service page before you start onboarding.",
  thinking: "Let me map that to the clearest next step.",
  talking: "Choose a service to learn more, or let the Guide narrow it down.",
  sleeping: "I’m resting. Tap me when you’re ready.",
  success: "Nice. You’re ready for the next step.",
} as const;

function loadPosition(): BotPosition {
  if (typeof window === "undefined") return DEFAULT_POSITION;
  try {
    const stored = window.localStorage.getItem(POSITION_KEY);
    if (!stored) return DEFAULT_POSITION;
    const parsed = JSON.parse(stored) as Partial<BotPosition>;
    if (
      typeof parsed.right !== "number" ||
      typeof parsed.bottom !== "number" ||
      !Number.isFinite(parsed.right) ||
      !Number.isFinite(parsed.bottom)
    ) {
      return DEFAULT_POSITION;
    }
    return {
      right: Math.max(12, parsed.right),
      bottom: Math.max(84, parsed.bottom),
    };
  } catch {
    return DEFAULT_POSITION;
  }
}

function clampPosition(position: BotPosition): BotPosition {
  if (typeof window === "undefined") return position;
  const maxRight = Math.max(12, window.innerWidth - 84);
  const maxBottom = Math.max(84, window.innerHeight - 84);
  return {
    right: Math.min(maxRight, Math.max(12, position.right)),
    bottom: Math.min(maxBottom, Math.max(84, position.bottom)),
  };
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1.05;
  utterance.volume = 0.85;
  window.speechSynthesis.speak(utterance);
  return true;
}

interface NairaLeapBotProps {
  onGuide?: () => void;
}

export function NairaLeapBot({ onGuide }: NairaLeapBotProps) {
  const [position, setPosition] = useState<BotPosition>(DEFAULT_POSITION);
  const [expression, setExpression] = useState<BotExpression>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    position: BotPosition;
  } | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const speechTimerRef = useRef<number | null>(null);
  const draggedRef = useRef(false);

  const persistPosition = useCallback((nextPosition: BotPosition) => {
    const safePosition = clampPosition(nextPosition);
    setPosition(safePosition);
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify(safePosition));
    } catch {
      // Position persistence is an enhancement; private browsing must not break dragging.
    }
  }, []);

  const wakeBot = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    setExpression((current) => (current === "sleeping" ? "curious" : current));
    idleTimerRef.current = window.setTimeout(() => {
      setPanelOpen(false);
      setExpression("sleeping");
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    setPosition(clampPosition(loadPosition()));
    setSpeechAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    wakeBot();
    const handleResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [wakeBot]);

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4) {
        draggedRef.current = true;
      }
      setPosition(
        clampPosition({
          right: drag.position.right - (event.clientX - drag.startX),
          bottom: drag.position.bottom - (event.clientY - drag.startY),
        }),
      );
    };
    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      persistPosition({
        right: drag.position.right - (event.clientX - drag.startX),
        bottom: drag.position.bottom - (event.clientY - drag.startY),
      });
      dragRef.current = null;
      setIsDragging(false);
      wakeBot();
    };
    const handlePointerCancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
      wakeBot();
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [isDragging, persistPosition, wakeBot]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    wakeBot();
    draggedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      position,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleBotClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    wakeBot();
    setExpression("curious");
    setPanelOpen((open) => !open);
  };

  const handleVoiceDemo = () => {
    wakeBot();
    setExpression("talking");
    speak(BOT_MESSAGES.talking);
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
    speechTimerRef.current = window.setTimeout(() => setExpression("idle"), 2200);
  };

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ right: position.right, bottom: position.bottom }}
      aria-live="polite"
    >
      {panelOpen ? (
        <GlassCard className="pointer-events-auto mb-3 w-[min(19rem,calc(100vw-2rem))] p-4 shadow-2xl shadow-primary/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-glow">
                NairaLeap Guide · simulation
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {BOT_MESSAGES[expression]}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close LeapBot prompt"
              onClick={() => {
                setPanelOpen(false);
                wakeBot();
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <BrandButton
              size="sm"
              onClick={() => {
                wakeBot();
                setExpression("thinking");
                setPanelOpen(false);
                onGuide?.();
              }}
            >
              Let me guide you <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </BrandButton>
            {speechAvailable ? (
              <BrandButton size="sm" variant="ghost" onClick={handleVoiceDemo}>
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> Voice demo
              </BrandButton>
            ) : null}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Voice demo uses your browser’s speech synthesis only. It does not clone or claim to
            reproduce a founder’s voice.
          </p>
        </GlassCard>
      ) : null}

      <div className="pointer-events-auto flex items-end gap-2">
        <div className="rounded-full border border-glass-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground shadow-lg backdrop-blur-md">
          <Grip className="mr-1 inline h-3 w-3" aria-hidden="true" /> drag me
        </div>
        <button
          type="button"
          aria-label={expression === "sleeping" ? "Wake LeapBot" : "Open LeapBot guide"}
          onPointerDown={handlePointerDown}
          onClick={handleBotClick}
          className={cn(
            "leapbot-float relative grid h-16 w-16 touch-none place-items-center rounded-[1.4rem] border border-primary/50 bg-[#150d2f]/90 p-1 shadow-[0_0_32px_rgba(168,85,247,0.42)] outline-none transition-all duration-300 hover:scale-105 hover:border-primary-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
            expression === "sleeping" && "leapbot-sleep opacity-75 grayscale-[0.18]",
            expression === "talking" && "leapbot-talking",
            isDragging && "cursor-grabbing scale-105",
          )}
        >
          <span className="sr-only">LeapBot, interactive navigation assistant simulation</span>
          <img
            src="/leapbot.webp"
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
          {expression === "talking" ? (
            <span className="absolute -right-1 -top-1 flex gap-0.5" aria-hidden="true">
              <span className="leapbot-speech-dot h-1.5 w-1.5 rounded-full bg-primary-glow" />
              <span className="leapbot-speech-dot leapbot-speech-dot-delay h-1.5 w-1.5 rounded-full bg-primary-glow" />
            </span>
          ) : null}
        </button>
      </div>

      <p className="sr-only">{BOT_MESSAGES[expression]}</p>
    </div>
  );
}
