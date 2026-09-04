import {
  arGrundmallForening,
  hamtaAktivForeningId,
  lasForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";

export const FORENING_BACKUP_FORMAT = "brf-forening-backup" as const;
export const FORENING_BACKUP_VERSION = 1;

export type ForeningBackup = {
  format: typeof FORENING_BACKUP_FORMAT;
  version: typeof FORENING_BACKUP_VERSION;
  exportedAt: string;
  foreningId: string;
  profil: ForeningProfil | null;
  /** Råa localStorage-värden för nycklar som tillhör föreningen. */
  keys: Record<string, string>;
};

/** Alla localStorage-nycklar för en förening (samma prefix som vid rensning). */
export function samlaForeningLocalStorage(
  foreningId: string,
): Record<string, string> {
  if (typeof window === "undefined" || !foreningId) return {};
  const prefix = `brf-f-${foreningId}--`;
  const keys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const varde = localStorage.getItem(key);
    if (varde != null) keys[key] = varde;
  }
  return keys;
}

export function byggForeningBackup(foreningId?: string): ForeningBackup | null {
  if (typeof window === "undefined") return null;
  const id = foreningId ?? hamtaAktivForeningId();
  if (!id || arGrundmallForening(id)) return null;

  return {
    format: FORENING_BACKUP_FORMAT,
    version: FORENING_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    foreningId: id,
    profil: lasForeningProfil(id),
    keys: samlaForeningLocalStorage(id),
  };
}

function slugFranNamn(namn: string): string {
  const slug = namn
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "forening";
}

function datumFilnamn(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "backup";
  }
}

export function filnamnForBackup(backup: ForeningBackup): string {
  const namn = backup.profil?.namn?.trim() || backup.foreningId;
  return `sakerhetskopia-${slugFranNamn(namn)}-${datumFilnamn(backup.exportedAt)}.json`;
}

/** Laddar ner föreningens data som JSON — ansvaret ligger hos styrelsen. */
export function laddaNerForeningSakerhetskopia(foreningId?: string): {
  ok: boolean;
  filnamn?: string;
  antalNycklar?: number;
  fel?: string;
} {
  if (typeof window === "undefined") {
    return { ok: false, fel: "Säkerhetskopiering fungerar bara i webbläsaren." };
  }
  const backup = byggForeningBackup(foreningId);
  if (!backup) {
    return {
      ok: false,
      fel: "Säkerhetskopiering gäller er egen förening — inte demogrundmallen.",
    };
  }

  const filnamn = filnamnForBackup(backup);
  const text = JSON.stringify(backup, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn;
  a.click();
  URL.revokeObjectURL(url);

  return {
    ok: true,
    filnamn,
    antalNycklar: Object.keys(backup.keys).length,
  };
}
