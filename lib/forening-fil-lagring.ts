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

/** En uppladdad fil som kan visas på flera ställen; alla ställen pekar på samma `filId`. */
export type DeladFil = {
  filId: string;
  modul: string;
  filnamn: string;
  moln?: MolnFilRef;
};

export function deladFilPlats(fil: DeladFil): FilPlats {
  return { modul: fil.modul, dokId: fil.filId, moln: fil.moln };
}

export function arDeladFil(value: unknown): value is DeladFil {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DeladFil>;
  return (
    typeof v.filId === "string" &&
    typeof v.modul === "string" &&
    typeof v.filnamn === "string" &&
    (v.moln === undefined ||
      (typeof v.moln?.foreningId === "string" && typeof v.moln?.pathname === "string"))
  );
}

/** Laddar upp en ny fil och ger en delbar referens till den. */
export async function laddaUppDeladFil(opts: {
  modul: string;
  fil: File;
  onProgress?: (procent: number) => void;
}): Promise<{ ok: true; fil: DeladFil } | { ok: false; fel: string }> {
  const filId = `fil-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await sparaForeningFil({ ...opts, dokId: filId });
  if (!res.ok) return res;
  return {
    ok: true,
    fil: {
      filId,
      modul: opts.modul,
      filnamn: opts.fil.name,
      ...(res.moln ? { moln: res.moln } : {}),
    },
  };
}

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
