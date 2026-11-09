import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** Värme under VVS — en grundmall per värmestam. Stammarna kan skilja sig åt. */

export const VVS_VARME_UNDERKOMPONENT_ID = "varme";

/** Vanligast är 1 element. Ibland sitter 2 eller 3 vid samma placering. */
export type VarmeElementAntalId = "1" | "2" | "3" | "annat";

export const varmeElementAlternativ: {
  id: VarmeElementAntalId;
  etikett: string;
  antal: number | null;
}[] = [
  { id: "1", etikett: "1 element (vanligast)", antal: 1 },
  { id: "2", etikett: "2 element", antal: 2 },
  { id: "3", etikett: "3 element", antal: 3 },
  { id: "annat", etikett: "Eget antal", antal: null },
];

export type VarmeRadiatorStorlekId =
  | "typ-11"
  | "typ-21"
  | "typ-22"
  | "typ-33"
  | "sektion"
  | "annat";

export const varmeRadiatorStorlekar: {
  id: VarmeRadiatorStorlekId;
  etikett: string;
}[] = [
  { id: "typ-11", etikett: "Panel typ 11" },
  { id: "typ-21", etikett: "Panel typ 21" },
  { id: "typ-22", etikett: "Panel typ 22" },
  { id: "typ-33", etikett: "Panel typ 33" },
  { id: "sektion", etikett: "Sektionsradiator" },
  { id: "annat", etikett: "Egen storlek" },
];

/** Avstånd från stammen till elementet. Eget avstånd anges i meter. */
export type VarmeAvstandId = "1" | "2" | "3" | "4" | "6" | "annat";

export const varmeAvstandAlternativ: {
  id: VarmeAvstandId;
  etikett: string;
  meter: number | null;
}[] = [
  { id: "1", etikett: "1 m från stammen", meter: 1 },
  { id: "2", etikett: "2 m från stammen", meter: 2 },
  { id: "3", etikett: "3 m från stammen", meter: 3 },
  { id: "4", etikett: "4 m från stammen", meter: 4 },
  { id: "6", etikett: "6 m från stammen", meter: 6 },
  { id: "annat", etikett: "Eget avstånd", meter: null },
];

export type VarmeRorDimensionId =
  | "dn10"
  | "dn15"
  | "dn20"
  | "dn25"
  | "dn32"
  | "cu12"
  | "cu15"
  | "cu18"
  | "annat";

export const varmeRorDimensioner: {
  id: VarmeRorDimensionId;
  etikett: string;
}[] = [
  { id: "dn10", etikett: "DN10" },
  { id: "dn15", etikett: "DN15" },
  { id: "dn20", etikett: "DN20" },
  { id: "dn25", etikett: "DN25" },
  { id: "dn32", etikett: "DN32" },
  { id: "cu12", etikett: "12 mm" },
  { id: "cu15", etikett: "15 mm" },
  { id: "cu18", etikett: "18 mm" },
  { id: "annat", etikett: "Annan dimension" },
];

/**
 * Radiatorer som är lika: samma storlek, samma antal element
 * och samma avstånd från stammen.
 */
export type VarmeRadiatorGrupp = {
  id: string;
  /** Hur många placeringar med just den här kombinationen. */
  antalPlaceringar: string;
  elementAntal: VarmeElementAntalId;
  elementAnnan: string;
  storlek: VarmeRadiatorStorlekId;
  storlekAnnan: string;
  avstand: VarmeAvstandId;
  /** Meter, när avstånd är eget. */
  avstandAnnan: string;
  /** Dimension på röret mellan stam och element. */
  rordimension: VarmeRorDimensionId;
  rordimensionAnnan: string;
};

export type VvsVarmeStam = {
  id: string;
  /** Namn stammen har i källaren, t.ex. Stam 1. */
  namn: string;
  /** Hur stammen är märkt i källaren. */
  markningKallare: string;
  /** Adress där stammen går upp. */
  adress: string;
  /** Rum eller lägenhetstyp stammen betjänar, t.ex. vardagsrum, 3 rum och kök. */
  betjanar: string;
  /** Antal våningar stammen går genom. */
  vaningar: string;
  /** Storlek på rummen stammen betjänar. */
  rumStorlek: string;
  /** Äldre enkelt antal. Används bara om inga radiatorgrupper finns. */
  radiatorAntal: string;
  /** Dimension på stamledningen som går upp i huset. */
  stamRordimension: VarmeRorDimensionId | "";
  stamRordimensionAnnan: string;
  radiatorGrupper: VarmeRadiatorGrupp[];
};

export function skapaVvsVarmeStamId(): string {
  return `vvs-varme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaVarmeRadiatorGruppId(): string {
  return `varme-rad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomVarmeRadiatorGrupp(): VarmeRadiatorGrupp {
  return {
    id: skapaVarmeRadiatorGruppId(),
    antalPlaceringar: "1",
    elementAntal: "1",
    elementAnnan: "",
    storlek: "typ-22",
    storlekAnnan: "",
    avstand: "2",
    avstandAnnan: "",
    rordimension: "dn15",
    rordimensionAnnan: "",
  };
}

export function skapaTomVvsVarmeStam(namn = ""): VvsVarmeStam {
  return {
    id: skapaVvsVarmeStamId(),
    namn,
    markningKallare: "",
    adress: "",
    betjanar: "",
    vaningar: "",
    rumStorlek: "",
    radiatorAntal: "",
    stamRordimension: "",
    stamRordimensionAnnan: "",
    radiatorGrupper: [],
  };
}

function arElementAntal(v: unknown): v is VarmeElementAntalId {
  return v === "1" || v === "2" || v === "3" || v === "annat";
}

function arStorlek(v: unknown): v is VarmeRadiatorStorlekId {
  return varmeRadiatorStorlekar.some((s) => s.id === v);
}

function arAvstand(v: unknown): v is VarmeAvstandId {
  return varmeAvstandAlternativ.some((a) => a.id === v);
}

function arRorDimension(v: unknown): v is VarmeRorDimensionId {
  return varmeRorDimensioner.some((d) => d.id === v);
}

export function normaliseraVarmeRadiatorGrupp(
  raw: Partial<VarmeRadiatorGrupp> & { id?: string },
  index = 0,
): VarmeRadiatorGrupp {
  const elementAntal = arElementAntal(raw.elementAntal) ? raw.elementAntal : "1";
  const storlek = arStorlek(raw.storlek) ? raw.storlek : "typ-22";
  const avstand = arAvstand(raw.avstand) ? raw.avstand : "2";
  const rordimension = arRorDimension(raw.rordimension) ? raw.rordimension : "dn15";
  return {
    id: raw.id?.trim() || `varme-rad-${index + 1}`,
    antalPlaceringar: raw.antalPlaceringar?.trim() ?? "",
    elementAntal,
    elementAnnan: elementAntal === "annat" ? raw.elementAnnan?.trim() ?? "" : "",
    storlek,
    storlekAnnan: storlek === "annat" ? raw.storlekAnnan?.trim() ?? "" : "",
    avstand,
    avstandAnnan: avstand === "annat" ? raw.avstandAnnan?.trim() ?? "" : "",
    rordimension,
    rordimensionAnnan:
      rordimension === "annat" ? raw.rordimensionAnnan?.trim() ?? "" : "",
  };
}

export function normaliseraVvsVarmeStam(
  raw: Partial<VvsVarmeStam> & { id?: string },
  index = 0,
): VvsVarmeStam {
  return {
    id: raw.id?.trim() || `vvs-varme-${index + 1}`,
    namn: raw.namn?.trim() ?? "",
    markningKallare: raw.markningKallare?.trim() ?? "",
    adress: raw.adress?.trim() ?? "",
    betjanar: raw.betjanar?.trim() ?? "",
    vaningar: raw.vaningar?.trim() ?? "",
    rumStorlek: raw.rumStorlek?.trim() ?? "",
    radiatorAntal: raw.radiatorAntal?.trim() ?? "",
    stamRordimension: arRorDimension(raw.stamRordimension)
      ? raw.stamRordimension
      : "",
    stamRordimensionAnnan:
      raw.stamRordimension === "annat"
        ? raw.stamRordimensionAnnan?.trim() ?? ""
        : "",
    radiatorGrupper: Array.isArray(raw.radiatorGrupper)
      ? raw.radiatorGrupper
          .filter((grupp) => Boolean(grupp) && typeof grupp === "object")
          .map((grupp, gruppIndex) =>
            normaliseraVarmeRadiatorGrupp(
              grupp as Partial<VarmeRadiatorGrupp>,
              gruppIndex,
            ),
          )
      : [],
  };
}

export function varmeElementPerPlacering(grupp: VarmeRadiatorGrupp): number {
  const preset = varmeElementAlternativ.find((a) => a.id === grupp.elementAntal);
  if (preset?.antal) return preset.antal;
  const n = Math.floor(parseNummerSumma([grupp.elementAnnan]));
  return n > 0 ? n : 0;
}

export function varmePlaceringar(grupp: VarmeRadiatorGrupp): number {
  const n = Math.floor(parseNummerSumma([grupp.antalPlaceringar]));
  return n > 0 ? n : 0;
}

export function varmeGruppElement(grupp: VarmeRadiatorGrupp): number {
  return varmePlaceringar(grupp) * varmeElementPerPlacering(grupp);
}

export function varmeAvstandMeter(grupp: VarmeRadiatorGrupp): number {
  const preset = varmeAvstandAlternativ.find((a) => a.id === grupp.avstand);
  if (preset?.meter) return preset.meter;
  return parseNummerSumma([grupp.avstandAnnan]);
}

/** Tillopp och retur från stammen ut till elementen. */
export function varmeGruppRorMeter(grupp: VarmeRadiatorGrupp): number {
  const meter = varmeAvstandMeter(grupp);
  const element = varmeGruppElement(grupp);
  if (meter <= 0 || element <= 0) return 0;
  return meter * element * 2;
}

export function varmeStorlekEtikett(grupp: VarmeRadiatorGrupp): string {
  if (grupp.storlek === "annat") return grupp.storlekAnnan.trim() || "Egen storlek";
  return (
    varmeRadiatorStorlekar.find((s) => s.id === grupp.storlek)?.etikett ??
    grupp.storlek
  );
}

export function varmeRorEtikett(
  id: VarmeRorDimensionId | "",
  annan: string,
): string {
  if (!id) return "";
  if (id === "annat") return annan.trim() || "Annan dimension";
  return varmeRorDimensioner.find((d) => d.id === id)?.etikett ?? id;
}

export function varmeStamElement(stam: VvsVarmeStam): number {
  return stam.radiatorGrupper.reduce((sum, grupp) => sum + varmeGruppElement(grupp), 0);
}

export function normaliseraVvsVarmeStammar(raw: unknown): VvsVarmeStam[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((post, index) =>
    normaliseraVvsVarmeStam(post as Partial<VvsVarmeStam>, index),
  );
}

export function formateraVvsVarmeStam(post: VvsVarmeStam): string {
  const p = normaliseraVvsVarmeStam(post);
  const rubrik = p.namn || "Värmestam";
  const delar: string[] = [];
  if (p.markningKallare) delar.push(`märkt «${p.markningKallare}» i källaren`);
  if (p.adress) delar.push(p.adress);
  if (p.betjanar) delar.push(p.betjanar);
  if (p.vaningar) delar.push(`${p.vaningar} våningar`);
  if (p.rumStorlek) delar.push(`rum ${p.rumStorlek}`);
  const stamDimension = varmeRorEtikett(
    p.stamRordimension,
    p.stamRordimensionAnnan,
  );
  if (stamDimension) delar.push(`stam ${stamDimension}`);
  const element = varmeStamElement(p);
  if (element > 0) delar.push(`${element} element`);
  else if (p.radiatorAntal) delar.push(`${p.radiatorAntal} radiatorer`);
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVvsVarmeStammar(poster: VvsVarmeStam[]): ListaSummeringRad[] {
  const rader = poster.map((p) => normaliseraVvsVarmeStam(p));
  if (rader.length === 0) return [];

  const summering: ListaSummeringRad[] = [
    { etikett: "Antal värmestammar", varde: `${rader.length} st` },
  ];

  const grupper = rader.flatMap((stam) => stam.radiatorGrupper);
  const elementFranGrupper = grupper.reduce(
    (sum, grupp) => sum + varmeGruppElement(grupp),
    0,
  );
  const radiatorer = parseNummerSumma(rader.map((p) => p.radiatorAntal));
  const elementTotalt =
    elementFranGrupper > 0 ? elementFranGrupper : radiatorer;
  if (elementTotalt > 0) {
    summering.push({
      etikett: "Element totalt",
      varde: `${formatSummeringTal(elementTotalt, 0)} st`,
    });
  }

  for (const storlek of varmeRadiatorStorlekar) {
    const antal = grupper
      .filter((grupp) => grupp.storlek === storlek.id && storlek.id !== "annat")
      .reduce((sum, grupp) => sum + varmeGruppElement(grupp), 0);
    if (antal > 0) {
      summering.push({
        etikett: storlek.etikett,
        varde: `${formatSummeringTal(antal, 0)} st`,
      });
    }
  }
  const egnaStorlekar = new Map<string, number>();
  for (const grupp of grupper) {
    if (grupp.storlek !== "annat") continue;
    const etikett = varmeStorlekEtikett(grupp);
    egnaStorlekar.set(
      etikett,
      (egnaStorlekar.get(etikett) ?? 0) + varmeGruppElement(grupp),
    );
  }
  for (const [etikett, antal] of egnaStorlekar) {
    if (antal > 0) {
      summering.push({
        etikett,
        varde: `${formatSummeringTal(antal, 0)} st`,
      });
    }
  }

  for (const element of varmeElementAlternativ) {
    const match = grupper.filter((grupp) => grupp.elementAntal === element.id);
    const antal = match.reduce((sum, grupp) => sum + varmeGruppElement(grupp), 0);
    if (antal <= 0) continue;
    const placeringar = match.reduce(
      (sum, grupp) => sum + varmePlaceringar(grupp),
      0,
    );
    summering.push({
      etikett: element.etikett,
      varde: `${formatSummeringTal(placeringar, 0)} placeringar · ${formatSummeringTal(antal, 0)} element`,
    });
  }

  const perAvstand = new Map<string, number>();
  for (const grupp of grupper) {
    const antal = varmeGruppElement(grupp);
    if (antal <= 0) continue;
    const meter = varmeAvstandMeter(grupp);
    const etikett =
      meter > 0
        ? `${formatSummeringTal(meter)} m från stammen`
        : "Avstånd ej angivet";
    perAvstand.set(etikett, (perAvstand.get(etikett) ?? 0) + antal);
  }
  for (const [etikett, antal] of perAvstand) {
    summering.push({
      etikett,
      varde: `${formatSummeringTal(antal, 0)} element`,
    });
  }

  const rorPerDimension = new Map<string, { element: number; meter: number }>();
  for (const grupp of grupper) {
    const etikett = varmeRorEtikett(grupp.rordimension, grupp.rordimensionAnnan);
    if (!etikett) continue;
    const aktuell = rorPerDimension.get(etikett) ?? { element: 0, meter: 0 };
    aktuell.element += varmeGruppElement(grupp);
    aktuell.meter += varmeGruppRorMeter(grupp);
    rorPerDimension.set(etikett, aktuell);
  }
  for (const [etikett, tal] of rorPerDimension) {
    if (tal.element <= 0 && tal.meter <= 0) continue;
    const delar = [`${formatSummeringTal(tal.element, 0)} element`];
    if (tal.meter > 0) {
      delar.push(`${formatSummeringTal(tal.meter)} m tillopp + retur`);
    }
    summering.push({
      etikett: `Anslutningsrör ${etikett}`,
      varde: delar.join(", "),
    });
  }

  const stamPerDimension = new Map<string, number>();
  for (const stam of rader) {
    const etikett = varmeRorEtikett(
      stam.stamRordimension,
      stam.stamRordimensionAnnan,
    );
    if (!etikett) continue;
    stamPerDimension.set(etikett, (stamPerDimension.get(etikett) ?? 0) + 1);
  }
  for (const [etikett, antal] of stamPerDimension) {
    summering.push({
      etikett: `Stamledning ${etikett}`,
      varde: `${antal} st`,
    });
  }

  return summering;
}

export function formateraVvsVarmeStammar(poster: VvsVarmeStam[]): string {
  const texter = poster
    .map(formateraVvsVarmeStam)
    .filter((t) => t && t !== "Värmestam");
  const summering = formateraSummeringRader(summeraVvsVarmeStammar(poster));
  if (texter.length > 0 && summering) return `${texter.join(" · ")}. ${summering}`;
  if (texter.length > 0) return texter.join(" · ");
  return summering;
}
