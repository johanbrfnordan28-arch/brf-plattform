import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import type { SparadDokumentFil } from "@/components/dokumentbank/forening-dokument-fil-lager";
import {
  hamtaForeningFilUrlFranPlats,
  sparaForeningFil,
  taBortForeningFilFranPlats,
  type FilSparResultat,
  type MolnFilRef,
} from "@/lib/forening-fil-lagring";

export type BibliotekUppladdatDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
  /** Saknas för filer sparade lokalt i webbläsaren (demo/äldre uppladdningar). */
  moln?: MolnFilRef;
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
const FIL_MODUL = "forening-bibliotek";

export function bibliotekStorageKey(): string {
  return foreningStorageKey(BIBLIOTEK_BASE);
}

function bibliotekFilerKey(): string {
  return foreningStorageKey(BIBLIOTEK_FILER_BASE);
}

type FilLager = Record<string, SparadDokumentFil>;

/** Äldre uppladdningar som sparades som data-URL i localStorage. */
function lasAldreFiler(): FilLager {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(bibliotekFilerKey());
    return raw ? (JSON.parse(raw) as FilLager) : {};
  } catch {
    return {};
  }
}

/** Ger en blob-URL att öppna filen med; anroparen ansvarar för att släppa den. */
export async function hamtaBibliotekFilUrl(
  dok: BibliotekUppladdatDokument,
): Promise<string | null> {
  const url = await hamtaForeningFilUrlFranPlats({
    modul: FIL_MODUL,
    dokId: dok.id,
    moln: dok.moln,
  });
  if (url || dok.moln) return url;
  const aldre = lasAldreFiler()[dok.id];
  if (!aldre?.dataUrl) return null;
  const blob = await (await fetch(aldre.dataUrl)).blob();
  return URL.createObjectURL(blob);
}

export function sparaBibliotekFil(
  dokId: string,
  fil: File,
  onProgress?: (procent: number) => void,
): Promise<FilSparResultat> {
  return sparaForeningFil({ modul: FIL_MODUL, dokId, fil, onProgress });
}

export function taBortBibliotekFil(dok: BibliotekUppladdatDokument): void {
  taBortForeningFilFranPlats({ modul: FIL_MODUL, dokId: dok.id, moln: dok.moln });
  const all = lasAldreFiler();
  if (!(dok.id in all)) return;
  delete all[dok.id];
  safeSetLocalStorage(bibliotekFilerKey(), JSON.stringify(all));
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
