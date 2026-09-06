import {
  hamtaPlanSlutAr,
  normaliseraPlanLangdAr,
  normaliseraPlanStartAr,
  type Planinstallningar,
} from "@/components/underhallsplan/planinstallningar";

/** Genomsnittlig årlig byggkostnadsuppräkning (planering). */
export const STANDARD_BYGGINDEX_ARLIG = 0.028;

export const STANDARD_UPPHANDLING_PROCENT = 3;
export const STANDARD_PROJEKTLEDNING_PROCENT = 7;
export const STANDARD_INDEX_PROCENT = STANDARD_BYGGINDEX_ARLIG * 100;

export type PlanKostnaderNormaliserade = {
  upphandlingProcent: number;
  projektledningProcent: number;
  indexForePlanProcent: number;
  /** Årlig indexuppräkning i procent per kalenderår */
  hamtaIndexProcentForAr: (ar: number) => number;
};

function parseProcent(text: string | undefined, fallback: number): number {
  if (!text?.trim()) return fallback;
  const n = Number.parseFloat(text.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function skapaStandardIndexProcentPerAr(
  planStartAr: number,
  planLangdAr: number,
  standardProcent = STANDARD_INDEX_PROCENT,
): Record<string, string> {
  const slut = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const result: Record<string, string> = {};
  for (let ar = planStartAr; ar <= slut; ar++) {
    result[String(ar)] = String(standardProcent);
  }
  return result;
}

export function synkaIndexProcentPerAr(
  nuvarande: Record<string, string> | undefined,
  planStartAr: number,
  planLangdAr: number,
  standardProcent = STANDARD_INDEX_PROCENT,
): Record<string, string> {
  const slut = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const standard = String(standardProcent);
  const next: Record<string, string> = {};
  for (let ar = planStartAr; ar <= slut; ar++) {
    const key = String(ar);
    next[key] = nuvarande?.[key]?.trim() ? nuvarande[key] : standard;
  }
  return next;
}

export function normaliseraPlanKostnader(
  installningar: Planinstallningar,
): PlanKostnaderNormaliserade {
  const planStartAr = normaliseraPlanStartAr(installningar.planStartAr);
  const indexForePlanProcent = parseProcent(
    installningar.indexForePlanProcent,
    STANDARD_INDEX_PROCENT,
  );
  const indexMap = installningar.indexProcentPerAr ?? {};

  return {
    upphandlingProcent: parseProcent(
      installningar.upphandlingProcent,
      STANDARD_UPPHANDLING_PROCENT,
    ),
    projektledningProcent: parseProcent(
      installningar.projektledningProcent,
      STANDARD_PROJEKTLEDNING_PROCENT,
    ),
    indexForePlanProcent,
    hamtaIndexProcentForAr(ar: number) {
      if (ar < planStartAr) return indexForePlanProcent;
      const key = String(ar);
      if (indexMap[key]?.trim()) {
        return parseProcent(indexMap[key], STANDARD_INDEX_PROCENT);
      }
      return STANDARD_INDEX_PROCENT;
    },
  };
}

/** Sammansatt indexfaktor år för år (från år efter utfört till planerat år). */
export function beraknaArligIndexFaktor(
  franAr: number,
  tillAr: number,
  kostnader: PlanKostnaderNormaliserade,
): number {
  if (tillAr <= franAr) return 1;
  let faktor = 1;
  for (let ar = franAr + 1; ar <= tillAr; ar++) {
    faktor *= 1 + kostnader.hamtaIndexProcentForAr(ar) / 100;
  }
  return faktor;
}

export function beraknaUpphandlingOchProjektledning(
  entreprenadKr: number,
  kostnader: PlanKostnaderNormaliserade,
): {
  upphandlingKr: number;
  projektledningKr: number;
  totaltKr: number;
} {
  const upphandlingKr = Math.round(
    entreprenadKr * (kostnader.upphandlingProcent / 100),
  );
  const projektledningKr = Math.round(
    entreprenadKr * (kostnader.projektledningProcent / 100),
  );
  return {
    upphandlingKr,
    projektledningKr,
    totaltKr: entreprenadKr + upphandlingKr + projektledningKr,
  };
}
