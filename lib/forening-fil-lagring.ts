import { foreningStorageKey } from "@/lib/foreningStorage";
import { idbHamtaFil, idbSparaFil, idbTaBortFil } from "@/lib/fil-lager-idb";
import {
  hamtaForeningFilUrl,
  laddaUppForeningFil,
  MAX_MOLN_FIL_BYTE,
  taBortForeningFil,
  type MolnFilRef,
} from "@/lib/forening-filer-moln";

export { MOLN_FIL_ACCEPT, oppnaFilIFlik, type MolnFilRef } from "@/lib/forening-filer-moln";

export const MAX_FIL_BYTE = MAX_MOLN_FIL_BYTE;

/** Var en sparad fil finns: i molnet (`moln`) eller lokalt i webbläsaren (saknar `moln`). */
export type FilPlats = {
  modul: string;
  dokId: string;
  moln?: MolnFilRef;
};

export type FilSparResultat =
  | { ok: true; moln?: MolnFilRef }
  | { ok: false; fel: string };

function lokalNyckel(modul: string, dokId: string): string {
  return `${foreningStorageKey(`brf-${modul}-filer`)}::${dokId}`;
}

export function formateraFilstorlek(byte: number): string {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} kB`;
  return `${(byte / (1024 * 1024)).toLocaleString("sv-SE", {
    maximumFractionDigits: 1,
  })} MB`;
}

/** Sparar i föreningens molnlagring; faller tillbaka på webbläsaren endast i demo/utan molnkonfiguration. */
export async function sparaForeningFil(opts: {
  modul: string;
  dokId: string;
  fil: File;
  onProgress?: (procent: number) => void;
}): Promise<FilSparResultat> {
  if (opts.fil.size > MAX_FIL_BYTE) {
    return {
      ok: false,
      fel: `Filen är ${formateraFilstorlek(opts.fil.size)} – max ${formateraFilstorlek(MAX_FIL_BYTE)}.`,
    };
  }

  const moln = await laddaUppForeningFil(opts);
  if (moln.ok) return { ok: true, moln: moln.ref };
  if (!moln.lokalt) return { ok: false, fel: moln.fel };

  try {
    await idbSparaFil(lokalNyckel(opts.modul, opts.dokId), {
      filnamn: opts.fil.name,
      mime: opts.fil.type || "application/octet-stream",
      storlek: opts.fil.size,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
      blob: opts.fil,
    });
    return { ok: true };
  } catch (error) {
    const full =
      error instanceof DOMException && error.name === "QuotaExceededError";
    return {
      ok: false,
      fel: full
        ? "Webbläsarens lagring är full. Ta bort äldre dokument och försök igen."
        : "Kunde inte spara filen i webbläsaren. Kontrollera att lagring är tillåten (t.ex. inte privat läge).",
    };
  }
}

/** Ger en blob-URL till filen; anroparen ansvarar för att släppa den. */
export async function hamtaForeningFilUrlFranPlats(plats: FilPlats): Promise<string | null> {
  if (plats.moln) return hamtaForeningFilUrl(plats.moln);
  try {
    const fil = await idbHamtaFil(lokalNyckel(plats.modul, plats.dokId));
    return fil ? URL.createObjectURL(fil.blob) : null;
  } catch {
    return null;
  }
}

export function taBortForeningFilFranPlats(plats: FilPlats): void {
  if (plats.moln) {
    void taBortForeningFil(plats.moln);
    return;
  }
  void idbTaBortFil(lokalNyckel(plats.modul, plats.dokId)).catch(() => undefined);
}
