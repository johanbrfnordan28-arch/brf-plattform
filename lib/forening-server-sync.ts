/**
 * Synkar föreningsprofil och avtal till servern (API).
 * localStorage är fortfarande primär lagring i webbläsaren tills
 * full styrelseinloggning finns — servern speglar profil + avtal.
 */

import type { ForeningProfil } from "@/lib/forening-registry";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

const ACCESS_BASE = "brf-server-access";
const SYNC_FLAG_BASE = "brf-server-synkad";

export type ServerSyncResultat =
  | { ok: true; accessNyckel: string }
  | { ok: false; fel: string; tillfallig?: boolean };

function accessStorageKey(foreningId: string): string {
  return foreningStorageKey(ACCESS_BASE, foreningId);
}

function syncFlagKey(foreningId: string): string {
  return foreningStorageKey(SYNC_FLAG_BASE, foreningId);
}

export function hamtaServerAccessNyckel(foreningId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(accessStorageKey(foreningId));
  } catch {
    return null;
  }
}

export function sparaServerAccessNyckel(
  foreningId: string,
  nyckel: string,
): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(accessStorageKey(foreningId), nyckel);
  safeSetLocalStorage(syncFlagKey(foreningId), new Date().toISOString());
}

function profilTillPayload(profil: ForeningProfil) {
  return {
    id: profil.id,
    namn: profil.namn,
    organisationsnummer: profil.organisationsnummer,
    epost: profil.epost,
    postadress: profil.postadress,
    ort: profil.ort,
    kontaktperson: profil.kontaktperson,
    grundinfoPaborjad: profil.grundinfoPaborjad,
    avtalGodkant: profil.avtalGodkant,
    avtalGodkantTidpunkt: profil.avtalGodkantTidpunkt || null,
    skapadTidpunkt: profil.skapadTidpunkt,
  };
}

async function lasJson(res: Response): Promise<{
  forening?: unknown;
  accessNyckel?: string;
  fel?: string;
}> {
  try {
    return (await res.json()) as {
      forening?: unknown;
      accessNyckel?: string;
      fel?: string;
    };
  } catch {
    return { fel: "Ogiltigt svar från servern." };
  }
}

/**
 * Skapar föreningen på servern om den saknas, annars uppdaterar.
 * Misslyckad synk blockerar inte det lokala flödet.
 */
export async function synkaForeningTillServer(
  profil: ForeningProfil,
): Promise<ServerSyncResultat> {
  if (typeof window === "undefined") {
    return { ok: false, fel: "Endast i webbläsaren.", tillfallig: true };
  }

  const payload = profilTillPayload(profil);
  const befintligNyckel = hamtaServerAccessNyckel(profil.id);

  try {
    if (!befintligNyckel) {
      const res = await fetch("/api/foreningar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await lasJson(res);

      if (res.status === 409) {
        return {
          ok: false,
          fel:
            data.fel ||
            "Föreningen finns på servern men åtkomstnyckel saknas lokalt.",
        };
      }

      if (!res.ok || !data.accessNyckel) {
        return {
          ok: false,
          fel: data.fel || `Kunde inte skapa på servern (${res.status}).`,
          tillfallig: res.status >= 500,
        };
      }

      sparaServerAccessNyckel(profil.id, data.accessNyckel);
      return { ok: true, accessNyckel: data.accessNyckel };
    }

    const res = await fetch(`/api/foreningar/${encodeURIComponent(profil.id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-nyckel": befintligNyckel,
      },
      body: JSON.stringify(payload),
    });
    const data = await lasJson(res);

    if (res.status === 404) {
      localStorage.removeItem(accessStorageKey(profil.id));
      return synkaForeningTillServer(profil);
    }

    if (!res.ok) {
      return {
        ok: false,
        fel: data.fel || `Kunde inte uppdatera (${res.status}).`,
        tillfallig: res.status >= 500,
      };
    }

    sparaServerAccessNyckel(profil.id, befintligNyckel);
    return { ok: true, accessNyckel: befintligNyckel };
  } catch {
    return {
      ok: false,
      fel: "Ingen kontakt med servern — uppgifterna sparades lokalt.",
      tillfallig: true,
    };
  }
}

export async function synkaAvtalTillServer(
  foreningId: string,
  profil?: ForeningProfil,
): Promise<ServerSyncResultat> {
  if (typeof window === "undefined") {
    return { ok: false, fel: "Endast i webbläsaren.", tillfallig: true };
  }

  let accessNyckel = hamtaServerAccessNyckel(foreningId);

  if (!accessNyckel && profil) {
    const synk = await synkaForeningTillServer(profil);
    if (!synk.ok) return synk;
    accessNyckel = synk.accessNyckel;
  }

  if (!accessNyckel) {
    return {
      ok: false,
      fel: "Ingen servernyckel — spara föreningsuppgifter igen för att synka.",
    };
  }

  try {
    const res = await fetch(
      `/api/foreningar/${encodeURIComponent(foreningId)}/avtal`,
      {
        method: "POST",
        headers: { "x-access-nyckel": accessNyckel },
      },
    );
    const data = await lasJson(res);
    if (!res.ok) {
      return {
        ok: false,
        fel: data.fel || `Kunde inte synka avtal (${res.status}).`,
        tillfallig: res.status >= 500,
      };
    }
    return { ok: true, accessNyckel };
  } catch {
    return {
      ok: false,
      fel: "Ingen kontakt med servern — avtalet sparades lokalt.",
      tillfallig: true,
    };
  }
}
