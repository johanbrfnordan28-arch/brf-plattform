import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import {
  hamtaForeningFilUrlFranPlats,
  laddaUppDeladFil,
  taBortForeningFilFranPlats,
  type DeladFil,
  type FilPlats,
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

export function sparaDokumentFil(fil: File, onProgress?: (procent: number) => void) {
  return laddaUppDeladFil({ modul: FIL_MODUL, fil, onProgress });
}

/** Dokumentets fil som delad fil, eller null för äldre uppladdningar. */
export function dokumentDeladFil(dok: ForeningsDokument): DeladFil | null {
  if (!dok.fil?.filId || !dok.fil.modul) return null;
  return {
    filId: dok.fil.filId,
    modul: dok.fil.modul,
    filnamn: dok.fil.filnamn,
    ...(dok.fil.moln ? { moln: dok.fil.moln } : {}),
  };
}

function filPlats(dok: ForeningsDokument): FilPlats | null {
  if (!dok.fil) return null;
  return {
    modul: dok.fil.modul ?? FIL_MODUL,
    dokId: dok.fil.filId ?? dok.id,
    moln: dok.fil.moln,
  };
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
  const plats = filPlats(dok);
  if (plats) return hamtaForeningFilUrlFranPlats(plats);
  const aldre = lasAldreFiler()[dok.id];
  if (!aldre?.dataUrl) return null;
  const blob = await (await fetch(aldre.dataUrl)).blob();
  return URL.createObjectURL(blob);
}

/** Tar bort äldre, odelade filer. Delade filer släpps via `slappDeladFil`. */
export function taBortDokumentFil(dok: ForeningsDokument): void {
  if (dokumentDeladFil(dok)) return;
  const plats = filPlats(dok);
  if (plats) taBortForeningFilFranPlats(plats);
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
