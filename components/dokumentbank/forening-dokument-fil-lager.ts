import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import {
  hamtaForeningFilUrlFranPlats,
  sparaForeningFil,
  taBortForeningFilFranPlats,
  type FilSparResultat,
} from "@/lib/forening-fil-lagring";
import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";

const FIL_LAGER_BASE = "brf-forenings-dokument-filer";
const FIL_MODUL = "forenings-dokument";

export type SparadDokumentFil = {
  filnamn: string;
  mime: string;
  /** data: URL — äldre demo-lagring i webbläsaren */
  dataUrl: string;
  storlek: number;
  uppladdad: string;
};

type FilLagerState = Record<string, SparadDokumentFil>;

function storageKey(): string {
  return foreningStorageKey(FIL_LAGER_BASE);
}

/** Äldre uppladdningar som sparades som data-URL i localStorage. */
function lasAldreFiler(): FilLagerState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return {};
    return JSON.parse(raw) as FilLagerState;
  } catch {
    return {};
  }
}

export function sparaDokumentFil(
  dokId: string,
  fil: File,
  onProgress?: (procent: number) => void,
): Promise<FilSparResultat> {
  return sparaForeningFil({ modul: FIL_MODUL, dokId, fil, onProgress });
}

export function harDokumentFil(dok: ForeningsDokument): boolean {
  return Boolean(dok.fil) || Boolean(lasAldreFiler()[dok.id]);
}

export function dokumentFilnamn(dok: ForeningsDokument): string {
  return dok.fil?.filnamn ?? lasAldreFiler()[dok.id]?.filnamn ?? dok.mallFilnamn;
}

/** Ger en blob-URL till dokumentets fil; anroparen ansvarar för att släppa den. */
export async function hamtaDokumentFilUrl(
  dok: ForeningsDokument,
): Promise<string | null> {
  if (dok.fil) {
    return hamtaForeningFilUrlFranPlats({
      modul: FIL_MODUL,
      dokId: dok.id,
      moln: dok.fil.moln,
    });
  }
  const aldre = lasAldreFiler()[dok.id];
  if (!aldre?.dataUrl) return null;
  const blob = await (await fetch(aldre.dataUrl)).blob();
  return URL.createObjectURL(blob);
}

export function taBortDokumentFil(dok: ForeningsDokument): void {
  if (dok.fil) {
    taBortForeningFilFranPlats({ modul: FIL_MODUL, dokId: dok.id, moln: dok.fil.moln });
  }
  const all = lasAldreFiler();
  if (!(dok.id in all)) return;
  delete all[dok.id];
  safeSetLocalStorage(storageKey(), JSON.stringify(all));
}

export function lasFilSomText(fil: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
    reader.readAsText(fil, "UTF-8");
  });
}
