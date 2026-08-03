import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  FORENING_AKTIV_EVENT,
  FORENING_PROFIL_BASE_KEY,
  lasAktivForeningId,
  lasForeningProfil,
  rensaForeningLocalStorage,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  forberedNyForening,
  kopieraGrundmallDataTillForening,
} from "@/lib/kopiera-grundmall-data";
import {
  arStandardTestForening,
  rensaStandardTestForening,
  STANDARD_TESTFORENINGAR,
} from "@/lib/testforeningar";

/**
 * Modulnycklar som tillhör en förenings miljö.
 * Används vid export av grundmall (utan prefix) och vid full återställning.
 */
export const FORENING_MODUL_NYCKLAR = [
  "brf-underhallsplan-state",
  "brf-underhallsplan-bildstod",
  "brf-underhallsplan-kommande-projekt",
  "brf-rondering-state",
  "brf-rondering-signering-schema",
  "brf-rondering-manadssignering",
  "brf-upphandling-lager",
  "brf-upphandling-schema-bilagor",
  "brf-upphandling-kategori-dokument",
  "brf-forenklad-upphandling",
  "brf-mindre-byggarbeten",
  "brf-arshjul-handelser",
  "brf-grundmall-projekt",
  "brf-tidsplan-bibliotek",
  "brf-forening-sotning-protokoll",
  "brf-nyckel-kvittenser",
  "brf-egna-nycklar",
  "brf-lagenhetsarkiv-v2",
  "brf-medlemmar-renovering",
  "brf-dokumentbank-egna",
  "brf-forenings-dokument",
  "brf-kommunikation",
  "brf-entreprenorer-lista",
  "brf-hus-entreprenorer",
  "brf-prislistor",
  "brf-plan-registry",
  "brf-sba-arbete",
  "brf-projektutvardering",
  "brf-juridik-egna-mappar",
  "brf-juridik-domar-egna-mappar",
  FORENING_PROFIL_BASE_KEY,
] as const;

/** Globala nycklar som aldrig ingår i en föreningsbackup. */
const GLOBALA_NYCKLAR = new Set([
  "brf-forening-registry",
  "brf-forening-aktiv-id",
  "brf-senast-skapat-profil",
  "brf-pending-aktiv-forening-id",
  "brf-nyss-skapad-forening-id",
  "brf-forening-aktiv-id-session",
]);

export type ForeningBackup = {
  version: 1;
  sparadTidpunkt: string;
  foreningId: string;
  foreningNamn: string;
  data: Record<string, string>;
};

function tomProfil(id: string, namn: string): ForeningProfil {
  return {
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
    organisationsnummer: "",
    epost: "",
    postadress: "",
    ort: "",
    kontaktperson: "",
    grundinfoPaborjad: false,
  };
}

function arPlanNyckel(baseKey: string): boolean {
  return baseKey === "brf-plan-registry" || baseKey.startsWith("brf-plan-");
}

function arRenoveringSigneringNyckel(baseKey: string): boolean {
  return baseKey.startsWith("brf-renovering-medlem-signering");
}

/** Alla localStorage-nycklar som tillhör en förening. */
export function listaForeningLagringNycklar(foreningId: string): string[] {
  if (typeof window === "undefined") return [];

  if (foreningId === GRUNDMALL_FORENING_ID) {
    const nycklar: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (GLOBALA_NYCKLAR.has(key)) continue;
      if (key.startsWith("brf-f-")) continue;
      if (
        FORENING_MODUL_NYCKLAR.includes(
          key as (typeof FORENING_MODUL_NYCKLAR)[number],
        ) ||
        arPlanNyckel(key) ||
        arRenoveringSigneringNyckel(key) ||
        key.startsWith("brf-")
      ) {
        nycklar.push(key);
      }
    }
    return nycklar.sort();
  }

  const prefix = `brf-f-${foreningId}--`;
  const nycklar: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) nycklar.push(key);
  }
  return nycklar.sort();
}

/** Bygger en komplett backup av föreningens sparade moduldata. */
export function byggForeningBackup(foreningId?: string): ForeningBackup {
  const id = foreningId ?? lasAktivForeningId();
  const profil = lasForeningProfil(id);
  const namn =
    profil?.namn ??
    (id === GRUNDMALL_FORENING_ID ? "Grundmall föreningar" : id);

  const data: Record<string, string> = {};
  for (const key of listaForeningLagringNycklar(id)) {
    const varde = localStorage.getItem(key);
    if (varde !== null) {
      // Spara med basnyckel (utan föreningsprefix) så backupen är flyttbar.
      const bas =
        id === GRUNDMALL_FORENING_ID
          ? key
          : key.slice(`brf-f-${id}--`.length);
      data[bas] = varde;
    }
  }

  // Säkerställ att profil alltid ingår om den finns.
  if (profil && id !== GRUNDMALL_FORENING_ID) {
    data[FORENING_PROFIL_BASE_KEY] = JSON.stringify(profil);
  }

  return {
    version: 1,
    sparadTidpunkt: new Date().toISOString(),
    foreningId: id,
    foreningNamn: namn,
    data,
  };
}

function saneraFilnamn(namn: string): string {
  return namn
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "forening";
}

/** Laddar ner en JSON-fil med all sparad föreningsdata. */
export function laddaNerForeningBackup(foreningId?: string): ForeningBackup {
  const backup = byggForeningBackup(foreningId);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const datum = backup.sparadTidpunkt.slice(0, 10);
  a.href = url;
  a.download = `brf-backup-${saneraFilnamn(backup.foreningNamn)}-${datum}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return backup;
}

/**
 * Nollställer föreningen till startläge.
 * - Testförening: rensar och seedar om testplanen.
 * - Övrig skapad förening: rensar, behåller namn, seedar minimal start + kopierar grundmall.
 * - Grundmall: tillåts inte (skulle radera malldata).
 */
export function nollstallForeningTillStartlage(foreningId?: string): {
  ok: boolean;
  meddelande: string;
} {
  if (typeof window === "undefined") {
    return { ok: false, meddelande: "Kan bara köras i webbläsaren." };
  }

  const id = foreningId ?? lasAktivForeningId();

  if (id === GRUNDMALL_FORENING_ID) {
    return {
      ok: false,
      meddelande:
        "Grundmallen kan inte nollställas här — den är mallen för nya föreningar. Exportera en backup om du vill spara ett läge.",
    };
  }

  if (arStandardTestForening(id)) {
    rensaStandardTestForening(id);
    const def = STANDARD_TESTFORENINGAR.find((t) => t.id === id);
    return {
      ok: true,
      meddelande: `${def?.namn ?? "Testföreningen"} är nollställd till startläge.`,
    };
  }

  const profil = lasForeningProfil(id);
  const namn = profil?.namn?.trim() || id;

  rensaForeningLocalStorage(id);
  sparaForeningProfil(tomProfil(id, namn), { tyst: true });
  forberedNyForening(id);
  kopieraGrundmallDataTillForening(id, { skrivOver: true });

  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));

  return {
    ok: true,
    meddelande: `«${namn}» är nollställd till startläge (grundmallens data).`,
  };
}

export function arGrundmallId(foreningId?: string): boolean {
  return (foreningId ?? lasAktivForeningId()) === GRUNDMALL_FORENING_ID;
}
