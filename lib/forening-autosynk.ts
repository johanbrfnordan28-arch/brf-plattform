import {
  aterstallForeningFranBackup,
  byggForeningBackup,
  sparaBackupTillServerBestEffort,
  valideraForeningBackup,
} from "@/lib/forening-backup";
import { beraknaInnehallHash } from "@/lib/forening-innehall-hash";
import {
  arStandardTestForening,
  GRUNDMALL_FORENING_ID,
} from "@/lib/forening-konstanter";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";

export const AUTOSYNK_STATUS_EVENT = "brf-autosynk-status";

export type AutoKopiaInfo = {
  id: string;
  innehallHash: string;
  exportedAt: string;
  antalNycklar: number;
  skapadAvEpost: string;
};

export type AutoSynkLage =
  | { typ: "av" }
  | { typ: "ok"; senastSparad: string | null }
  /** Servern har en version som den här webbläsaren saknar; inget lokalt går förlorat. */
  | { typ: "server-nyare"; senaste: AutoKopiaInfo }
  /** Både webbläsaren och servern har ändringar sedan senaste gemensamma version. */
  | { typ: "konflikt"; senaste: AutoKopiaInfo; forstaGangen: boolean }
  | { typ: "fel"; fel: string };

type Markor = { hash: string; sparad: string };

let aktuelltLage: AutoSynkLage = { typ: "av" };
let korPagar = false;

function markorNyckel(foreningId: string): string {
  return `brf-autosynk-v1-${foreningId}`;
}

function lasMarkor(foreningId: string): Markor | null {
  try {
    const raw = localStorage.getItem(markorNyckel(foreningId));
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<Markor>;
    return typeof o.hash === "string" && typeof o.sparad === "string"
      ? { hash: o.hash, sparad: o.sparad }
      : null;
  } catch {
    return null;
  }
}

function sparaMarkor(foreningId: string, info: AutoKopiaInfo): void {
  try {
    localStorage.setItem(
      markorNyckel(foreningId),
      JSON.stringify({ hash: info.innehallHash, sparad: info.exportedAt }),
    );
  } catch {
    /* utan markör frågar vi igen nästa gång — inget går förlorat */
  }
}

function sattLage(lage: AutoSynkLage): void {
  aktuelltLage = lage;
  window.dispatchEvent(new Event(AUTOSYNK_STATUS_EVENT));
}

export function lasAutoSynkLage(): AutoSynkLage {
  return aktuelltLage;
}

export function autoSynkGaller(foreningId: string): boolean {
  return (
    Boolean(foreningId) &&
    foreningId !== GRUNDMALL_FORENING_ID &&
    !arStandardTestForening(foreningId)
  );
}

function headers(foreningId: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const access = hamtaServerAccessNyckel(foreningId);
  if (access) h["x-access-nyckel"] = access;
  return h;
}

function url(foreningId: string): string {
  return `/api/foreningar/${encodeURIComponent(foreningId)}/autosynk`;
}

async function hamtaSenaste(
  foreningId: string,
): Promise<AutoKopiaInfo | null | "av"> {
  const res = await fetch(url(foreningId), {
    headers: headers(foreningId),
    cache: "no-store",
  });
  if (!res.ok) return "av";
  const data = (await res.json()) as { senaste?: AutoKopiaInfo | null };
  return data.senaste ?? null;
}

async function laddaUpp(
  foreningId: string,
  opts: { basHash: string | null; tvinga: boolean },
): Promise<AutoSynkLage> {
  const backup = byggForeningBackup(foreningId);
  if (!backup) return { typ: "av" };
  const res = await fetch(url(foreningId), {
    method: "POST",
    headers: headers(foreningId),
    body: JSON.stringify({ backup, basHash: opts.basHash, tvinga: opts.tvinga }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    status?: "sparad" | "oforandrad" | "konflikt";
    senaste?: AutoKopiaInfo;
    fel?: string;
  };
  if (data.status === "konflikt" && data.senaste) {
    return { typ: "konflikt", senaste: data.senaste, forstaGangen: !opts.basHash };
  }
  if (res.ok && data.senaste) {
    sparaMarkor(foreningId, data.senaste);
    return { typ: "ok", senastSparad: data.senaste.exportedAt };
  }
  if (res.status === 403 || res.status === 409 || res.status === 503) {
    return { typ: "av" };
  }
  return { typ: "fel", fel: data.fel || "Kunde inte spara automatiskt." };
}

/**
 * Jämför webbläsarens data med serverns senaste automatiska kopia och sparar
 * om något ändrats. Laddar aldrig upp när servern har en version som
 * webbläsaren inte utgått från — då får användaren välja.
 */
export async function korAutoSynk(
  foreningId: string,
  opts: { fragaServern: boolean },
): Promise<void> {
  if (typeof window === "undefined" || korPagar) return;
  if (!autoSynkGaller(foreningId)) {
    sattLage({ typ: "av" });
    return;
  }
  if (aktuelltLage.typ === "server-nyare" || aktuelltLage.typ === "konflikt") {
    if (!opts.fragaServern) return;
  }
  const backup = byggForeningBackup(foreningId);
  if (!backup) return;

  korPagar = true;
  try {
    const markor = lasMarkor(foreningId);
    const antal = Object.keys(backup.keys).length;
    const lokalHash = await beraknaInnehallHash(backup.keys);
    const oforandradLokalt = markor?.hash === lokalHash;

    if (oforandradLokalt || antal === 0) {
      if (!opts.fragaServern) return;
      const senaste = await hamtaSenaste(foreningId);
      if (senaste === "av") {
        sattLage({ typ: "av" });
      } else if (senaste && senaste.innehallHash !== lokalHash) {
        sattLage({ typ: "server-nyare", senaste });
      } else {
        sattLage({ typ: "ok", senastSparad: markor?.sparad ?? null });
      }
      return;
    }

    sattLage(await laddaUpp(foreningId, { basHash: markor?.hash ?? null, tvinga: false }));
  } catch {
    sattLage({ typ: "fel", fel: "Kunde inte nå servern för automatisk sparning." });
  } finally {
    korPagar = false;
  }
}

/** Ersätter webbläsarens data med serverns senaste kopia. Lokalt läge sparas först som manuell kopia. */
export async function hamtaServerversion(
  foreningId: string,
  senaste: AutoKopiaInfo,
  opts: { sparaLokaltForst: boolean },
): Promise<string | null> {
  if (opts.sparaLokaltForst) {
    await sparaBackupTillServerBestEffort(foreningId);
  }
  const res = await fetch(
    `/api/foreningar/${encodeURIComponent(foreningId)}/sakerhetskopior/${encodeURIComponent(senaste.id)}`,
    { headers: headers(foreningId), cache: "no-store" },
  );
  const data = (await res.json().catch(() => ({}))) as {
    backup?: unknown;
    fel?: string;
  };
  if (!res.ok || !data.backup) return data.fel || "Kunde inte hämta från servern.";
  const backup = valideraForeningBackup(data.backup);
  if (typeof backup === "string") return backup;
  const resultat = aterstallForeningFranBackup(backup, { kravForeningId: foreningId });
  if (!resultat.ok) return resultat.fel || "Kunde inte läsa in datan.";
  sparaMarkor(foreningId, senaste);
  return null;
}

/** Skriver över serverns version med webbläsarens. Serverns version sparas kvar som manuell kopia. */
export async function behallWebblasarensVersion(foreningId: string): Promise<void> {
  korPagar = true;
  try {
    sattLage(await laddaUpp(foreningId, { basHash: null, tvinga: true }));
  } catch {
    sattLage({ typ: "fel", fel: "Kunde inte spara till servern." });
  } finally {
    korPagar = false;
  }
}
