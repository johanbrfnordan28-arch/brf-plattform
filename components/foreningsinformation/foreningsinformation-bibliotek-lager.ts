import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import {
  lasFilSomDataUrl,
  MAX_UPPLADDAD_FIL_STORLEK,
  type SparadDokumentFil,
} from "@/components/dokumentbank/forening-dokument-fil-lager";

export type BibliotekUppladdatDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

export type BibliotekUndermappState = {
  öppen: boolean;
  dokument: BibliotekUppladdatDokument[];
};

export type BibliotekHuvudmappState = {
  öppen: boolean;
  undermappar: Record<string, BibliotekUndermappState>;
};

export type BibliotekState = Record<string, BibliotekHuvudmappState>;

const BIBLIOTEK_BASE = "brf-forening-bibliotek-mappar";
const BIBLIOTEK_FILER_BASE = "brf-forening-bibliotek-filer";

export function bibliotekStorageKey(): string {
  return foreningStorageKey(BIBLIOTEK_BASE);
}

function bibliotekFilerKey(): string {
  return foreningStorageKey(BIBLIOTEK_FILER_BASE);
}

type FilLager = Record<string, SparadDokumentFil>;

function lasFiler(): FilLager {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(bibliotekFilerKey());
    return raw ? (JSON.parse(raw) as FilLager) : {};
  } catch {
    return {};
  }
}

function sparaFiler(filer: FilLager): boolean {
  return safeSetLocalStorage(bibliotekFilerKey(), JSON.stringify(filer)).ok;
}

export function hamtaBibliotekFil(dokId: string): SparadDokumentFil | null {
  return lasFiler()[dokId] ?? null;
}

export function sparaBibliotekFil(
  dokId: string,
  fil: SparadDokumentFil,
): boolean {
  const all = lasFiler();
  all[dokId] = fil;
  return sparaFiler(all);
}

export function taBortBibliotekFil(dokId: string): void {
  const all = lasFiler();
  delete all[dokId];
  sparaFiler(all);
}

export function lasBibliotekState(): BibliotekState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(bibliotekStorageKey());
    if (!raw) return null;
    return JSON.parse(raw) as BibliotekState;
  } catch {
    return null;
  }
}

export function sparaBibliotekState(state: BibliotekState): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(bibliotekStorageKey(), JSON.stringify(state)).ok;
}

export async function lasInBibliotekFil(
  fil: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; fel: string }> {
  if (fil.size > MAX_UPPLADDAD_FIL_STORLEK) {
    return {
      ok: false,
      fel: "Filen är för stor (max cirka 2,5 MB).",
    };
  }
  try {
    const dataUrl = await lasFilSomDataUrl(fil);
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, fel: "Kunde inte läsa filen." };
  }
}
