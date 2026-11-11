import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";
import {
  formateraVarmeStamHojd,
  varmeBjalklagAlternativ,
  varmeRorDimensioner,
  varmeRorEtikett,
  varmeTakhojdAlternativ,
  varmeStamVertikalMeter,
  type VarmeBjalklagId,
  type VarmeRorDimensionId,
  type VarmeTakhojdId,
  type VvsVarmeStam,
} from "@/components/underhallsplan/vvs-varme";

export const VARMESTAMMAR_UNDERKOMPONENT_ID = "varmestammar";

export type VarmestamPost = {
  id: string;
  /** Namn styrelsen ger stammen, t.ex. Stam 1. */
  namn: string;
  /** Placering / trapphus / adress. */
  placering: string;
  /** Vad stammen betjänar, t.ex. 3 rum och kök, vardagsrum. */
  betjanar: string;
  vaningar: string;
  takhojd: VarmeTakhojdId | "";
  takhojdAnnan: string;
  bjalklag: VarmeBjalklagId | "";
  bjalklagAnnan: string;
  rordimension: VarmeRorDimensionId | "";
  rordimensionAnnan: string;
  /** Äldre fält — behålls som fallback om höjd inte kan räknas. */
  vertikalLopmeter: string;
  horisontellLopmeter: string;
};

export function skapaVarmestamPostId(): string {
  return `varmestam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomVarmestamPost(namn = ""): VarmestamPost {
  return {
    id: skapaVarmestamPostId(),
    namn,
    placering: "",
    betjanar: "",
    vaningar: "",
    takhojd: "2.6",
    takhojdAnnan: "",
    bjalklag: "0.4",
    bjalklagAnnan: "",
    rordimension: "mm30",
    rordimensionAnnan: "",
    vertikalLopmeter: "",
    horisontellLopmeter: "",
  };
}

function arTakhojd(v: unknown): v is VarmeTakhojdId {
  return varmeTakhojdAlternativ.some((a) => a.id === v);
}

function arBjalklag(v: unknown): v is VarmeBjalklagId {
  return varmeBjalklagAlternativ.some((a) => a.id === v);
}

function arRorDimension(v: unknown): v is VarmeRorDimensionId {
  return varmeRorDimensioner.some((d) => d.id === v);
}

function tillVarmeStamForHojd(post: VarmestamPost): VvsVarmeStam {
  return {
    id: post.id,
    namn: post.namn,
    markningKallare: "",
    adress: post.placering,
    betjanar: post.betjanar,
    vaningar: post.vaningar,
    takhojd: post.takhojd,
    takhojdAnnan: post.takhojdAnnan,
    bjalklag: post.bjalklag,
    bjalklagAnnan: post.bjalklagAnnan,
    rumStorlek: "",
    radiatorAntal: "",
    stamRordimension: post.rordimension,
    stamRordimensionAnnan: post.rordimensionAnnan,
    radiatorGrupper: [],
  };
}

export function varmestamVertikalMeter(post: VarmestamPost): number {
  const beraknad = varmeStamVertikalMeter(tillVarmeStamForHojd(post));
  if (beraknad > 0) return beraknad;
  return parseNummerSumma([post.vertikalLopmeter]);
}

export function normaliseraVarmestamPost(post: VarmestamPost): VarmestamPost {
  const takhojd = arTakhojd(post.takhojd) ? post.takhojd : "";
  const bjalklag = arBjalklag(post.bjalklag) ? post.bjalklag : "";
  const rordimension = arRorDimension(post.rordimension) ? post.rordimension : "";
  return {
    id: post.id,
    namn: post.namn.trim(),
    placering: post.placering?.trim() ?? "",
    betjanar: post.betjanar?.trim() ?? "",
    vaningar: post.vaningar?.trim() ?? "",
    takhojd,
    takhojdAnnan: takhojd === "annat" ? post.takhojdAnnan?.trim() ?? "" : "",
    bjalklag,
    bjalklagAnnan: bjalklag === "annat" ? post.bjalklagAnnan?.trim() ?? "" : "",
    rordimension,
    rordimensionAnnan:
      rordimension === "annat" ? post.rordimensionAnnan?.trim() ?? "" : "",
    vertikalLopmeter: post.vertikalLopmeter?.trim() ?? "",
    horisontellLopmeter: post.horisontellLopmeter?.trim() ?? "",
  };
}

export function formateraVarmestamPost(post: VarmestamPost): string {
  const p = normaliseraVarmestamPost(post);
  const rubrik = p.namn || "Värmestam";
  const delar: string[] = [];
  if (p.placering) delar.push(p.placering);
  if (p.betjanar) delar.push(p.betjanar);
  if (p.vaningar) delar.push(`${p.vaningar} våningar`);
  const hojd = formateraVarmeStamHojd(tillVarmeStamForHojd(p));
  if (hojd) delar.push(`höjd ${hojd}`);
  else if (p.vertikalLopmeter) delar.push(`vertikal ${p.vertikalLopmeter} m`);
  if (p.horisontellLopmeter) {
    delar.push(`horisontell ${p.horisontellLopmeter} m`);
  }
  const dim = varmeRorEtikett(p.rordimension, p.rordimensionAnnan);
  if (dim) delar.push(dim);
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVarmestamPoster(poster: VarmestamPost[]): ListaSummeringRad[] {
  if (poster.length === 0) return [];
  const rader = poster.map(normaliseraVarmestamPost);

  const summering: ListaSummeringRad[] = [
    { etikett: "Antal värmestammar", varde: `${rader.length} st` },
  ];

  const vertikal = rader.reduce((sum, p) => sum + varmestamVertikalMeter(p), 0);
  if (vertikal > 0) {
    summering.push({
      etikett: "Stamhöjd totalt",
      varde: `${formatSummeringTal(vertikal)} m`,
    });
  }

  const horisontell = parseNummerSumma(rader.map((p) => p.horisontellLopmeter));
  if (horisontell > 0) {
    summering.push({
      etikett: "Horisontell ledning totalt",
      varde: `${formatSummeringTal(horisontell)} m`,
    });
  }

  const perDimension = new Map<string, { antal: number; meter: number }>();
  for (const stam of rader) {
    const etikett = varmeRorEtikett(stam.rordimension, stam.rordimensionAnnan);
    if (!etikett) continue;
    const aktuell = perDimension.get(etikett) ?? { antal: 0, meter: 0 };
    aktuell.antal += 1;
    aktuell.meter += varmestamVertikalMeter(stam);
    perDimension.set(etikett, aktuell);
  }
  for (const [etikett, tal] of perDimension) {
    const delar = [`${tal.antal} st`];
    if (tal.meter > 0) delar.push(`${formatSummeringTal(tal.meter)} m höjd`);
    summering.push({
      etikett: `Dimension ${etikett}`,
      varde: delar.join(", "),
    });
  }

  return summering;
}

export function formateraVarmestamPoster(poster: VarmestamPost[]): string {
  const normaliserade = poster.map(normaliseraVarmestamPost);
  const texter = normaliserade
    .map(formateraVarmestamPost)
    .filter((t) => t && !t.match(/^Värmestam$/));
  if (texter.length > 0) return texter.join(" · ");

  const summering = summeraVarmestamPoster(normaliserade);
  return formateraSummeringRader(summering);
}

/** Migrerar äldre VVS → Värme-stammar till Värmestammar-modellen. */
export function varmestamFranVvsVarmeStam(stam: VvsVarmeStam): VarmestamPost {
  return normaliseraVarmestamPost({
    ...skapaTomVarmestamPost(stam.namn || ""),
    id: stam.id,
    namn: stam.namn,
    placering: stam.adress?.trim() || stam.markningKallare?.trim() || "",
    betjanar: stam.betjanar ?? "",
    vaningar: stam.vaningar ?? "",
    takhojd: stam.takhojd ?? "",
    takhojdAnnan: stam.takhojdAnnan ?? "",
    bjalklag: stam.bjalklag ?? "",
    bjalklagAnnan: stam.bjalklagAnnan ?? "",
    rordimension: stam.stamRordimension ?? "",
    rordimensionAnnan: stam.stamRordimensionAnnan ?? "",
    vertikalLopmeter: "",
    horisontellLopmeter: "",
  });
}
