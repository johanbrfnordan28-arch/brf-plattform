import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningId,
  lasForeningProfil,
  rensaForeningLocalStorage,
  repareraForeningRegistry,
  sattAktivForeningId,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
} from "@/lib/localStorage";

/** Remountar moduler efter återställning (samma förening, ny data). */
export const FORENING_DATA_AATERSTALL_EVENT = "brf-forening-data-aterstall";

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

export function formatBackupDatum(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Validerar uppladdad eller hämtad JSON. */
export function valideraForeningBackup(raw: unknown): ForeningBackup | string {
  if (!raw || typeof raw !== "object") return "Ogiltig säkerhetskopia.";
  const o = raw as Record<string, unknown>;
  if (o.format !== FORENING_BACKUP_FORMAT) {
    return "Filen är inte en Styrelse-Navet-säkerhetskopia.";
  }
  if (o.version !== FORENING_BACKUP_VERSION) {
    return "Säkerhetskopians version stöds inte.";
  }
  if (typeof o.foreningId !== "string" || !o.foreningId.trim()) {
    return "Säkerhetskopian saknar förenings-id.";
  }
  if (typeof o.exportedAt !== "string") {
    return "Säkerhetskopian saknar datum.";
  }
  if (!o.keys || typeof o.keys !== "object" || Array.isArray(o.keys)) {
    return "Säkerhetskopian saknar data.";
  }
  return {
    format: FORENING_BACKUP_FORMAT,
    version: FORENING_BACKUP_VERSION,
    exportedAt: o.exportedAt,
    foreningId: o.foreningId.trim(),
    profil:
      o.profil && typeof o.profil === "object"
        ? (o.profil as ForeningProfil)
        : null,
    keys: o.keys as Record<string, string>,
  };
}

export type AterstallResultat = {
  ok: boolean;
  fel?: string;
  antalSkrivna?: number;
  antalMisslyckade?: number;
};

/**
 * Återställer föreningens localStorage från en säkerhetskopia.
 * Skriver över befintlig data för samma förenings-id.
 */
export function aterstallForeningFranBackup(
  backup: ForeningBackup,
  opts?: { kravForeningId?: string },
): AterstallResultat {
  if (typeof window === "undefined") {
    return { ok: false, fel: "Återställning fungerar bara i webbläsaren." };
  }
  const id = backup.foreningId;
  if (!id || arGrundmallForening(id)) {
    return { ok: false, fel: "Kan inte återställa till grundmallen." };
  }
  if (opts?.kravForeningId && opts.kravForeningId !== id) {
    return {
      ok: false,
      fel: "Säkerhetskopian tillhör en annan förening än den ni är inne på.",
    };
  }

  const prefix = `brf-f-${id}--`;
  rensaForeningLocalStorage(id);

  let skrivna = 0;
  let misslyckade = 0;
  let forstaFel: string | null = null;
  for (const [key, varde] of Object.entries(backup.keys)) {
    if (!key.startsWith(prefix)) continue;
    if (typeof varde !== "string") continue;
    const resultat = safeSetLocalStorage(key, varde);
    if (resultat.ok) {
      skrivna += 1;
    } else {
      misslyckade += 1;
      if (!forstaFel) forstaFel = localStorageFelMeddelande(resultat.error);
    }
  }

  if (skrivna === 0 && Object.keys(backup.keys).length > 0) {
    return {
      ok: false,
      fel: forstaFel || "Säkerhetskopian innehöll inga giltiga nycklar för föreningen.",
      antalSkrivna: 0,
      antalMisslyckade: misslyckade,
    };
  }

  if (backup.profil?.id === id) {
    try {
      sparaForeningProfil(backup.profil, { tyst: true, synkaServer: false });
    } catch {
      /* profilnyckeln kan redan finnas i backup.keys */
    }
  }

  repareraForeningRegistry();
  sattAktivForeningId(id, { tyst: true });
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  window.dispatchEvent(new Event(FORENING_DATA_AATERSTALL_EVENT));

  if (misslyckade > 0) {
    return {
      ok: false,
      fel: `${misslyckade} dataposter kunde inte sparas. ${forstaFel || ""}`.trim(),
      antalSkrivna: skrivna,
      antalMisslyckade: misslyckade,
    };
  }

  return { ok: true, antalSkrivna: skrivna, antalMisslyckade: 0 };
}

/** Sparar nuvarande läge till servern innan destruktiv åtgärd (tyst vid fel). */
export async function sparaBackupTillServerBestEffort(
  foreningId: string,
): Promise<boolean> {
  if (typeof window === "undefined" || !foreningId || arGrundmallForening(foreningId)) {
    return false;
  }
  const backup = byggForeningBackup(foreningId);
  if (!backup) return false;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const access = hamtaServerAccessNyckel(foreningId);
  if (access) headers["x-access-nyckel"] = access;

  try {
    const res = await fetch(
      `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ backup }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Laddar ner föreningens data som JSON. */
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
