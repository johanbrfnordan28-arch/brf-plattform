/**
 * Rekommenderade avskrivningstider (nyttjandeperioder) för K3-komponentavskrivning.
 * Baserat på FAR:s vägledning Tabell 1–2 (komponentindelning i BRF).
 * Separata från underhållsintervall — kortcykliskt underhåll är inte K3-komponenter.
 */

export type AvskrivningRekommendation = {
  rekommenderadAvskrivningAr: number;
  /** Betydande byggnadskomponent med egen nyttjandeperiod enligt FAR/K3. */
  arK3Komponent: boolean;
  hint: string;
};

const rekommendationer: Record<
  string,
  Record<string, AvskrivningRekommendation>
> = {
  Stomme: {
    stomme: {
      rekommenderadAvskrivningAr: 120,
      arK3Komponent: true,
      hint: "FAR: betongstomme 120 år; trästomme på betonggrund 75 år.",
    },
  },
  Fasad: {
    fasadmaterial: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "FAR: trä/puts/betongelement ~40 år; murtegel 100 år.",
    },
    fonster: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "FAR: trä/plast 40 år; trä beklädd/aluminium 60 år.",
    },
    dorrar: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Ytterdörrar — normalt underhåll; FAR lyfter inte dörrar som egen väsentlig komponent.",
    },
    balkonger: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "FAR: balkong betong 50 år; trä 30 år; inglasning 25 år.",
    },
    sockel: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Sockel — normalt del av fasad/stomme, inte egen FAR-komponent.",
    },
  },
  Fönster: {
    fonster: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "FAR: trä/plast 40 år; trä beklädd/aluminium 60 år.",
    },
  },
  Tak: {
    takyta: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "FAR yttertak: papp 30 år; tegel 40 år; plåt/skiffer 60 år.",
    },
    takfonster: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Takfönster — underhåll/del av yttertak; inte egen FAR Tabell 1-komponent.",
    },
    takterrass: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Takterrass — underhåll; inte egen FAR Tabell 1-komponent.",
    },
    medlemstakterrass: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Medlemstakterrass — underhåll; inte egen FAR Tabell 1-komponent.",
    },
    skorsten: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Skorsten — normalt underhåll, inte egen FAR Tabell 1-komponent.",
    },
    ventilationshuv: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Ventilationshuv — underhåll.",
    },
    takkupa: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Takkupa — del av yttertak/stomme.",
    },
  },
  Trapphus: {
    hiss: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "FAR: linhiss 40 år; hydraul 30 år; plattformshiss 20 år.",
    },
    lagenhetsdorrar: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Utvändig målning — löpande underhåll, inte komponentavskrivning.",
    },
    "vaggar-malning": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Målning — löpande underhåll.",
    },
    "tak-malning": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Målning — löpande underhåll.",
    },
    ledstang: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Ledstång — underhåll; FAR lyfter inte trapphusdetaljer som egen komponent.",
    },
    golv: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Trapphusgolv — underhåll.",
    },
  },
  VVS: {
    stambyte: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "FAR: stamledning VA 50 år.",
    },
    "spolning-avlopp": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Stamspolning — löpande underhåll, inte K3-komponent.",
    },
    "filmning-avlopp": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Filmning — kontrollåtgärd, inte komponentavskrivning.",
    },
  },
  Värmecentral: {
    undercentral: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Undercentral — underhåll; FAR Tabell 1 lyfter stamledning värme.",
    },
    radiatorer: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Radiatorer — underhåll; FAR Tabell 1 lyfter stamledning värme.",
    },
    varmestammar: {
      rekommenderadAvskrivningAr: 80,
      arK3Komponent: true,
      hint: "FAR: stamledning värme 80 år.",
    },
    stamventiler: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Stamventiler — underhåll/del av värmesystem.",
    },
  },
  Ventilation: {
    aggregat: {
      rekommenderadAvskrivningAr: 20,
      arK3Komponent: true,
      hint: "FAR: från-/tilluft 20 år; självdrag 100 år.",
    },
    filterbyte: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Filterbyte — löpande underhåll, kostnadsförs årligen.",
    },
    kanaler: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Kanaler — normalt del av ventilationssystemet, inte egen FAR Tabell 1-rad.",
    },
    don: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Don — underhåll.",
    },
    "extra-flaktar": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Övriga fläktar — underhåll.",
    },
  },
  Balkonger: {
    balkonger: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "FAR: balkong betong 50 år; trä 30 år; inglasning 25 år.",
    },
  },
  Elcentral: {
    central: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "FAR: el 50 år.",
    },
    grupper: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Gruppcentraler — normalt del av el; FAR lyfter el som en komponent.",
    },
  },
  "Styr och övervakning": {
    system: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "FAR: styr och övervakning 25 år.",
    },
  },
  "Mark och gård": {
    gard: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Gårdyta — underhåll; ingår inte i FAR:s väsentliga byggnadskomponenter.",
    },
    ledning: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Markledningar — underhåll; FAR fokuserar på stammar i byggnaden.",
    },
    plantering: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Plantering — inte K3-byggnadskomponent.",
    },
  },
  Källare: {
    forrad: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Förråd — underhåll; inte FAR Tabell 1-komponent.",
    },
    belysning: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Belysning — underhåll.",
    },
    ytskikt: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Ytskikt/målning — löpande underhåll.",
    },
    golv: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Källargolv — underhåll.",
    },
  },
  "Komplement byggnad och P-platser": {
    cykelrum: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Cykelförråd som komplementbyggnad — plåttak/stomme ca 40 år; löpande målning av träväggar är underhåll.",
    },
    soprum: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Soprum som komplementbyggnad (ev. med undercentral) — plåttak/stomme ca 40 år.",
    },
    forrad: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Förråd — underhåll; inte egen FAR Tabell 1-komponent.",
    },
    "p-platser": {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "P-platser / laddstolpar — underhåll; laddinfrastruktur kan aktiveras separat.",
    },
  },
  Brandskydd: {
    sba: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "SBA — organisatoriskt, inte komponentavskrivning.",
    },
    branddorrar: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Branddörrar — underhåll; inte FAR Tabell 1-komponent.",
    },
    utrymningsvag: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Utrymningsväg/skyltning — underhåll.",
    },
    rokgasevakuering: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Rökgasevakuering — underhåll.",
    },
  },
};

/** @deprecated Använd FAR-komponenten Stomme i registret. Behålls för äldre planer. */
export const K3_STOMME_VAGLEDNING = {
  etikett: "Stomme och grund",
  rekommenderadAvskrivningAr: 120,
  hint: "FAR: betongstomme 120 år; trästomme på betonggrund 75 år.",
} as const;

export const K3_FORKLARING = {
  rubrik: "Komponentvärden (K3)",
  kort: "Från 2026 ska BRF:er tillämpa K3. Här visas uppskattade installationsvärden per komponent — utan detaljerade andelsberäkningar.",
  underlag:
    "Värdena är uppskattningar för underhållsplanen och vägledning till anläggningsregistret. Slutlig indelning beslutas med ekonomisk förvaltare. Justera eller ta bort komponenter i steg 3.",
  skillnad:
    "Installationsvärde (byggår) är skilt från planerat underhåll (när ni åtgärdar).",
} as const;

export function hamtaAvskrivningRekommendation(
  komponentNamn: string,
  underkomponentId: string,
): AvskrivningRekommendation | undefined {
  return rekommendationer[komponentNamn]?.[underkomponentId];
}

/** Tom sträng om delen inte är K3-komponent eller saknar rekommendation. */
export function standardAvskrivningAr(
  komponentNamn: string,
  underkomponentId: string,
): string {
  const rek = hamtaAvskrivningRekommendation(komponentNamn, underkomponentId);
  if (!rek?.arK3Komponent || rek.rekommenderadAvskrivningAr <= 0) return "";
  return String(rek.rekommenderadAvskrivningAr);
}

export function arK3AvskrivningsKomponent(
  komponentNamn: string,
  underkomponentId: string,
): boolean {
  return Boolean(
    hamtaAvskrivningRekommendation(komponentNamn, underkomponentId)
      ?.arK3Komponent,
  );
}

/**
 * Kortcykliska underhållsåtgärder (målning, spolning, filmning m.m.)
 * som kostnadsförs det år de utförs — aktiveras inte / skrivs inte av (K3).
 */
const DIREKTKOSTNAD_ATGARD_ID = new Set([
  "ommalning",
  "fasadtvatt",
  "putsreparation",
  "takmalning",
  "plat-underhall",
  "tak-kontroll",
  "fonster-malning",
  "fonster-kontroll",
]);

/**
 * true = kostnadsfört underhåll i resultaträkningen (intervall),
 * false = åtgärd som kan aktiveras och skrivas av.
 */
export function arDirektkostnadUnderhall(
  komponentNamn: string,
  underkomponentId?: string | null,
  atgardId?: string | null,
): boolean {
  const atgard = (atgardId ?? "").trim();
  if (atgard && DIREKTKOSTNAD_ATGARD_ID.has(atgard)) return true;

  const underId = (underkomponentId ?? "").trim();
  if (!underId) return false;
  const rek = hamtaAvskrivningRekommendation(komponentNamn, underId);
  if (!rek) return false;
  return !rek.arK3Komponent;
}

export const DIREKTKOSTNAD_FORKLARING =
  "Periodiskt underhåll (drift) — kostnadsförs direkt i resultaträkningen det år åtgärden utförs. Aktiveras inte som anläggningstillgång och skrivs därför inte av (K3).";

/** Effektiv avskrivningstid — sparad eller standard. */
export function effektivAvskrivningAr(
  komponentNamn: string,
  underkomponentId: string,
  sparadAvskrivningAr?: string | null,
): number {
  const sparad = Number.parseInt(String(sparadAvskrivningAr ?? "").trim(), 10);
  if (Number.isFinite(sparad) && sparad > 0) return sparad;
  const standard = Number.parseInt(
    standardAvskrivningAr(komponentNamn, underkomponentId),
    10,
  );
  return Number.isFinite(standard) && standard > 0 ? standard : 0;
}
