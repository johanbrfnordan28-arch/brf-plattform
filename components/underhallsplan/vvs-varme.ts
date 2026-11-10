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
  | "mm22"
  | "mm28"
  | "mm30"
  | "mm35"
  | "mm40"
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
  { id: "mm22", etikett: "22 mm" },
  { id: "mm28", etikett: "28 mm" },
  { id: "mm30", etikett: "30 mm" },
  { id: "mm35", etikett: "35 mm" },
  { id: "mm40", etikett: "40 mm" },
  { id: "annat", etikett: "Annan dimension" },
];

/** Takhöjd i rummen stammen går genom. */
export type VarmeTakhojdId =
  | "2.4"
  | "2.5"
  | "2.6"
  | "2.7"
  | "2.8"
  | "3.0"
  | "annat";

export const varmeTakhojdAlternativ: {
  id: VarmeTakhojdId;
  etikett: string;
  meter: number | null;
}[] = [
  { id: "2.4", etikett: "2,4 m", meter: 2.4 },
  { id: "2.5", etikett: "2,5 m", meter: 2.5 },
  { id: "2.6", etikett: "2,6 m", meter: 2.6 },
  { id: "2.7", etikett: "2,7 m", meter: 2.7 },
  { id: "2.8", etikett: "2,8 m", meter: 2.8 },
  { id: "3.0", etikett: "3,0 m", meter: 3.0 },
  { id: "annat", etikett: "Egen takhöjd", meter: null },
];

/** Bjälklagets tjocklek mellan våningarna. */
export type VarmeBjalklagId =
  | "0.2"
  | "0.3"
  | "0.4"
  | "0.5"
  | "0.6"
  | "annat";

export const varmeBjalklagAlternativ: {
  id: VarmeBjalklagId;
  etikett: string;
  meter: number | null;
}[] = [
  { id: "0.2", etikett: "0,2 m", meter: 0.2 },
  { id: "0.3", etikett: "0,3 m", meter: 0.3 },
  { id: "0.4", etikett: "0,4 m", meter: 0.4 },
  { id: "0.5", etikett: "0,5 m", meter: 0.5 },
  { id: "0.6", etikett: "0,6 m", meter: 0.6 },
  { id: "annat", etikett: "Egen tjocklek", meter: null },
];

export const varmeVaningarAlternativ: {
  id: string;
  etikett: string;
}[] = [
  { id: "3", etikett: "3 våningar" },
  { id: "4", etikett: "4 våningar" },
  { id: "5", etikett: "5 våningar" },
  { id: "6", etikett: "6 våningar" },
  { id: "7", etikett: "7 våningar" },
  { id: "8", etikett: "8 våningar" },
  { id: "9", etikett: "9 våningar" },
  { id: "10", etikett: "10 våningar" },
  { id: "11", etikett: "11 våningar" },
  { id: "12", etikett: "12 våningar" },
  { id: "annat", etikett: "Eget antal" },
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
  /** Namn styrelsen ger stammen, t.ex. Stam 1. */
  namn: string;
  /** Hur stammen är märkt i källaren. */
  markningKallare: string;
  /** Adress / trapphus där stammen går upp. */
  adress: string;
  /** Rum eller lägenhetstyp stammen betjänar, t.ex. vardagsrum, 3 rum och kök. */
  betjanar: string;
  /** Antal våningar stammen går genom. */
  vaningar: string;
  /** Takhöjd per våning. */
  takhojd: VarmeTakhojdId | "";
  takhojdAnnan: string;
  /** Bjälklagets tjocklek mellan våningarna. */
  bjalklag: VarmeBjalklagId | "";
  bjalklagAnnan: string;
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
    takhojd: "2.6",
    takhojdAnnan: "",
    bjalklag: "0.4",
    bjalklagAnnan: "",
    rumStorlek: "",
    radiatorAntal: "",
    stamRordimension: "mm30",
    stamRordimensionAnnan: "",
    radiatorGrupper: [],
  };
}

function arTakhojd(v: unknown): v is VarmeTakhojdId {
  return varmeTakhojdAlternativ.some((a) => a.id === v);
}

function arBjalklag(v: unknown): v is VarmeBjalklagId {
  return varmeBjalklagAlternativ.some((a) => a.id === v);
}

export function varmeTakhojdMeter(stam: Pick<VvsVarmeStam, "takhojd" | "takhojdAnnan">): number {
  const preset = varmeTakhojdAlternativ.find((a) => a.id === stam.takhojd);
  if (preset?.meter) return preset.meter;
  return parseNummerSumma([stam.takhojdAnnan]);
}

export function varmeBjalklagMeter(
  stam: Pick<VvsVarmeStam, "bjalklag" | "bjalklagAnnan">,
): number {
  const preset = varmeBjalklagAlternativ.find((a) => a.id === stam.bjalklag);
  if (preset?.meter) return preset.meter;
  return parseNummerSumma([stam.bjalklagAnnan]);
}

export function varmeVaningarAntal(stam: Pick<VvsVarmeStam, "vaningar">): number {
  const n = Math.floor(parseNummerSumma([stam.vaningar]));
  return n > 0 ? n : 0;
}

/**
 * Total stamhöjd: våningar × takhöjd + (våningar − 1) × bjälklag.
 * Exempel: 9 × 2,6 m + 8 × 0,4 m = 26,6 m.
 */
export function varmeStamVertikalMeter(stam: VvsVarmeStam): number {
  const vaningar = varmeVaningarAntal(stam);
  const tak = varmeTakhojdMeter(stam);
  const bjalk = varmeBjalklagMeter(stam);
  if (vaningar <= 0 || tak <= 0) return 0;
  return vaningar * tak + Math.max(0, vaningar - 1) * bjalk;
}

export function formateraVarmeStamHojd(stam: VvsVarmeStam): string {
  const vaningar = varmeVaningarAntal(stam);
  const tak = varmeTakhojdMeter(stam);
  const bjalk = varmeBjalklagMeter(stam);
  const total = varmeStamVertikalMeter(stam);
  if (total <= 0) return "";
  const bjalkDel =
    vaningar > 1 && bjalk > 0
      ? ` + ${vaningar - 1} × ${formatSummeringTal(bjalk)} m bjälklag`
      : "";
  return `${formatSummeringTal(total)} m (${vaningar} × ${formatSummeringTal(tak)} m takhöjd${bjalkDel})`;
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
  const takhojd = arTakhojd(raw.takhojd) ? raw.takhojd : "";
  const bjalklag = arBjalklag(raw.bjalklag) ? raw.bjalklag : "";
  return {
    id: raw.id?.trim() || `vvs-varme-${index + 1}`,
    namn: raw.namn?.trim() ?? "",
    markningKallare: raw.markningKallare?.trim() ?? "",
    adress: raw.adress?.trim() ?? "",
    betjanar: raw.betjanar?.trim() ?? "",
    vaningar: raw.vaningar?.trim() ?? "",
    takhojd,
    takhojdAnnan: takhojd === "annat" ? raw.takhojdAnnan?.trim() ?? "" : "",
    bjalklag,
    bjalklagAnnan: bjalklag === "annat" ? raw.bjalklagAnnan?.trim() ?? "" : "",
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
  const hojd = formateraVarmeStamHojd(p);
  if (hojd) delar.push(`höjd ${hojd}`);
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

  const vertikalTotalt = rader.reduce(
    (sum, stam) => sum + varmeStamVertikalMeter(stam),
    0,
  );
  if (vertikalTotalt > 0) {
    summering.push({
      etikett: "Stamhöjd totalt",
      varde: `${formatSummeringTal(vertikalTotalt)} m`,
    });
  }

  const stamPerDimension = new Map<string, { antal: number; meter: number }>();
  for (const stam of rader) {
    const etikett = varmeRorEtikett(
      stam.stamRordimension,
      stam.stamRordimensionAnnan,
    );
    if (!etikett) continue;
    const aktuell = stamPerDimension.get(etikett) ?? { antal: 0, meter: 0 };
    aktuell.antal += 1;
    aktuell.meter += varmeStamVertikalMeter(stam);
    stamPerDimension.set(etikett, aktuell);
  }
  for (const [etikett, tal] of stamPerDimension) {
    const delar = [`${tal.antal} st`];
    if (tal.meter > 0) delar.push(`${formatSummeringTal(tal.meter)} m höjd`);
    summering.push({
      etikett: `Stamledning ${etikett}`,
      varde: delar.join(", "),
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
