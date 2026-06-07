export type GrunduppgiftAlternativ = {
  id: string;
  etikett: string;
  /** Kortare etikett i komponentregistret (chips). */
  kortEtikett?: string;
  beskrivning?: string;
};

export const GRUNDUPPGIFTER_ANNAT_ID = "annat";

/** Legacy-id i sparad komponentdata → nuvarande OVK-id. */
export const LEGACY_VENTILATION_DELTYP_ID: Record<string, string> = {
  m1: "f",
  m2: "f",
  sjalvdrag: "s",
};

/**
 * Ventilationstyper enligt Boverkets OVK-klassificering (S, F, FX, FT, FTX).
 * F (frånluftsfläkt + fönsterventiler) är vanligast i svenska flerbostadshus.
 */
export const ventilationssystemAlternativ: GrunduppgiftAlternativ[] = [
  {
    id: "f",
    etikett: "F — frånluftsfläkt och fönsterventiler (vanligast)",
    kortEtikett: "F — frånluftsfläkt + fönsterventiler",
    beskrivning:
      "Vanligast i flerbostadshus från 1960–1990-tal. Frånluftsfläkt suger ut luft från badrum och kök. Tilluft tas in passivt via fönsterventiler och väggventiler — ingen tilluftsfläkt. OVK-klass F (inte samma sak som rent självdrag). OVK vart 6:e år.",
  },
  {
    id: "s",
    etikett: "S — självdragsventilation",
    kortEtikett: "S — självdrag",
    beskrivning:
      "Helt utan fläktar. Luften rör sig via temperaturskillnader, skorsten och ventiler — både till- och frånluft sker utan mekanisk hjälp. OVK vart 6:e år i flerbostadshus.",
  },
  {
    id: "fx",
    etikett: "FX — frånluftsfläkt med värmeåtervinning",
    kortEtikett: "FX — frånluft + värmeåtervinning",
    beskrivning:
      "Frånluftsfläkt med värmeåtervinning (t.ex. frånluftsvärmepump). Tilluft tas fortfarande in via fönsterventiler och otätheter — ingen separat tilluftsfläkt. OVK vart 6:e år.",
  },
  {
    id: "ft",
    etikett: "FT — mekanisk till- och frånluft",
    kortEtikett: "FT — till- och frånluft",
    beskrivning:
      "Både tilluft och frånluft drivs med fläktar via kanaler — tilluft till sovrum och vardagsrum, frånluft från badrum och kök. OVK vart 3:e år i flerbostadshus.",
  },
  {
    id: "ftx",
    etikett: "FTX — till- och frånluft med värmeåtervinning",
    kortEtikett: "FTX — till-/frånluft + värmeåtervinning",
    beskrivning:
      "Två fläktar och kanaler. Värmeväxlare återvinner värme från frånluften till inkommande uteluft. Vanligt i nyare och renoverade hus. OVK vart 3:e år.",
  },
  {
    id: GRUNDUPPGIFTER_ANNAT_ID,
    etikett: "Annat system…",
  },
];

export const uppvarmningAlternativ: GrunduppgiftAlternativ[] = [
  {
    id: "fjarrvarme",
    etikett: "Fjärrvärme",
    beskrivning: "Värme från kommunalt eller regionalt fjärrvärmenät.",
  },
  {
    id: "bergvarme",
    etikett: "Bergvärme (värmepump)",
    beskrivning: "Borrade eller ytnära slingor med värmepump.",
  },
  {
    id: "luftvarmepump",
    etikett: "Luftvärmepump (central)",
    beskrivning: "Central värmepump som tar energi från utomhusluft.",
  },
  {
    id: "pellets",
    etikett: "Pellets / vedpanna",
    beskrivning: "Bioenergi i egen pannanläggning.",
  },
  {
    id: "olja",
    etikett: "Oljepanna",
    beskrivning: "Eldningsolja i central pannanläggning.",
  },
  {
    id: "gas",
    etikett: "Gas",
    beskrivning: "Naturgas eller biogas i central pannanläggning.",
  },
  {
    id: "el",
    etikett: "El (direktverkande)",
    beskrivning: "Elradiatorer eller elpatroner utan värmepump.",
  },
  {
    id: "sol-fjarrvarme",
    etikett: "Solvärme i kombination med fjärrvärme",
    beskrivning: "Solceller eller solfångare som kompletterar fjärrvärme.",
  },
  {
    id: GRUNDUPPGIFTER_ANNAT_ID,
    etikett: "Annat system…",
  },
];

export type VentilationDeltypDefinition = {
  id: string;
  etikett: string;
  beskrivning?: string;
};

/** Deltyper för komponentregistret — samma som grunduppgifter (utan «Annat»). */
export function ventilationDeltyperForRegister(): VentilationDeltypDefinition[] {
  return ventilationssystemAlternativ
    .filter((alt) => alt.id !== GRUNDUPPGIFTER_ANNAT_ID)
    .map((alt) => ({
      id: alt.id,
      etikett: alt.kortEtikett ?? alt.etikett,
      beskrivning: alt.beskrivning,
    }));
}

export function synkaLegacyVentilationDeltypId(id: string): string {
  return LEGACY_VENTILATION_DELTYP_ID[id] ?? id;
}

export function synkaLegacyVentilationDeltyper(ids: string[]): string[] {
  const mappade = ids.map(synkaLegacyVentilationDeltypId);
  return [...new Set(mappade)];
}

function matchAlternativ(
  value: string,
  alternativ: GrunduppgiftAlternativ[],
): GrunduppgiftAlternativ | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const exakt = alternativ.find(
    (alt) => alt.id === trimmed || alt.etikett === trimmed,
  );
  if (exakt) return exakt;

  const lower = trimmed.toLowerCase();
  const nyckelord: Record<string, string[]> = {
    ftx: ["ftx", "ftx-ventilation", "balanserad ventilation med värme"],
    ft: ["ft-ventilation", " ft ", "mekanisk till- och frånluft", "m3"],
    fx: ["fx-ventilation", " fx ", "frånluftsvärmepump", "fvp"],
    f: [
      "f-ventilation",
      "mekanisk frånluft",
      "frånluftsfläkt",
      "franluftsflakt",
      "fönsterventil",
      "fonsterventil",
      "m1",
      "m2",
    ],
    s: ["s-ventilation", "självdragsventilation"],
  };

  for (const alt of alternativ) {
    if (alt.id === GRUNDUPPGIFTER_ANNAT_ID) continue;
    const ord = nyckelord[alt.id] ?? [alt.etikett.toLowerCase()];
    if (ord.some((nyckel) => lower.includes(nyckel))) return alt;
  }

  if (lower.includes("självdrag") || lower.includes("sjalvdrag")) {
    return alternativ.find((alt) => alt.id === "s") ?? null;
  }

  return null;
}

export function grunduppgiftValId(
  value: string,
  alternativ: GrunduppgiftAlternativ[],
): string {
  if (!value.trim()) return "";
  const match = matchAlternativ(value, alternativ);
  return match?.id ?? GRUNDUPPGIFTER_ANNAT_ID;
}

export function grunduppgiftAnnanText(
  value: string,
  alternativ: GrunduppgiftAlternativ[],
): string {
  if (!value.trim()) return "";
  const match = matchAlternativ(value, alternativ);
  return match ? "" : value.trim();
}

export function grunduppgiftFranVal(
  valId: string,
  annanText: string,
  alternativ: GrunduppgiftAlternativ[],
): string {
  if (!valId) return "";
  if (valId === GRUNDUPPGIFTER_ANNAT_ID) return annanText.trim();
  return alternativ.find((alt) => alt.id === valId)?.etikett ?? annanText.trim();
}

/** OVK-intervall i flerbostadshus enligt ventilationstyp (år). */
export function ovkIntervallArForVentilation(ventilationssystem: string): 3 | 6 | null {
  const id = grunduppgiftValId(ventilationssystem, ventilationssystemAlternativ);
  if (id === "ft" || id === "ftx") return 3;
  if (id === "s" || id === "f" || id === "fx") return 6;
  return null;
}
