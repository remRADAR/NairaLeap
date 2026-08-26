import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Grip, MapPin, MessageCircle, Send, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandButton } from "./BrandButton";
import { GlassCard } from "./GlassCard";
import {
  answerPortalQuestion,
  getServiceTitle,
  resolveServiceFromText,
  type AgentAction,
  type AgentReply,
  type AgentSession,
} from "@/features/navigation-agent";
import type { ServiceId } from "@/features/service-intelligence-catalog";

type BotExpression = "idle" | "curious" | "thinking" | "talking" | "success";

type BotPosition = {
  right: number;
  bottom: number;
};

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const DEFAULT_POSITION: BotPosition = { right: 24, bottom: 92 };
const POSITION_KEY = "nairaleap.bot.position";
const SESSION_KEY = "nairaleap.bot.session";
const TRANSCRIPT_KEY = "nairaleap.bot.transcript";
const PANEL_KEY = "nairaleap.bot.panel";
const IDLE_PROMPT_MS = 10_000;
const MAX_TRANSCRIPT = 24;

const OPENING_MESSAGE =
  "I’m your NairaLeap chauffeur. I’ll stay with you through the portal, explain what you are seeing, take you to the right service and help you continue without guessing or dropping the conversation.";

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
    return { right: Math.max(12, parsed.right), bottom: Math.max(84, parsed.bottom) };
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

function readSession(pathname: string): AgentSession {
  if (typeof window === "undefined") {
    return { active: true, currentPath: pathname, completedActions: [] };
  }
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(SESSION_KEY) ?? "null",
    ) as Partial<AgentSession> | null;
    return {
      active: true,
      currentPath: pathname,
      currentServiceId: parsed?.currentServiceId,
      lastIntent: parsed?.lastIntent,
      completedActions: Array.isArray(parsed?.completedActions)
        ? parsed.completedActions.slice(-12)
        : [],
    };
  } catch {
    return { active: true, currentPath: pathname, completedActions: [] };
  }
}

function readPanelOpen() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(PANEL_KEY) === "open";
}

function readTranscript(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(TRANSCRIPT_KEY) ?? "[]",
    ) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_TRANSCRIPT) : [];
  } catch {
    return [];
  }
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

function serviceIdFromPath(pathname: string): ServiceId | undefined {
  const match = pathname.match(/^\/services\/([^/]+)/);
  return match?.[1] as ServiceId | undefined;
}

interface NairaLeapBotProps {
  onGuide?: () => void;
}

export function NairaLeapBot({ onGuide }: NairaLeapBotProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [position, setPosition] = useState<BotPosition>(DEFAULT_POSITION);
  const [expression, setExpression] = useState<BotExpression>("idle");
  const [panelOpen, setPanelOpen] = useState(readPanelOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => readTranscript());
  const [session, setSession] = useState<AgentSession>(() => readSession(pathname));
  const [promptVisible, setPromptVisible] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    position: BotPosition;
  } | null>(null);
  const promptTimerRef = useRef<number | null>(null);
  const speechTimerRef = useRef<number | null>(null);
  const draggedRef = useRef(false);

  const currentServiceId = serviceIdFromPath(pathname);
  const contextLabel = currentServiceId
    ? getServiceTitle(currentServiceId)
    : "NairaLeap Service Portal";
  const quickActions = useMemo(
    () =>
      currentServiceId
        ? [
            {
              label: `Explain ${getServiceTitle(currentServiceId)}`,
              text: "What is this service and how does it work?",
            },
            { label: "What do I need?", text: "What do I need to prepare for this service?" },
            { label: "Open onboarding", text: "I am ready to start onboarding" },
          ]
        : [
            { label: "Find a service", text: "I need help choosing the right service" },
            { label: "How does this work?", text: "How does the NairaLeap portal work?" },
            { label: "Human support", text: "I need human support" },
          ],
    [currentServiceId],
  );

  const setPanelVisible = useCallback((open: boolean) => {
    setPanelOpen(open);
    try {
      window.sessionStorage.setItem(PANEL_KEY, open ? "open" : "minimized");
    } catch {
      // Panel continuity is best effort and never blocks the portal.
    }
  }, []);

  const persistSession = useCallback((next: AgentSession) => {
    setSession(next);
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      // Session continuity is an enhancement; private browsing must not break navigation.
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      const next = [...current, message].slice(-MAX_TRANSCRIPT);
      try {
        window.sessionStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(next));
      } catch {
        // Transcript persistence is best effort and never blocks the portal.
      }
      return next;
    });
  }, []);

  const executeAction = useCallback(
    (action: AgentAction) => {
      const nextSession = {
        ...session,
        currentPath: pathname,
        currentServiceId: currentServiceId ?? session.currentServiceId,
        completedActions: [...session.completedActions, action.type].slice(-12),
      };
      if (action.type === "show_service") {
        persistSession({ ...nextSession, currentServiceId: action.serviceId });
        setPanelVisible(true);
        setExpression("success");
        void navigate({ to: "/services/$service", params: { service: action.serviceId } });
        return;
      }
      if (action.type === "go_home") {
        persistSession({ ...nextSession, currentServiceId: undefined });
        void navigate({ to: "/" });
        return;
      }
      if (action.type === "request_human_help") {
        persistSession({ ...nextSession, currentServiceId: "customer-support" });
        return;
      }
      if (action.type === "start_onboarding") {
        persistSession(nextSession);
        onGuide?.();
        return;
      }
      persistSession(nextSession);
    },
    [currentServiceId, navigate, onGuide, pathname, persistSession, session, setPanelVisible],
  );

  const submitMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = `${Date.now()}`;
      addMessage({ id: `${id}-user`, role: "user", text: trimmed });
      setDraft("");
      setExpression("thinking");
      const reply: AgentReply = answerPortalQuestion(trimmed, {
        ...session,
        currentPath: pathname,
        currentServiceId: currentServiceId ?? session.currentServiceId,
        lastIntent: resolveServiceFromText(trimmed) ?? session.lastIntent,
      });
      window.setTimeout(() => {
        addMessage({ id: `${id}-bot`, role: "bot", text: reply.text });
        setExpression("talking");
        persistSession({
          ...session,
          active: true,
          currentPath: pathname,
          currentServiceId: currentServiceId ?? session.currentServiceId,
          lastIntent: resolveServiceFromText(trimmed) ?? session.lastIntent,
        });
        reply.actions.forEach(executeAction);
      }, 180);
    },
    [addMessage, currentServiceId, executeAction, pathname, persistSession, session],
  );

  const persistPosition = useCallback((nextPosition: BotPosition) => {
    const safePosition = clampPosition(nextPosition);
    setPosition(safePosition);
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify(safePosition));
    } catch {
      // Position persistence is an enhancement; private browsing must not break dragging.
    }
  }, []);

  useEffect(() => {
    setPosition(clampPosition(loadPosition()));
    setSpeechAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    if (messages.length === 0) addMessage({ id: "opening", role: "bot", text: OPENING_MESSAGE });
    const handleResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
      if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [addMessage, messages.length]);

  useEffect(() => {
    setSession((current) => {
      const next = {
        ...current,
        active: true,
        currentPath: pathname,
        currentServiceId: currentServiceId ?? current.currentServiceId,
      };
      try {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {
        // Best effort only.
      }
      return next;
    });
  }, [currentServiceId, pathname]);

  useEffect(() => {
    promptTimerRef.current = window.setTimeout(() => {
      setPromptVisible(true);
      setExpression("curious");
    }, IDLE_PROMPT_MS);
    return () => {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4)
        draggedRef.current = true;
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
    };
    const handlePointerCancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [isDragging, persistPosition]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
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
    setPromptVisible(false);
    setPanelVisible(true);
    setExpression("curious");
  };

  const handleVoiceDemo = () => {
    setExpression("talking");
    speak(messages.find((message) => message.role === "bot")?.text ?? OPENING_MESSAGE);
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
        <GlassCard
          className="pointer-events-auto mb-3 flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col p-4 shadow-2xl shadow-primary/20"
          data-testid="leapbot-panel"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-glow">
                NairaLeap Chauffeur · active
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" /> {contextLabel}
              </p>
            </div>
            <button
              type="button"
              aria-label="Minimize LeapBot chauffeur"
              onClick={() => setPanelVisible(false)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div
            className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
            aria-label="LeapBot conversation"
            role="log"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                data-role={message.role}
                className={cn(
                  "rounded-2xl px-3 py-2 text-xs leading-relaxed",
                  message.role === "user"
                    ? "ml-8 bg-primary/20 text-foreground"
                    : "mr-4 bg-surface-elevated text-muted-foreground",
                )}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => submitMessage(action.text)}
                className="rounded-full border border-glass-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage(draft);
            }}
          >
            <label className="sr-only" htmlFor="leapbot-message">
              Message LeapBot
            </label>
            <input
              id="leapbot-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tell me what you want to do"
              className="min-w-0 flex-1 rounded-xl border border-glass-border bg-background/70 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              I stay active until you leave the portal. I only use approved portal knowledge.
            </p>
            <div className="flex shrink-0 gap-1">
              {currentServiceId && onGuide ? (
                <BrandButton size="sm" onClick={onGuide}>
                  Open intake <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </BrandButton>
              ) : null}
              {speechAvailable ? (
                <button
                  type="button"
                  aria-label="Read the latest LeapBot response aloud"
                  onClick={handleVoiceDemo}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="pointer-events-auto flex items-end gap-2">
        {promptVisible && !panelOpen ? (
          <div className="max-w-[15rem] rounded-2xl border border-primary/30 bg-background/90 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground shadow-lg backdrop-blur-md">
            I’m still here with you. Tell me what you want to accomplish.
          </div>
        ) : null}
        <div className="rounded-full border border-glass-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground shadow-lg backdrop-blur-md">
          <Grip className="mr-1 inline h-3 w-3" aria-hidden="true" /> drag me
        </div>
        <button
          type="button"
          aria-label="Open LeapBot chauffeur"
          aria-expanded={panelOpen}
          onPointerDown={handlePointerDown}
          onClick={handleBotClick}
          className={cn(
            "leapbot-float relative grid h-16 w-16 touch-none place-items-center rounded-[1.4rem] border border-primary/50 bg-[#150d2f]/90 p-1 shadow-[0_0_32px_rgba(168,85,247,0.42)] outline-none transition-all duration-300 hover:scale-105 hover:border-primary-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
            expression === "talking" && "leapbot-talking",
            isDragging && "cursor-grabbing scale-105",
          )}
        >
          <span className="sr-only">LeapBot, persistent NairaLeap chauffeur</span>
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
          {panelOpen ? (
            <MessageCircle
              className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground"
              aria-hidden="true"
            />
          ) : null}
        </button>
      </div>
    </div>
  );
}
