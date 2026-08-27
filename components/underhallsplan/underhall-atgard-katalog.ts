/** Åtgärdskataloger för underhållstillfällen (tak, fönster m.fl.). */

import type { RenoveringAtgardTyp } from "@/components/underhallsplan/renovering-klassificering";

export type UnderhallAtgardKatalogPost = {
  id: string;
  etikett: string;
  beskrivning: string;
};

export type UnderhallTillfallenPlanNyckel =
  | "tak-takyta"
  | "fonster"
  | `typ-${RenoveringAtgardTyp}`;

const takTakytaAtgarder: UnderhallAtgardKatalogPost[] = [
  {
    id: "takomlaggning",
    etikett: "Takomläggning / nytt tak",
    beskrivning:
      "Byte av takbeläggning eller större ingrepp — ofta vart 25–40:e år beroende på material.",
  },
  {
    id: "takmalning",
    etikett: "Takmålning / ytaunderhåll",
    beskrivning:
      "Målning eller ytbehandling av plåt/taktäckning — enklare åtgärd mellan större takprojekt.",
  },
  {
    id: "plat-underhall",
    etikett: "Underhåll plåtdetaljer",
    beskrivning:
      "Kontroll och lagning av plåt, nock, vindskivor och genomföringar.",
  },
  {
    id: "tak-kontroll",
    etikett: "Takinspektion / kontroll",
    beskrivning: "Statuskontroll utan större ingrepp — kan planeras oftare.",
  },
];

const fonsterAtgarder: UnderhallAtgardKatalogPost[] = [
  {
    id: "fonster-malning",
    etikett: "Målning fönster",
    beskrivning:
      "Ommålning av karmar och bågar — enklare åtgärd mellan större renoveringar.",
  },
  {
    id: "fonster-delrenovering",
    etikett: "Delrenovering fönster",
    beskrivning:
      "Byte av glas, beslag eller delar — mer omfattande än målning men mindre än fullt byte.",
  },
  {
    id: "fonster-byte",
    etikett: "Fönsterbyte",
    beskrivning:
      "Helt byte av fönster — ofta vart 30–50:e år beroende på material och skick.",
  },
  {
    id: "fonster-tatning",
    etikett: "Tätning / fogning",
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
      beskrivning:
        "Lättare eller löpande underhåll mellan större projekt — kortare intervall och lägre kostnad.",
    },
    {
      id: `${prefix}-kontroll`,
      etikett: "Kontroll / status",
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
    beskrivning: "Tvätt, mindre reparationer eller målning av delar.",
  },
  {
    id: "typ-fasad-kontroll",
    etikett: "Fasadkontroll",
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
  if (komponentNamn === "Tak" && underkomponentId === "takyta") {
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
  if (komponentNamn === "Tak" && huvudUnderkomponentId === "takyta") {
    return ["skorsten", "takterrass", "medlemstakterrass", "ventilationshuv", "takkupa"];
  }
  return [];
}
