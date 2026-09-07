import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { demoEntreprenorer, type Entreprenor } from "@/components/entreprenorer/entreprenorer";

// ── Typer ────────────────────────────────────────────────────────────────────

export type EntreprenorerState = {
  version: 1;
  entreprenorer: Entreprenor[];
  /** true = föreningen har ändrat sin lista (demo-data ignoreras sedan) */
  anpassad: boolean;
};

// ── Konstanter ───────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-entreprenorer-lista";
export const ENTREPR_EVENT = "brf-entreprenorer-uppdaterad";

// ── Läsa ─────────────────────────────────────────────────────────────────────

export function lasEntreprenorerState(): EntreprenorerState {
  if (typeof window === "undefined") {
    return { version: 1, entreprenorer: demoEntreprenorer, anpassad: false };
  }
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) {
      return { version: 1, entreprenorer: demoEntreprenorer, anpassad: false };
    }
    const parsed = JSON.parse(raw) as Partial<EntreprenorerState>;
    return {
      version: 1,
      entreprenorer: Array.isArray(parsed.entreprenorer)
        ? parsed.entreprenorer
        : demoEntreprenorer,
      anpassad: parsed.anpassad ?? false,
    };
  } catch {
    return { version: 1, entreprenorer: demoEntreprenorer, anpassad: false };
  }
}

// ── Spara ─────────────────────────────────────────────────────────────────────

export function sparaEntreprenorerState(state: EntreprenorerState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ENTREPR_EVENT));
  }
}
