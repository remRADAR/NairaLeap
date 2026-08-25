import type { AnswersState } from "@/features/question-engine";
import { SERVICE_CATALOG, type ServiceId } from "@/features/services/serviceCatalog";

export const PENDING_GUIDE_STORAGE_KEY = "nairaleap.pending-guide";

interface PendingGuideDraft {
  serviceId: ServiceId;
  answers: AnswersState;
}

function isServiceId(value: unknown): value is ServiceId {
  return typeof value === "string" && SERVICE_CATALOG.some((service) => service.id === value);
}

function readPendingGuideDraft(): PendingGuideDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_GUIDE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const draft = parsed as { serviceId?: unknown; answers?: unknown };
    if (!isServiceId(draft.serviceId) || !draft.answers || typeof draft.answers !== "object") {
      return null;
    }
    return {
      serviceId: draft.serviceId,
      answers: draft.answers as AnswersState,
    };
  } catch {
    return null;
  }
}

export function savePendingGuideDraft(serviceId: ServiceId, answers: AnswersState): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.sessionStorage.setItem(
      PENDING_GUIDE_STORAGE_KEY,
      JSON.stringify({ serviceId, answers }),
    );
    return true;
  } catch {
    return false;
  }
}

export function getPendingGuideServiceId(): ServiceId | null {
  return readPendingGuideDraft()?.serviceId ?? null;
}

export function consumePendingGuideDraft(expectedServiceId?: ServiceId): PendingGuideDraft | null {
  const draft = readPendingGuideDraft();
  if (!draft || (expectedServiceId && draft.serviceId !== expectedServiceId)) return null;

  try {
    window.sessionStorage.removeItem(PENDING_GUIDE_STORAGE_KEY);
  } catch {
    // Session storage can be unavailable in privacy-restricted browsers.
  }
  return draft;
}
