import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const GRUNDMALL_BASE = "brf-renoverings-grundmall";

export const RENOVERINGS_GRUNDMALL_EVENT = "renoverings-grundmall-uppdaterad";

export type RenoveringsGrundmallPunkt = {
  id: string;
  text: string;
};

export type RenoveringsGrundmallState = {
  /** Föreningsspecifika punkter som läggs till i grundkrav för alla renoveringar. */
  extraGrundkrav: RenoveringsGrundmallPunkt[];
  notering: string;
  uppdaterad?: string;
};

export function skapaTomRenoveringsGrundmall(): RenoveringsGrundmallState {
  return { extraGrundkrav: [], notering: "" };
}

function storageKey(): string {
  return foreningStorageKey(GRUNDMALL_BASE);
}

function normalisera(raw: unknown): RenoveringsGrundmallState {
  if (!raw || typeof raw !== "object") return skapaTomRenoveringsGrundmall();
  const data = raw as Partial<RenoveringsGrundmallState>;
  return {
    extraGrundkrav: Array.isArray(data.extraGrundkrav)
      ? data.extraGrundkrav
          .filter((p) => p && typeof p === "object")
          .map((p) => ({
            id: String(p.id ?? `eg-${Date.now()}`),
            text: String(p.text ?? "").trim(),
          }))
          .filter((p) => p.text.length > 0)
      : [],
    notering: typeof data.notering === "string" ? data.notering : "",
    uppdaterad: typeof data.uppdaterad === "string" ? data.uppdaterad : undefined,
  };
}

export function lasRenoveringsGrundmall(): RenoveringsGrundmallState {
  if (typeof window === "undefined") return skapaTomRenoveringsGrundmall();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return skapaTomRenoveringsGrundmall();
    return normalisera(JSON.parse(raw));
  } catch {
    return skapaTomRenoveringsGrundmall();
  }
}

export function sparaRenoveringsGrundmall(
  state: RenoveringsGrundmallState,
): boolean {
  if (typeof window === "undefined") return false;
  const payload: RenoveringsGrundmallState = {
    ...state,
    uppdaterad: new Date().toISOString(),
  };
  const ok = safeSetLocalStorage(storageKey(), JSON.stringify(payload)).ok;
  if (ok) {
    window.dispatchEvent(new Event(RENOVERINGS_GRUNDMALL_EVENT));
  }
  return ok;
}

export function skapaGrundmallPunktId(): string {
  return `fg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
