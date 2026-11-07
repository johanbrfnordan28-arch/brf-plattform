/** Åtgärdskataloger för underhållstillfällen (tak, fönster m.fl.). */

import type { RenoveringAtgardTyp } from "@/components/underhallsplan/renovering-klassificering";
import { arTakKomponent } from "@/components/underhallsplan/tak-enheter";

export type UnderhallAtgardKatalogPost = {
  id: string;
  etikett: string;
  beskrivning: string;
  /** Föreslaget intervall när åtgärden registreras som utfört underhåll. */
  standardIntervallAr?: number;
};

export type UnderhallTillfallenPlanNyckel =
  | "tak-takyta"
  | "fonster"
  | `typ-${RenoveringAtgardTyp}`;

const takTakytaAtgarder: UnderhallAtgardKatalogPost[] = [
  {
    id: "tak-rengoring",
    etikett: "Takrengöring",
    standardIntervallAr: 5,
    beskrivning:
      "Rengöring av takytan — gäller tegel, plåt, papp och övriga beläggningar.",
  },
  {
    id: "takomlaggning",
    etikett: "Takomläggning / nytt tak",
    standardIntervallAr: 40,
    beskrivning:
      "Byte av takbeläggning eller större ingrepp — ofta vart 25–40:e år beroende på material.",
  },
  {
    id: "takmalning",
    etikett: "Takmålning / ytaunderhåll",
    standardIntervallAr: 15,
    beskrivning:
      "Ommålning av målad plåt — gäller inte koppar, zink, rostfritt eller obehandlad aluminium.",
  },
  {
    id: "plat-underhall",
    etikett: "Underhåll plåtdetaljer",
    standardIntervallAr: 10,
    beskrivning:
      "Kontroll och lagning av plåt, nock, vindskivor och genomföringar.",
  },
  {
    id: "tak-kontroll",
    etikett: "Takinspektion / kontroll",
    standardIntervallAr: 3,
    beskrivning: "Statuskontroll utan större ingrepp — kan planeras oftare.",
  },
];

const fonsterAtgarder: UnderhallAtgardKatalogPost[] = [
  {
    id: "fonster-malning",
    etikett: "Målning fönster",
    standardIntervallAr: 12,
    beskrivning:
      "Ommålning av karmar och bågar — enklare åtgärd mellan större renoveringar.",
  },
  {
    id: "fonster-delrenovering",
    etikett: "Delrenovering fönster",
    standardIntervallAr: 20,
    beskrivning:
      "Byte av glas, beslag eller delar — mer omfattande än målning men mindre än fullt byte.",
  },
  {
    id: "fonster-byte",
    etikett: "Fönsterbyte",
    standardIntervallAr: 40,
    beskrivning:
      "Helt byte av fönster — ofta vart 30–50:e år beroende på material och skick.",
  },
  {
    id: "fonster-tatning",
    etikett: "Tätning / fogning",
    standardIntervallAr: 10,
    beskrivning: "Tätning kring karm, lister och glas — löpande underhåll.",
  },
];

function typKatalog(
  prefix: string,
  storEtikett: string,
  lopandeEtikett: string,
): UnderhallAtgardKatalogPost[] {
  return [
    {
      id: `${prefix}-stor`,
      etikett: storEtikett,
      beskrivning: "Större åtgärd — motsvarar typen av det utförda arbetet i historiken.",
    },
    {
      id: `${prefix}-lopande`,
      etikett: lopandeEtikett,
      standardIntervallAr: 10,
      beskrivning:
        "Lättare eller löpande underhåll mellan större projekt — kortare intervall och lägre kostnad.",
    },
    {
      id: `${prefix}-kontroll`,
      etikett: "Kontroll / status",
      standardIntervallAr: 3,
      beskrivning: "Inspektion utan större ingrepp.",
    },
  ];
}

const typFasad = [
  {
    id: "typ-fasad-stor",
    etikett: "Större fasadåtgärd",
    beskrivning: "Ommålning, puts eller större renovering.",
  },
  {
    id: "typ-fasad-lopande",
    etikett: "Löpande fasadunderhåll",
    standardIntervallAr: 10,
    beskrivning: "Tvätt, mindre reparationer eller målning av delar.",
  },
  {
    id: "typ-fasad-kontroll",
    etikett: "Fasadkontroll",
    standardIntervallAr: 5,
    beskrivning: "Statuskontroll.",
  },
];

const kataloger: Record<string, UnderhallAtgardKatalogPost[]> = {
  "tak-takyta": takTakytaAtgarder,
  fonster: fonsterAtgarder,
  "typ-fasad": typFasad,
  "typ-balkonger": typKatalog("typ-balkonger", "Större balkongåtgärd", "Löpande balkongunderhåll"),
  "typ-stambyte": typKatalog("typ-stambyte", "Stambyte", "Löpande rör-/stamunderhåll"),
  "typ-stamspolning": typKatalog("typ-stamspolning", "Stamspolning", "Kontroll avlopp"),
  "typ-trapphus": typKatalog("typ-trapphus", "Större trapphusåtgärd", "Ommålning trapphus"),
  "typ-hiss": typKatalog("typ-hiss", "Hissmodernisering", "Hisservice"),
  "typ-tvattstuga": typKatalog("typ-tvattstuga", "Renovering tvättstuga", "Löpande underhåll tvättstuga"),
  "typ-ventilation": typKatalog("typ-ventilation", "Ventilationsåtgärd", "OVK / service"),
  "typ-brandskydd": typKatalog("typ-brandskydd", "Brandskyddsåtgärd", "SBA / kontroll"),
  "typ-ovrigt": typKatalog("typ-ovrigt", "Större åtgärd", "Löpande underhåll"),
};

export const RENOVERING_ATGARD_TILL_UNDERKOMPONENT: Partial<
  Record<RenoveringAtgardTyp, string>
> = {
  stambyte: "stambyte",
  stamspolning: "spolning-avlopp",
  tak: "takyta",
  fonster: "fonster",
  fasad: "fasadmaterial",
  balkonger: "balkonger",
  hiss: "hiss",
  tvattstuga: "tvattstuga",
  ventilation: "ventilation",
  trapphus: "vaggar-malning",
  brandskydd: "branddorrar",
};

const TYP_TILL_UK = RENOVERING_ATGARD_TILL_UNDERKOMPONENT;

export function hamtaUnderhallTillfallenPlanNyckel(
  komponentNamn: string,
  underkomponentId: string,
): UnderhallTillfallenPlanNyckel | null {
  if (arTakKomponent(komponentNamn) && underkomponentId === "takyta") {
    return "tak-takyta";
  }
  if (underkomponentId === "fonster") {
    return "fonster";
  }
  if (underkomponentId === "fasadmaterial") {
    return null;
  }
  for (const [typ, uk] of Object.entries(TYP_TILL_UK)) {
    if (uk === underkomponentId) {
      const key = `typ-${typ}` as UnderhallTillfallenPlanNyckel;
      if (kataloger[key]) return key;
    }
  }
  return "typ-ovrigt";
}

export function hamtaUnderhallAtgardKatalog(
  planNyckel: string,
): UnderhallAtgardKatalogPost[] {
  return kataloger[planNyckel] ?? kataloger["typ-ovrigt"] ?? [];
}

export function underhallAtgardEtikett(
  planNyckel: string,
  atgardId: string,
): string {
  return (
    hamtaUnderhallAtgardKatalog(planNyckel).find((a) => a.id === atgardId)?.etikett ??
    atgardId
  );
}

export function hamtaVanligaInkluderadeUnderkomponenter(
  komponentNamn: string,
  huvudUnderkomponentId: string,
): string[] {
  if (arTakKomponent(komponentNamn) && huvudUnderkomponentId === "takyta") {
    return ["skorsten", "takterrass", "medlemstakterrass", "ventilationshuv", "takkupa"];
  }
  return [];
}
