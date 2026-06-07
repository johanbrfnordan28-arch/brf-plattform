import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import type { SigneringRoll } from "@/components/rondering/signering";

export type SigneringSchemaPunkt = {
  id: string;
  etikett: string;
  beskrivning?: string;
  /** Hopfällbar sektion, t.ex. Utvändigt / Invändigt */
  grupp?: string;
  egen?: boolean;
};

export type SigneringSchemaKonfig = {
  aktivaPunktIds: Record<SigneringRoll, string[]>;
  egnaPunkter: Record<SigneringRoll, SigneringSchemaPunkt[]>;
};

export type SigneringSchemaGrupp = {
  namn: string;
  punkter: SigneringSchemaPunkt[];
};

const SIGNERING_SCHEMA_BASE = "brf-rondering-signering-schema";

export function signeringSchemaStorageKey(): string {
  return foreningStorageKey(SIGNERING_SCHEMA_BASE);
}

/** Gamla grova moment → nya detaljer (vid uppläsning från localStorage). */
const nyaAvvattningOchStuprorIds = [
  "fs-drain-brunnar",
  "fs-drain-sno",
  "fs-drain-ytor",
  "fs-stupror-nedfra",
  "fs-stupror-fungerar",
  "fs-hangranna",
  "fs-drain-avvikelse",
] as const;

const nyaSakerhetIds = [
  "fs-tak",
  "fs-klotter",
  "fs-inbrott",
  "fs-inbrottsforsok",
  "fs-skadegorelse",
] as const;

const nyaTvattstugaIds = [
  "fs-tvatt-maskiner",
  "fs-tvatt-tork",
  "fs-tvatt-filter",
  "fs-tvatt-ventilation-fukt",
  "fs-tvatt-avlopp",
  "fs-tvatt-belysning",
  "fs-tvatt-sakerhet",
  "fs-tvatt-vatten",
] as const;

const nyaBelysningIds = ["fs-belysning-utvandigt", "fs-belysning-invandigt"] as const;

const legacyIdUtvidgning: Record<string, string[]> = {
  "fs-utvandig": [
    "fs-fasad",
    "fs-gard",
    "fs-lekplats",
    ...nyaBelysningIds,
    ...nyaAvvattningOchStuprorIds,
    "fs-parkering-garage",
    ...nyaSakerhetIds,
  ],
  "fs-sakerhet": [...nyaSakerhetIds],
  "fs-drain": [...nyaAvvattningOchStuprorIds],
  "fs-gard": ["fs-gard", "fs-lekplats"],
  "fs-balkong-fukt": ["fs-fasad"],
  "fs-fukt-stupror": ["fs-fasad"],
  "fs-uteplats": ["fs-parkering-garage"],
  "fs-trapphus": ["fs-entre", "fs-trapphus"],
  "fs-invandig": [
    "fs-entre",
    "fs-trapphus",
    ...nyaBelysningIds,
    "fs-kallare",
    "fs-tekniskt",
    "fs-utrymning",
    "fs-brand-in",
    "fs-hiss",
    "fs-ventilation",
    ...nyaTvattstugaIds,
    "fs-cykel",
    "fs-sopor",
    "fs-garage",
  ],
  "fs-brand": ["fs-utrymning", "fs-brand-in"],
  "fs-sopor": ["fs-sopor"],
  "fs-ventilation": ["fs-ventilation"],
  "fs-hiss": ["fs-hiss"],
  "fs-tvattstuga": [...nyaTvattstugaIds],
};

const grundmallFastighetsskotare: SigneringSchemaPunkt[] = [
  {
    id: "fs-fasad",
    etikett: "Fasad",
    beskrivning:
      "Fasad, fogar, balkonger, räcken och fönster. Kontrollera fukt- och blöta fläckar runt balkonger, hängrännor och stuprör — kan indikera skador invändigt. Ofta första tecken när hängränna eller stuprör är igensatt och avrinningen inte fungerar. Vintertid kan fukt vid balkong bero på att medlemmens snöröjning inte skötts. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-gard",
    etikett: "Gård",
    beskrivning:
      "Grillplatser, utemöbler, gångvägar och markytor. Staket eller mur mot angränsande fastigheter — helhet, infästning och inga uppenbara skador eller luckor. Belysning kontrolleras under Belysning utvändigt. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-lekplats",
    etikett: "Lekplats",
    beskrivning:
      "Lekutrustning, underlag och fallzoner i säkert skick — inga vassa kanter, lösa delar eller fallrisker. Området fritt från vassa föremål, glas och annat farligt skräp. Utrustningen används av barn; små barn skadas lätt vid slitage eller felanvändning. Notera om obehöriga använt lekplatsen och orsakat skador på utrustningen. Lekplatsen ska vara inhägnad enligt gällande regelverk — kontrollera staket, grind och lås. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-belysning-utvandigt",
    etikett: "Belysning utvändigt",
    beskrivning:
      "Belysning på gård, gångvägar, entréer, fasad, parkering, lekplats och övriga utomhusytor enligt avtal. Armaturer ska fungera — notera trasiga lampor, mörka zoner och felaktig styrning eller tider. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-drain-brunnar",
    etikett: "Brunnar — regnvatten avrinning",
    beskrivning:
      "Kontrollera att regnvatten försvinner. Snö, is, löv och annat kan sätta igen brunnar — enklare igensättningar rensas direkt med snöskyffel eller sopborste under ronderingen. Rapportera vad som gjorts; åtgärden ingår i besöket. Kvarstående hinder eller skador som kräver mer än enkel rensning anmäls som avvikelse.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-drain-sno",
    etikett: "Snö och is efter säsong",
    beskrivning:
      "Efter vintern: rensa kvarvarande snö och is från brunnar, rännor och avvattningsvägar. Under ronderingen ingår enklare moment — snö som lätt kan sopas bort samt enkel sandning av hala ytor — utförs direkt och rapporteras; åtgärden ingår i besöket. Omfattande snöröjning eller is som kräver mer än enkel åtgärd enligt avtal anmäls som avvikelse.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-drain-ytor",
    etikett: "Avvattning gård och gångar",
    beskrivning:
      "Inga kvarstående vattenpölar som hindrar avrinning. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-stupror-nedfra",
    etikett: "Stuprör — kontroll nerifrån",
    beskrivning:
      "Kontrollera stuprör från marknivå: inlop, fogar, plugg och synliga skador.",
    grupp: "Stuprör och hängrännor",
  },
  {
    id: "fs-stupror-fungerar",
    etikett: "Stuprör leder vatten",
    beskrivning:
      "Stuprör och ränndalar är öppna och fungerar (vatten försvinner, ej igensatta). Fuktfläckar vid fasad kontrolleras under Fasad.",
    grupp: "Stuprör och hängrännor",
  },
  {
    id: "fs-hangranna",
    etikett: "Hängrännor och anslutningar",
    beskrivning:
      "Hängrännor, skarvar och anslutning till stuprör — kontroll i nivå med mark/tillgänglig höjd. Blöta fläckar runt rännor noteras under Fasad.",
    grupp: "Stuprör och hängrännor",
  },
  {
    id: "fs-drain-avvikelse",
    etikett: "Avvikelser anmäls",
    beskrivning:
      "Alla avvikelser kring avvattning, stuprör och fukt dokumenteras och anmäls för åtgärd i portalen.",
    grupp: "Stuprör och hängrännor",
  },
  {
    id: "fs-parkering-garage",
    etikett: "Parkering och garage",
    beskrivning:
      "P-platser och uppställningsytor utvändigt — ytor och ordning. Kontrollera trafikmärken och vägmarkeringar. Belysning under Belysning utvändigt. Notera oljeläckage på mark, farligt avfall (bilbatterier m.m.), kasserade bildäck och annat skrot samt bilglas från inbrott eller krockskador. Garageport och garage invändigt se eget moment. Avvikelse anmäls för åtgärd.",
    grupp: "Utvändigt",
  },
  {
    id: "fs-tak",
    etikett: "Tak låst",
    beskrivning:
      "Takluckor och tillträde till tak är låsta enligt rutin — den kontrollen räcker här. Hängrännor/stuprör se egen sektion.",
    grupp: "Säkerhet",
  },
  {
    id: "fs-klotter",
    etikett: "Klotter",
    beskrivning:
      "Inget nytt klotter utvändigt eller i gemensamma utrymmen (fasad, entré, garage, gård). Avvikelse anmäls för åtgärd.",
    grupp: "Säkerhet",
  },
  {
    id: "fs-inbrott",
    etikett: "Inbrott",
    beskrivning:
      "Inga tecken på genomfört inbrott (brutna lås, inbrutna dörrar/fönster, stöldspår). Avvikelse anmäls omedelbart.",
    grupp: "Säkerhet",
  },
  {
    id: "fs-inbrottsforsok",
    etikett: "Inbrottsförsök",
    beskrivning:
      "Inga tecken på försök (skador vid lås, repade fönster, brutna skydd). Avvikelse anmäls för åtgärd.",
    grupp: "Säkerhet",
  },
  {
    id: "fs-skadegorelse",
    etikett: "Skadegörelse",
    beskrivning:
      "Ingen vandalism mot egendom, utrustning eller ytor utöver klotter. Avvikelse anmäls för åtgärd.",
    grupp: "Säkerhet",
  },
  {
    id: "fs-entre",
    etikett: "Entré",
    beskrivning:
      "Entredörrar och entréparti. Kontrollera tecken på inbrottsförsök. Dörrens stängning och lås ska fungera — hinder vid dörr (grus, snö m.m.) noteras för åtgärd; enkel borttagning kan göras vid rondering, städ enligt städavtal. Belysning under Belysning utvändigt/invändigt. Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
  {
    id: "fs-trapphus",
    etikett: "Trapphus",
    beskrivning:
      "Gå igenom samtliga plan: trappor, ledstång, belysning, funktion och tecken på skadegörelse. Trapphuset är utrymningsväg — inget brandfarligt material och ingen mellanförvaring av byggmaterial. Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
  {
    id: "fs-kallare",
    etikett: "Källare och förråd",
    beskrivning:
      "Källargångar, förråd och fukt/tecken på skador. Belysning kontrolleras under Belysning invändigt.",
    grupp: "Invändigt",
  },
  {
    id: "fs-tekniskt",
    etikett: "Teknikutrymmen",
    beskrivning:
      "Undercentralen kontrolleras enligt skötselanvisningen på plats. Tappar värmesystemet tryck kan det tyda på läckage — samma bedömning vid synligt vattenläckage; det kan även finnas naturliga förklaringar till tryckfall. Återkoppla till styrelsen vid avvikelser. Fylls systemet på, meddela styrelsen i en avvikelserapport för vidare åtgärder. Övrig el, värme och vatten — ordning och larm.",
    grupp: "Invändigt",
  },
  {
    id: "fs-utrymning",
    etikett: "Utrymningsvägar",
    beskrivning:
      "Utrymningsvägar fria — inga hinder i korridorer, trapphus eller vid nödutgångar. Utmärkning och skyltning kontrolleras under Brandskydd invändigt. Brandfarligt material i trapphus kontrolleras under Trapphus.",
    grupp: "Invändigt",
  },
  {
    id: "fs-brand-in",
    etikett: "Brandskydd invändigt",
    beskrivning:
      "Brandsläckare, brandpost och brandskyddsskyltning. Utrymningsvägar ska vara utmärkta och kontrolleras — skyltar, markeringar och nödutgångar synliga och korrekta. Vägarna ska vara fria (se även Utrymningsvägar). Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
  {
    id: "fs-hiss",
    etikett: "Hiss och portautomatik",
    beskrivning:
      "Hisskorg, maskinrum och portar — drift och skador. Servicedagboken kontrolleras enligt avtal — pappersdagbok på plats eller digital logg hos avtalad hissentreprenör. Städ av hisskorg enligt städavtal, inte här. Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
  {
    id: "fs-ventilation",
    etikett: "Ventilation och filter",
    beskrivning:
      "Aggregat och kanaler enligt skötselanvisning och intervall — inklusive filterbyte när det ska utföras. Missljud rapporteras. Felindikationer på display eller panel fotograferas och rapporteras för åtgärd. Avvikelse anmäls till styrelsen.",
    grupp: "Invändigt",
  },
  {
    id: "fs-tvatt-maskiner",
    etikett: "Tvättmaskiner",
    beskrivning:
      "Funktion, dörrar, lås och betalning. Synliga fel eller felkoder fotograferas och rapporteras. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-tork",
    etikett: "Torktumlare och torkskåp",
    beskrivning:
      "Drift, filter, luckor och tätning. Torkskåp — ventilation och temperatur enligt skötselanvisning. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-filter",
    etikett: "Filter och filterlådor",
    beskrivning:
      "Filter och filterlådor rengjorda enligt intervall på plats. Igensatta filter noteras och rapporteras. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-ventilation-fukt",
    etikett: "Ventilation och fukt",
    beskrivning:
      "Ventilation fungerar — inga kondens- eller mögeltecken, inga starka fukt- eller mögeldofter. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-avlopp",
    etikett: "Avlopp och golvbrunnar",
    beskrivning:
      "Golvbrunnar och avlopp utan synligt stopp eller översvämning. Vatten på golv noteras med plats. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-belysning",
    etikett: "Belysning och el",
    beskrivning:
      "Belysning och eluttag i tvättstugan fungerar (utöver allmän belysning invändigt). Trasiga armaturer eller lösa kablar rapporteras. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-sakerhet",
    etikett: "Ordning och brandsäkerhet",
    beskrivning:
      "Ordning i rummet — inget brandfarligt material, inget klotter. Ingen mellanförvaring av byggmaterial eller skrymmande föremål som hindrar utrymme. Avvikelse anmäls för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-tvatt-vatten",
    etikett: "Vatten och läckage",
    beskrivning:
      "Kranar, slangar och anslutningar utan läckage. Fukt under eller bakom maskiner noteras. Avvikelse anmäls till styrelsen för åtgärd.",
    grupp: "Tvättstuga",
  },
  {
    id: "fs-cykel",
    etikett: "Cykel- och barnvagnsrum",
    beskrivning: "Ordning, brandvägar och fastsäkring.",
    grupp: "Invändigt",
  },
  {
    id: "fs-sopor",
    etikett: "Soprum och återvinning",
    beskrivning: "Soprum, miljörum och kärl — tömning och ordning.",
    grupp: "Invändigt",
  },
  {
    id: "fs-garage",
    etikett: "Garage och port",
    beskrivning:
      "Garage invändigt om det ingår: garageport och portautomatik — funktion, skador och säker stängning. Ordning. Belysning under Belysning invändigt. Notera oljeläckage på golv eller ytor, kasserade bildäck och annat skrot. P-platser och trafikmärken utvändigt kontrolleras under Parkering och garage. Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
  {
    id: "fs-belysning-invandigt",
    etikett: "Belysning invändigt",
    beskrivning:
      "Belysning i trapphus (samtliga plan), entréer, källare, garage, teknikutrymmen, soprum, cykelrum och övriga gemensamma utrymmen enligt avtal. Armaturer ska fungera — notera trasiga lampor, blinkande ljus och nödbelysning som inte fungerar. Tvättstuga har eget moment. Avvikelse anmäls för åtgärd.",
    grupp: "Invändigt",
  },
];

const grundmallStadning: SigneringSchemaPunkt[] = [
  {
    id: "st-trapphus",
    etikett: "Trapphus — alla plan",
    beskrivning:
      "Golv på samtliga plan: först sopas, sedan våttorkas. Ledstångar, handtag och trappräcken avtorkas. Skador, ordning och brandskydd kontrolleras vid rondering, inte här.",
    grupp: "Trapphus och entré",
  },
  {
    id: "st-entre",
    etikett: "Entré och dörrar",
    beskrivning:
      "Entréparti, mattor, brevlådor och glas avtorkas. Grus och sand vid entredörrar tas bort så dörrarna fungerar. Lås och inbrott kontrolleras vid rondering (Entré).",
    grupp: "Trapphus och entré",
  },
  {
    id: "st-hiss-stad",
    etikett: "Hiss — städ",
    beskrivning:
      "Hisskorg, hissdörrar och lister rengörs om städ ingår. Grus och sand vid hissdörrar tas bort för god funktion. Servicedagbok och drift — rondering (Hiss).",
    grupp: "Trapphus och entré",
  },
  {
    id: "st-tvatt-maskiner",
    etikett: "Tvättstuga — maskiner och golv",
    beskrivning:
      "Tvätt- och torkmaskiner avtorkas. Golv sopas och våttorkas. Filter, drift och läckage kontrolleras vid rondering (Tvättstuga).",
    grupp: "Tvättstuga",
  },
  {
    id: "st-tvatt-ytor",
    etikett: "Tvättstuga — ytor",
    beskrivning:
      "Bänkar, torkskåp, väggar och fläckar på glas avtorkas. Ludd och kvarlämnat bortplockas.",
    grupp: "Tvättstuga",
  },
  {
    id: "st-soprum",
    etikett: "Soprum",
    beskrivning:
      "Golv sopas och våttorkas. Väggar och kärl rengörs — inga lösa sopor. Ventilation och lukt kontrolleras vid rondering.",
    grupp: "Gemensamma utrymmen",
  },
  {
    id: "st-miljorum",
    etikett: "Miljörum / återvinning",
    beskrivning:
      "Golv sopas och våttorkas. Miljöstation och sortering städas enligt avtal.",
    grupp: "Gemensamma utrymmen",
  },
  {
    id: "st-kallare-stad",
    etikett: "Källargångar",
    beskrivning:
      "Källar- och förrådsgångar som ingår i avtal: golv sopas och våttorkas. Fukt, skador och belysning (funktion) — rondering.",
    grupp: "Gemensamma utrymmen",
  },
  {
    id: "st-fonster",
    etikett: "Fönsterputs",
    beskrivning:
      "Fönster och glasytor putsas enligt intervall som föreningen bestämmer (t.ex. vår och höst) — inte varje månad om det inte ingår i avtalet. Markera i rapporten om puts ska utföras denna gång.",
    grupp: "Intervall enligt förening",
  },
  {
    id: "st-foreningslokal",
    etikett: "Föreningslokal / gym",
    beskrivning:
      "Lokal, gym eller bastu städas enligt avtalad frekvens. Golv sopas och våttorkas där det ingår.",
    grupp: "Övrigt enligt avtal",
  },
  {
    id: "st-garage-stad",
    etikett: "Garage — städ",
    beskrivning:
      "Garagegolv sopas och våttorkas om städ ingår. Olja, skrot och portfunktion kontrolleras vid rondering (Parkering och garage / Garage och port).",
    grupp: "Övrigt enligt avtal",
  },
];

export const signeringGrundmall: Record<SigneringRoll, SigneringSchemaPunkt[]> = {
  fastighetsskotare: grundmallFastighetsskotare,
  stadning: grundmallStadning,
};

export const signeringGruppOrdning: Record<SigneringRoll, string[]> = {
  fastighetsskotare: [
    "Utvändigt",
    "Stuprör och hängrännor",
    "Säkerhet",
    "Invändigt",
    "Tvättstuga",
    "Egna moment",
  ],
  stadning: [
    "Trapphus och entré",
    "Tvättstuga",
    "Gemensamma utrymmen",
    "Intervall enligt förening",
    "Övrigt enligt avtal",
    "Egna moment",
  ],
};

function standardAktivaIds(roll: SigneringRoll): string[] {
  return signeringGrundmall[roll].map((p) => p.id);
}

function expanderaLegacyIds(ids: string[]): string[] {
  const ut = new Set<string>();
  for (const id of ids) {
    const utvid = legacyIdUtvidgning[id];
    if (utvid) utvid.forEach((x) => ut.add(x));
    else ut.add(id);
  }
  return [...ut];
}

export function skapaTomSigneringSchemaKonfig(): SigneringSchemaKonfig {
  return {
    aktivaPunktIds: {
      fastighetsskotare: standardAktivaIds("fastighetsskotare"),
      stadning: standardAktivaIds("stadning"),
    },
    egnaPunkter: { fastighetsskotare: [], stadning: [] },
  };
}

function normaliseraKonfig(raw: unknown): SigneringSchemaKonfig {
  const tom = skapaTomSigneringSchemaKonfig();
  if (!raw || typeof raw !== "object") return tom;
  const o = raw as Record<string, unknown>;

  function lasIds(roll: SigneringRoll): string[] {
    const key = roll === "fastighetsskotare" ? "fastighetsskotare" : "stadning";
    const src = (o.aktivaPunktIds as Record<string, unknown> | undefined)?.[key];
    if (!Array.isArray(src) || src.length === 0) return standardAktivaIds(roll);
    const ids = src.filter((id): id is string => typeof id === "string");
    return expanderaLegacyIds(ids);
  }

  function lasEgna(roll: SigneringRoll): SigneringSchemaPunkt[] {
    const src = (o.egnaPunkter as Record<string, unknown> | undefined)?.[roll];
    if (!Array.isArray(src)) return [];
    return src
      .filter(
        (p): p is SigneringSchemaPunkt =>
          typeof p === "object" &&
          p != null &&
          typeof (p as SigneringSchemaPunkt).id === "string" &&
          typeof (p as SigneringSchemaPunkt).etikett === "string",
      )
      .map((p) => ({
        id: p.id.trim(),
        etikett: p.etikett.trim(),
        beskrivning: p.beskrivning?.trim() || undefined,
        grupp: p.grupp?.trim() || "Egna moment",
        egen: true,
      }))
      .filter((p) => p.etikett.length > 0);
  }

  const egnaPunkter = {
    fastighetsskotare: lasEgna("fastighetsskotare"),
    stadning: lasEgna("stadning"),
  };

  function repareraAktivaIds(roll: SigneringRoll, ids: string[]): string[] {
    const giltiga = new Set([
      ...signeringGrundmall[roll].map((p) => p.id),
      ...egnaPunkter[roll].map((p) => p.id),
    ]);
    const filtrerade = ids.filter((id) => giltiga.has(id));
    return filtrerade.length > 0 ? filtrerade : standardAktivaIds(roll);
  }

  return {
    aktivaPunktIds: {
      fastighetsskotare: repareraAktivaIds(
        "fastighetsskotare",
        lasIds("fastighetsskotare"),
      ),
      stadning: repareraAktivaIds("stadning", lasIds("stadning")),
    },
    egnaPunkter,
  };
}

export function listaSchemaPunkter(
  konfig: SigneringSchemaKonfig,
  roll: SigneringRoll,
): SigneringSchemaPunkt[] {
  return [...signeringGrundmall[roll], ...konfig.egnaPunkter[roll]];
}

export function grupperaSchemaPunkter(
  punkter: SigneringSchemaPunkt[],
  roll: SigneringRoll,
): SigneringSchemaGrupp[] {
  const ordning = signeringGruppOrdning[roll];
  const map = new Map<string, SigneringSchemaPunkt[]>();

  for (const punkt of punkter) {
    const grupp = punkt.grupp ?? "Övrigt";
    const lista = map.get(grupp) ?? [];
    lista.push(punkt);
    map.set(grupp, lista);
  }

  const sorterade: SigneringSchemaGrupp[] = [];
  for (const namn of ordning) {
    const lista = map.get(namn);
    if (lista?.length) {
      sorterade.push({ namn, punkter: lista });
      map.delete(namn);
    }
  }
  for (const [namn, lista] of map) {
    sorterade.push({ namn, punkter: lista });
  }
  return sorterade;
}

export function lasSigneringSchemaKonfig(): SigneringSchemaKonfig {
  if (typeof window === "undefined") return skapaTomSigneringSchemaKonfig();
  try {
    const raw = localStorage.getItem(signeringSchemaStorageKey());
    return raw ? normaliseraKonfig(JSON.parse(raw)) : skapaTomSigneringSchemaKonfig();
  } catch {
    return skapaTomSigneringSchemaKonfig();
  }
}

export function sparaSigneringSchemaKonfig(konfig: SigneringSchemaKonfig): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    signeringSchemaStorageKey(),
    JSON.stringify(normaliseraKonfig(konfig)),
  ).ok;
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new Event("rondering-signering-schema-uppdaterad"));
  }
  return ok;
}

export function hamtaAllaSchemaPunkter(roll: SigneringRoll): SigneringSchemaPunkt[] {
  const konfig = lasSigneringSchemaKonfig();
  return listaSchemaPunkter(konfig, roll);
}

export function hamtaAktivaSchemaPunkter(
  roll: SigneringRoll,
  foreningId?: string,
): SigneringSchemaPunkt[] {
  const konfig = foreningId
    ? lasSigneringSchemaKonfigForForening(foreningId)
    : lasSigneringSchemaKonfig();
  const alla = listaSchemaPunkter(konfig, roll);
  const aktiva = new Set(konfig.aktivaPunktIds[roll] ?? []);
  const filtrerade = alla.filter((p) => aktiva.has(p.id));
  if (filtrerade.length === 0 && alla.length > 0) {
    return alla;
  }
  return filtrerade;
}

export function skapaEgetSchemaPunktId(roll: SigneringRoll): string {
  return `egen-${roll}-${Date.now().toString(36)}`;
}

export function aterstallGrundmall(roll: SigneringRoll): SigneringSchemaKonfig {
  const konfig = lasSigneringSchemaKonfig();
  return {
    ...konfig,
    aktivaPunktIds: {
      ...konfig.aktivaPunktIds,
      [roll]: standardAktivaIds(roll),
    },
  };
}

function lasSigneringSchemaKonfigForForening(
  foreningId: string,
): SigneringSchemaKonfig {
  if (typeof window === "undefined") return skapaTomSigneringSchemaKonfig();
  try {
    const key = foreningStorageKey(SIGNERING_SCHEMA_BASE, foreningId);
    const raw = localStorage.getItem(key);
    return raw ? normaliseraKonfig(JSON.parse(raw)) : skapaTomSigneringSchemaKonfig();
  } catch {
    return skapaTomSigneringSchemaKonfig();
  }
}

function sparaSigneringSchemaKonfigForForening(
  foreningId: string,
  konfig: SigneringSchemaKonfig,
): void {
  if (typeof window === "undefined") return;
  const key = foreningStorageKey(SIGNERING_SCHEMA_BASE, foreningId);
  safeSetLocalStorage(key, JSON.stringify(normaliseraKonfig(konfig)));
}

/** Normaliserar sparad konfiguration utan att rensa egna eller avstängda punkter. */
export function migreraSigneringSchemaForForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  const key = foreningStorageKey(SIGNERING_SCHEMA_BASE, foreningId);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const konfig = normaliseraKonfig(JSON.parse(raw));
    safeSetLocalStorage(key, JSON.stringify(konfig));
  } catch {
    /* behåll rådata vid parse-fel */
  }
}

/** Lägger till nya grundmall-id:n i aktiva listan; befintliga val och egna punkter behålls. */
export function slaInNyaGrundmallPunktIdsForForening(
  foreningId: string,
  roll: SigneringRoll,
  nyaPunktIds: string[],
): void {
  if (typeof window === "undefined" || nyaPunktIds.length === 0) return;
  const key = foreningStorageKey(SIGNERING_SCHEMA_BASE, foreningId);
  const harSparat = Boolean(localStorage.getItem(key));
  const konfig = lasSigneringSchemaKonfigForForening(foreningId);
  const giltigaNya = new Set(signeringGrundmall[roll].map((p) => p.id));
  const aktiva = new Set(konfig.aktivaPunktIds[roll]);
  let andrat = false;
  for (const id of nyaPunktIds) {
    if (!giltigaNya.has(id) || aktiva.has(id)) continue;
    aktiva.add(id);
    andrat = true;
  }
  if (!andrat && harSparat) return;
  if (!harSparat && nyaPunktIds.every((id) => aktiva.has(id))) return;
  sparaSigneringSchemaKonfigForForening(foreningId, {
    ...konfig,
    aktivaPunktIds: {
      ...konfig.aktivaPunktIds,
      [roll]: [...aktiva],
    },
  });
}
