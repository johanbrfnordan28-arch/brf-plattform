import type {
  BildanalysResultat,
  StyrelseBedömning,
} from "@/components/underhallsplan/bildanalys";
import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
  type LocalStorageSetError,
} from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

export type BildstodKalla = "upload" | "web";

/** Kart-/ytmätning kopplad till samma post som bilden. */
export type KartYtaData = {
  uppmattTotalKvm?: number;
  uppmattGataKvm?: number;
  uppmattGardKvm?: number;
  registerKvm?: number;
  antalNotering?: string;
  senastMatning?: string;
};

/** En sparad bildpost kopplad till år och komponent. */
export type BildstodPost = {
  id: string;
  ar: number;
  komponentKey: string;
  komponentEtikett: string;
  fileName: string | null;
  /** Data-URL för förhandsvisning; saknas om bilden var för stor. */
  previewDataUrl: string | null;
  kalla: BildstodKalla | null;
  analysis: BildanalysResultat | null;
  bedömning: StyrelseBedömning | null;
  styrelseNotering: string;
  kartYta?: KartYtaData;
  uppdaterad: string;
};

export type BildstodLager = {
  poster: BildstodPost[];
};

const STORAGE_KEY_BASE = "brf-underhallsplan-bildstod";

function storageKey(): string {
  return foreningStorageKey(STORAGE_KEY_BASE);
}

export function skapaBildstodPostId(): string {
  return `bild-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function tomtBildstodLager(): BildstodLager {
  return { poster: [] };
}

export function lasBildstodLager(): BildstodLager {
  if (typeof window === "undefined") return tomtBildstodLager();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return tomtBildstodLager();
    const parsed = JSON.parse(raw) as BildstodLager;
    if (!parsed || !Array.isArray(parsed.poster)) return tomtBildstodLager();
    return parsed;
  } catch {
    return tomtBildstodLager();
  }
}

export type SparaBildstodResult =
  | { ok: true }
  | { ok: false; error: LocalStorageSetError; message: string };

export function sparaBildstodLager(lager: BildstodLager): SparaBildstodResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "unavailable",
      message: localStorageFelMeddelande("unavailable"),
    };
  }
  const result = safeSetLocalStorage(storageKey(), JSON.stringify(lager));
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      message: localStorageFelMeddelande(result.error),
    };
  }
  return { ok: true };
}

export function hamtaPosterForAr(lager: BildstodLager, ar: number): BildstodPost[] {
  return lager.poster
    .filter((p) => p.ar === ar)
    .sort((a, b) => b.uppdaterad.localeCompare(a.uppdaterad));
}

export function hamtaTidigareAr(lager: BildstodLager, aktuelltAr: number): number[] {
  const ar = new Set(
    lager.poster.map((p) => p.ar).filter((y) => y < aktuelltAr),
  );
  return [...ar].sort((a, b) => b - a);
}

export function upsertBildstodPost(
  lager: BildstodLager,
  post: BildstodPost,
): BildstodLager {
  const utan = lager.poster.filter((p) => p.id !== post.id);
  return { poster: [...utan, post] };
}

export function taBortBildstodPost(lager: BildstodLager, id: string): BildstodLager {
  return { poster: lager.poster.filter((p) => p.id !== id) };
}

/** Förhandsvisning i historik — sparas bara för mindre filer. */
export async function lasBildSomDataUrl(
  file: File,
  maxBytes = 450_000,
): Promise<string | null> {
  if (file.size > maxBytes) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === "string" ? result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
