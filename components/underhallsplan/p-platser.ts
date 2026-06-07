import {
  formatSummeringTal,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** P-platser och parkeringsformer under Komplement byggnad och P-platser. */

export type PPlatsTypId =
  | "motordvarmare"
  | "elbilsladdare"
  | "p-plats"
  | "garage"
  | "carport";

export type PPlatserData = Record<PPlatsTypId, string>;

export const pPlatsTyper: {
  id: PPlatsTypId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "motordvarmare",
    etikett: "Med motorvärmare",
    beskrivning: "P-platser med eluttag för motorvärmare.",
  },
  {
    id: "elbilsladdare",
    etikett: "Med elbilsladdare",
    beskrivning: "Laddplatser för elbil — egen laddpunkt per plats.",
  },
  {
    id: "p-plats",
    etikett: "Bara P-plats",
    beskrivning: "Enkel parkeringsplats utan motorvärmare eller laddning.",
  },
  {
    id: "garage",
    etikett: "Garage",
    beskrivning: "Inomhusparkering i garage — per plats eller box.",
  },
  {
    id: "carport",
    etikett: "Carport",
    beskrivning: "Övertäckt parkering utomhus.",
  },
];

export function skapaTomPPlatserData(): PPlatserData {
  return {
    motordvarmare: "",
    elbilsladdare: "",
    "p-plats": "",
    garage: "",
    carport: "",
  };
}

export function pPlatsTypEtikett(id: PPlatsTypId): string {
  return pPlatsTyper.find((t) => t.id === id)?.etikett ?? id;
}

export function summeraPPlatser(data: PPlatserData): ListaSummeringRad[] {
  const rader: ListaSummeringRad[] = [];
  for (const typ of pPlatsTyper) {
    const v = data[typ.id].trim();
    if (!v) continue;
    const n = parseNummerSumma([v]);
    rader.push({
      etikett: typ.etikett,
      varde: n > 0 ? `${formatSummeringTal(n, 0)} st` : `${v} st`,
    });
  }
  const totalt = parseNummerSumma(pPlatsTyper.map((t) => data[t.id]));
  if (totalt > 0) {
    rader.push({
      etikett: "Totalt antal platser",
      varde: `${formatSummeringTal(totalt, 0)} st`,
    });
  }
  return rader;
}

export function formateraPPlatser(data: PPlatserData): string {
  const delar: string[] = [];
  for (const typ of pPlatsTyper) {
    const v = data[typ.id].trim();
    if (v) delar.push(`${typ.etikett} ${v} st`);
  }
  return delar.join(", ");
}
