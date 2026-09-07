import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type DokumentStatus = "utkast" | "klar" | "arkiverad";

export const DOKUMENT_STATUS_ETIKETTER: Record<DokumentStatus, string> = {
  utkast: "Utkast",
  klar: "Klar",
  arkiverad: "Arkiverad",
};

export type ForeningsDokument = {
  id: string;
  /** ID på originalmallen */
  mallId: string;
  /** Mallens titel vid skapandet */
  mallTitel: string;
  /** Mallens filnamn — används som förslag vid nedladdning */
  mallFilnamn: string;
  /** Föreningens eget namn på kopian */
  titel: string;
  status: DokumentStatus;
  skapadDatum: string;
  uppdateradDatum: string;
  notering: string;
  /** Kategori / område från mallen */
  omrade: string;
};

export type ForeningsDokumentState = {
  version: 1;
  dokument: ForeningsDokument[];
};

// ── Konstanter ───────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-forenings-dokument";
export const FORENINGS_DOK_EVENT = "brf-forenings-dokument-uppdaterat";

// ── Läsa / Spara ──────────────────────────────────────────────────────────────

export function lasForeningsDokument(): ForeningsDokumentState {
  if (typeof window === "undefined") return { version: 1, dokument: [] };
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return { version: 1, dokument: [] };
    const parsed = JSON.parse(raw) as Partial<ForeningsDokumentState>;
    return {
      version: 1,
      dokument: Array.isArray(parsed.dokument) ? parsed.dokument : [],
    };
  } catch {
    return { version: 1, dokument: [] };
  }
}

export function sparaForeningsDokument(state: ForeningsDokumentState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FORENINGS_DOK_EVENT));
  }
}

// ── ID-hjälp ──────────────────────────────────────────────────────────────────

export function skapaForeningsDokumentId(): string {
  return `fdok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Nedladdning ───────────────────────────────────────────────────────────────

/**
 * Skapar en nedladdningsbar Blob av textinnehållet och triggar nedladdning.
 * Använder `URL.createObjectURL` som fungerar i alla moderna webbläsare.
 */
export function laddaNedDokument(
  filnamn: string,
  textInnehall: string,
): void {
  const blob = new Blob([textInnehall], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn.endsWith(".txt") ? filnamn : `${filnamn}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
