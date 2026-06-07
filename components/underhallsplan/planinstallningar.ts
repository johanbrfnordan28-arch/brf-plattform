/** Standard underhållsplan enligt bransch — kan ändras per förening. */
export const standardPlanLangdAr = 50;
export const minPlanLangdAr = 10;
export const maxPlanLangdAr = 100;

export type Planinstallningar = {
  planStartAr: string;
  planLangdAr: string;
  /** % av entreprenadkostnad */
  upphandlingProcent: string;
  /** % av entreprenadkostnad */
  projektledningProcent: string;
  /** Index % per år före planstart (vid uppräkning från äldre renoveringar) */
  indexForePlanProcent: string;
  /** Byggindex % per kalenderår inom planperioden */
  indexProcentPerAr: Record<string, string>;
};

export function normaliseraPlaninstallningar(
  raw: Partial<Planinstallningar> & Pick<Planinstallningar, "planStartAr" | "planLangdAr">,
): Planinstallningar {
  const standard = standardPlaninstallningar();
  const planStartAr = normaliseraPlanStartAr(raw.planStartAr);
  const planLangdAr = normaliseraPlanLangdAr(raw.planLangdAr);
  const indexProcentPerAr: Record<string, string> = {};
  const slut = hamtaPlanSlutAr(planStartAr, planLangdAr);
  for (let ar = planStartAr; ar <= slut; ar++) {
    const key = String(ar);
    indexProcentPerAr[key] =
      raw.indexProcentPerAr?.[key]?.trim() ??
      standard.indexProcentPerAr[key] ??
      "2.8";
  }
  return {
    planStartAr: String(planStartAr),
    planLangdAr: String(planLangdAr),
    upphandlingProcent:
      raw.upphandlingProcent?.trim() || standard.upphandlingProcent,
    projektledningProcent:
      raw.projektledningProcent?.trim() || standard.projektledningProcent,
    indexForePlanProcent:
      raw.indexForePlanProcent?.trim() || standard.indexForePlanProcent,
    indexProcentPerAr,
  };
}

export function standardPlaninstallningar(): Planinstallningar {
  const planStartAr = new Date().getFullYear();
  const indexProcentPerAr: Record<string, string> = {};
  for (let ar = planStartAr; ar < planStartAr + standardPlanLangdAr; ar++) {
    indexProcentPerAr[String(ar)] = "2.8";
  }
  return {
    planStartAr: String(planStartAr),
    planLangdAr: String(standardPlanLangdAr),
    upphandlingProcent: "5",
    projektledningProcent: "10",
    indexForePlanProcent: "2.8",
    indexProcentPerAr,
  };
}

export function normaliseraPlanStartAr(value: string): number {
  const ar = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(ar) || ar < 1900 || ar > 2200) {
    return new Date().getFullYear();
  }
  return ar;
}

export function normaliseraPlanLangdAr(value: string | number): number {
  const n =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n)) return standardPlanLangdAr;
  return Math.min(maxPlanLangdAr, Math.max(minPlanLangdAr, n));
}

export function hamtaPlanSlutAr(planStartAr: number, planLangdAr: number): number {
  return planStartAr + planLangdAr - 1;
}
