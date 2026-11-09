import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** Värme under VVS — en grundmall per värmestam. Stammarna kan skilja sig åt. */

export const VVS_VARME_UNDERKOMPONENT_ID = "varme";

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
  /** Antal radiatorer på stammen. */
  radiatorAntal: string;
};

export function skapaVvsVarmeStamId(): string {
  return `vvs-varme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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
  };
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
  if (p.radiatorAntal) delar.push(`${p.radiatorAntal} radiatorer`);
  return delar.length > 0 ? `${rubrik}: ${delar.join(", ")}` : rubrik;
}

export function summeraVvsVarmeStammar(poster: VvsVarmeStam[]): ListaSummeringRad[] {
  const rader = poster.map((p) => normaliseraVvsVarmeStam(p));
  if (rader.length === 0) return [];

  const summering: ListaSummeringRad[] = [
    { etikett: "Antal värmestammar", varde: `${rader.length} st` },
  ];

  const radiatorer = parseNummerSumma(rader.map((p) => p.radiatorAntal));
  if (radiatorer > 0) {
    summering.push({
      etikett: "Radiatorer totalt",
      varde: `${formatSummeringTal(radiatorer, 0)} st`,
    });
  }

  return summering;
}

export function formateraVvsVarmeStammar(poster: VvsVarmeStam[]): string {
  const texter = poster
    .map(formateraVvsVarmeStam)
    .filter((t) => t && t !== "Värmestam");
  if (texter.length > 0) return texter.join(" · ");
  return formateraSummeringRader(summeraVvsVarmeStammar(poster));
}
