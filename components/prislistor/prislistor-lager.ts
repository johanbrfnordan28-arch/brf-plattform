import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type PrisEnhet = "st" | "kvm" | "lpm" | "timmar" | "klumpsumma";

export const PRIS_ENHET_ETIKETTER: Record<PrisEnhet, string> = {
  st: "st",
  kvm: "m²",
  lpm: "löpmeter",
  timmar: "timmar",
  klumpsumma: "klumpsumma",
};

export type PrisPost = {
  id: string;
  beskrivning: string;
  enhet: PrisEnhet;
  prisKr: string;
  notering: string;
};

export type Prislista = {
  id: string;
  leverantorNamn: string;
  kategori: string;
  giltigFran: string;
  giltigTom: string;
  skapadTidpunkt: string;
  uppdateradTidpunkt: string;
  poster: PrisPost[];
};

export type PrislistorState = {
  version: 1;
  listor: Prislista[];
};

// ── Konstanter ───────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-prislistor";
export const PRISLISTOR_STATE_EVENT = "brf-prislistor-uppdaterad";

// ── Läsa ─────────────────────────────────────────────────────────────────────

export function lasPrislistorState(): PrislistorState {
  if (typeof window === "undefined") return { version: 1, listor: [] };
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return { version: 1, listor: [] };
    const parsed = JSON.parse(raw) as Partial<PrislistorState>;
    return {
      version: 1,
      listor: Array.isArray(parsed.listor) ? parsed.listor : [],
    };
  } catch {
    return { version: 1, listor: [] };
  }
}

// ── Spara ─────────────────────────────────────────────────────────────────────

export function sparaPrislistorState(state: PrislistorState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PRISLISTOR_STATE_EVENT));
  }
}

// ── Hjälp ────────────────────────────────────────────────────────────────────

export function skapaUnikPrislistaId(): string {
  return `pris-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaUnikPrisPostId(): string {
  return `pp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function tomPrislista(leverantorNamn: string, kategori: string): Prislista {
  const nu = new Date().toISOString();
  return {
    id: skapaUnikPrislistaId(),
    leverantorNamn,
    kategori,
    giltigFran: "",
    giltigTom: "",
    skapadTidpunkt: nu,
    uppdateradTidpunkt: nu,
    poster: [],
  };
}

export function tomPrisPost(): PrisPost {
  return {
    id: skapaUnikPrisPostId(),
    beskrivning: "",
    enhet: "st",
    prisKr: "",
    notering: "",
  };
}
