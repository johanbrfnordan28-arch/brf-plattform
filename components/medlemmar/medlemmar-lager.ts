import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const MEDLEMMAR_RENOVERING_BASE = "brf-medlemmar-renovering";

export const MEDLEMMAR_RENOVERING_EVENT = "medlemmar-renovering-uppdaterad";

export function medlemmarRenoveringStorageKey(): string {
  return foreningStorageKey(MEDLEMMAR_RENOVERING_BASE);
}

export type RenoveringsAnmalanState = {
  valdaTyper: string[];
  klaraPunkter: string[];
  sparad: boolean;
};

export function skapaTomRenoveringsAnmalan(): RenoveringsAnmalanState {
  return { valdaTyper: [], klaraPunkter: [], sparad: false };
}

function normaliseraState(raw: unknown): RenoveringsAnmalanState {
  if (!raw || typeof raw !== "object") return skapaTomRenoveringsAnmalan();
  const data = raw as Partial<RenoveringsAnmalanState>;
  return {
    valdaTyper: Array.isArray(data.valdaTyper) ? data.valdaTyper : [],
    klaraPunkter: Array.isArray(data.klaraPunkter) ? data.klaraPunkter : [],
    sparad: Boolean(data.sparad),
  };
}

export function lasRenoveringsAnmalan(): RenoveringsAnmalanState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(medlemmarRenoveringStorageKey());
    if (!raw) return null;
    return normaliseraState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function sparaRenoveringsAnmalan(state: RenoveringsAnmalanState): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    medlemmarRenoveringStorageKey(),
    JSON.stringify(state),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(MEDLEMMAR_RENOVERING_EVENT));
  }
  return ok;
}
