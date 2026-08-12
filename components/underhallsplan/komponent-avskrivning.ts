/**
 * Rekommenderade avskrivningstider (nyttjandeperioder) för K3-komponentavskrivning.
 * Separata från underhållsintervall — kortcykliskt underhåll är inte K3-komponenter.
 *
 * Typiska intervall enligt branschpraxis / FAR-vägledning för BRF (orienterande).
 * Föreningen och ekonomisk förvaltare bedömer slutlig nyttjandeperiod.
 */

export type AvskrivningRekommendation = {
  rekommenderadAvskrivningAr: number;
  /** Betydande byggnadskomponent med egen nyttjandeperiod enligt K3. */
  arK3Komponent: boolean;
  hint: string;
};

const rekommendationer: Record<
  string,
  Record<string, AvskrivningRekommendation>
> = {
  Fasad: {
    fasadmaterial: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "Fasad — ofta 40–60 år beroende på material och klimat.",
    },
    fonster: {
      rekommenderadAvskrivningAr: 35,
      arK3Komponent: true,
      hint: "Fönster — ofta 30–40 år.",
    },
    dorrar: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Ytterdörrar — ofta 25–40 år.",
    },
    balkonger: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Balkongstomme/platta — ofta 30–50 år (tätskikt kortare).",
    },
    sockel: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "Sockel — ofta i linje med fasad.",
    },
  },
  Tak: {
    takyta: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Takbeläggning — ofta 30–50 år (papp kortare, plåt längre).",
    },
    takfonster: {
      rekommenderadAvskrivningAr: 35,
      arK3Komponent: true,
      hint: "Takfönster — ofta 30–40 år.",
    },
    takterrass: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Tätskikt takterrass — ofta 15–30 år.",
    },
    medlemstakterrass: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Som gemensam takterrass — kortare än stomme/undertak.",
    },
    skorsten: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Skorstenar — ofta 30–50 år.",
    },
    ventilationshuv: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Ventilationshuvor — ofta 20–30 år.",
    },
    takkupa: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Takkupor — ofta i linje med takstomme/beläggning.",
    },
  },
  Trapphus: {
    hiss: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Hiss — ofta 25–35 år.",
    },
    // Målning m.m. är löpande underhåll — inte egen K3-komponent
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
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Ledstång — ofta 20–30 år vid byte.",
    },
    golv: {
      rekommenderadAvskrivningAr: 20,
      arK3Komponent: true,
      hint: "Trapphusgolv vid större byte — oftast 15–25 år.",
    },
  },
  VVS: {
    stambyte: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "Stammar (vatten/avlopp) — ofta 40–60 år.",
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
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Undercentral / värmeväxlare — ofta 25–40 år.",
    },
    radiatorer: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Radiatorer — ofta 30–50 år.",
    },
    varmestammar: {
      rekommenderadAvskrivningAr: 50,
      arK3Komponent: true,
      hint: "Värmestammar — ofta 40–60 år.",
    },
    stamventiler: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Stamventiler — ofta 20–30 år.",
    },
  },
  Ventilation: {
    aggregat: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Ventilationsaggregat — ofta 20–30 år.",
    },
    kanaler: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Kanaler — ofta 30–50 år.",
    },
    don: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Don/ventiler — ofta 20–30 år vid byte.",
    },
  },
  Balkonger: {
    balkonger: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Balkonger (stomme/platta/räcke) — ofta 30–50 år; tätskikt kortare.",
    },
  },
  Elcentral: {
    central: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Elcentraler — ofta 25–40 år.",
    },
    grupper: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Gruppcentraler — ofta 25–40 år.",
    },
  },
  "Mark och gård": {
    gard: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Hårdgjord gårdyta vid större omläggning — ofta 20–40 år.",
    },
    ledning: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Markledningar — ofta 30–50 år.",
    },
    plantering: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Plantering — normalt inte egen K3-byggnadskomponent.",
    },
  },
  Källare: {
    forrad: {
      rekommenderadAvskrivningAr: 40,
      arK3Komponent: true,
      hint: "Förrådsinredning vid större investering — bedöms per fall.",
    },
    belysning: {
      rekommenderadAvskrivningAr: 20,
      arK3Komponent: true,
      hint: "Belysningsinstallation — ofta 15–25 år.",
    },
    ytskikt: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Ytskikt/målning — löpande underhåll.",
    },
    golv: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Källargolv vid större byte — ofta 20–30 år.",
    },
  },
  Brandskydd: {
    sba: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "SBA — organisatoriskt, inte komponentavskrivning.",
    },
    branddorrar: {
      rekommenderadAvskrivningAr: 30,
      arK3Komponent: true,
      hint: "Branddörrar — ofta 25–40 år vid byte.",
    },
    utrymningsvag: {
      rekommenderadAvskrivningAr: 0,
      arK3Komponent: false,
      hint: "Utrymningsväg/skyltning — oftast underhåll, inte stomkomponent.",
    },
    rokgasevakuering: {
      rekommenderadAvskrivningAr: 25,
      arK3Komponent: true,
      hint: "Rökgasevakuering — ofta 20–30 år.",
    },
  },
};

/** Stomme ingår normalt i K3 men saknas som egen rad i registret — vägledning. */
export const K3_STOMME_VAGLEDNING = {
  etikett: "Stomme och grund",
  rekommenderadAvskrivningAr: 100,
  hint: "Stomme/grund — ofta 80–100 år. Sätts vanligen av ekonomisk förvaltare i anläggningsregistret; underhållsplanen vägleder övriga komponenter.",
} as const;

export const K3_FORKLARING = {
  rubrik: "K3 — komponentavskrivning från 2026",
  kort: "Från räkenskapsår som börjar 2026 ska bostadsrättsföreningar tillämpa K3 (BFNAR 2012:1). Byggnaden delas upp i betydande komponenter med olika nyttjandeperioder och skrivs av separat.",
  underlag:
    "Underhållsplanens komponentregister med avskrivningstider är vägledande underlag till anläggningsregistret och årsredovisningen. Slutlig komponentindelning och värden beslutas tillsammans med ekonomisk förvaltare/revisor.",
  skillnad:
    "Underhållsintervall (när ni planerar åtgärd) är inte samma sak som avskrivningstid (nyttjandeperiod i bokföringen). Kort underhåll — t.ex. spolning eller målning — är normalt inte egna K3-komponenter.",
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
    hamtaAvskrivningRekommendation(komponentNamn, underkomponentId)?.arK3Komponent,
  );
}

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
