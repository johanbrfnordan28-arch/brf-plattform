import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

export type HusEntreprenor = {
  id: string;
  namn: string;
  telefon: string;
  epost: string;
  kategori: string;
  /** T.ex. «Känner huset sedan stambytet 2018». */
  anteckning: string;
  tillagdTidpunkt: string;
};

export type HusEntreprenorerState = {
  version: 1;
  poster: HusEntreprenor[];
};

const STORAGE_KEY_BASE = "brf-hus-entreprenorer";
export const HUS_ENTREPR_EVENT = "brf-hus-entreprenorer-uppdaterad";

export function lasHusEntreprenorerState(): HusEntreprenorerState {
  if (typeof window === "undefined") {
    return { version: 1, poster: [] };
  }
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return { version: 1, poster: [] };
    const parsed = JSON.parse(raw) as Partial<HusEntreprenorerState>;
    return {
      version: 1,
      poster: Array.isArray(parsed.poster) ? parsed.poster : [],
    };
  } catch {
    return { version: 1, poster: [] };
  }
}

export function sparaHusEntreprenorerState(state: HusEntreprenorerState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HUS_ENTREPR_EVENT));
  }
}

export function skapaHusEntreprenorId(): string {
  return `hus-ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Lägg till en post i föreningens lista (används bl.a. från rekommenderade). */
export function laggTillHusEntreprenor(
  data: Omit<HusEntreprenor, "id" | "tillagdTidpunkt">,
): HusEntreprenor {
  const state = lasHusEntreprenorerState();
  const redan = state.poster.some(
    (p) =>
      p.namn.trim().toLowerCase() === data.namn.trim().toLowerCase() &&
      (p.telefon.trim() === data.telefon.trim() ||
        (!!data.epost && p.epost.trim().toLowerCase() === data.epost.trim().toLowerCase())),
  );
  if (redan) {
    const befintlig = state.poster.find(
      (p) => p.namn.trim().toLowerCase() === data.namn.trim().toLowerCase(),
    )!;
    return befintlig;
  }
  const ny: HusEntreprenor = {
    id: skapaHusEntreprenorId(),
    namn: data.namn.trim(),
    telefon: data.telefon.trim(),
    epost: data.epost.trim(),
    kategori: data.kategori.trim(),
    anteckning: data.anteckning.trim(),
    tillagdTidpunkt: new Date().toISOString(),
  };
  sparaHusEntreprenorerState({ version: 1, poster: [ny, ...state.poster] });
  return ny;
}
