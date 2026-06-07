import {
  sammanstallBesiktningBudget,
  type Besiktning,
} from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import {
  beraknaSamfallighetsavgiftPerAr,
  type Samfallighetsavgift,
} from "@/components/underhallsplan/samfallighetsavgift";
import {
  samlaAllaUnderhallAtgarder,
  underhallKostnadPerAr,
  type UnderhallAtgard,
} from "@/components/underhallsplan/underhall-budget";

/** Årsvis uppdelning: utgifter i årsbudgeten vs investeringar enligt plan. */
export type PlanUtgiftsArRad = {
  ar: number;
  /** Jämn avsättning kr/m²/år — budgeteras varje år. */
  avsattning: number;
  /** Besiktningar m.m. det år de utförs. */
  besiktningar: number;
  /** Planerade investeringar/åtgärder enligt underhållsplanen det året. */
  investeringPlan: number;
  /** Avsättning + besiktningar — det som hör till föreningens årsbudget. */
  utgifterArsbudget: number;
  /** Investering + utgifter i årsbudget (kassaflöde totalt det året). */
  totaltKassaflode: number;
  besiktningPoster: { namn: string; belopp: number }[];
};

/** @deprecated Använd PlanUtgiftsArRad */
export type PlanBudgetArRad = PlanUtgiftsArRad & {
  planeratUnderhall: number;
  totalt: number;
};

export type PlanAvsattning = {
  boareaM2: number;
  krPerKvmAr: number;
  arligAvsattningKr: number;
  summaAvsattningPlanperiodKr: number;
};

/** Summerar alla planerade investeringsbelopp inom planperioden. */
export function summaPlaneradeInvesteringar(
  atgarder: UnderhallAtgard[],
  planStartAr: number,
  planLangdAr: number,
): number {
  const perAr = underhallKostnadPerAr(atgarder, planStartAr, planLangdAr);
  return Object.values(perAr).reduce((sum, v) => sum + v, 0);
}

/**
 * Jämn avsättning kr/m²/år som motsvarar att totala planerade investeringar
 * fördelas jämnt över planperioden och avsättningsytan.
 */
export function beraknaRekommenderadKrPerKvmAr(
  summaInvesteringKr: number,
  boareaM2: number,
  planLangdAr: number,
): number | null {
  if (summaInvesteringKr <= 0 || boareaM2 <= 0 || planLangdAr <= 0) {
    return null;
  }
  return Math.max(1, Math.round(summaInvesteringKr / (boareaM2 * planLangdAr)));
}

export function beraknaPlanAvsattning(
  boareaM2: number,
  krPerKvmAr: number,
  planLangdAr: number,
): PlanAvsattning {
  const arligAvsattningKr =
    boareaM2 > 0 ? Math.round(boareaM2 * krPerKvmAr) : 0;
  return {
    boareaM2,
    krPerKvmAr,
    arligAvsattningKr,
    summaAvsattningPlanperiodKr: arligAvsattningKr * planLangdAr,
  };
}

export function beraknaPlanUtgiftsRader(input: {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  besiktningar: Besiktning[];
  samfallighetsavgift?: Samfallighetsavgift | null;
  renoveringarLista: UtfördRenovering[];
  antalLagenheter: number;
  planStartAr: number;
  planLangdAr: number;
  boareaM2: number;
  krPerKvmAr: number;
  planKostnader?: PlanKostnaderNormaliserade;
}): PlanUtgiftsArRad[] {
  const {
    activeComponents,
    komponentDetaljer,
    besiktningar,
    samfallighetsavgift,
    renoveringarLista,
    antalLagenheter,
    planStartAr,
    planLangdAr,
    boareaM2,
    krPerKvmAr,
    planKostnader,
  } = input;

  const avsattning = beraknaPlanAvsattning(boareaM2, krPerKvmAr, planLangdAr);

  const underhallAtgarder = samlaAllaUnderhallAtgarder(
    activeComponents,
    komponentDetaljer,
    renoveringarLista,
    planStartAr,
    planLangdAr,
    planKostnader,
  );
  const underhallPerAr = underhallKostnadPerAr(
    underhallAtgarder,
    planStartAr,
    planLangdAr,
  );
  const besiktningPerAr = sammanstallBesiktningBudget(
    besiktningar,
    antalLagenheter,
    planStartAr,
    planLangdAr,
  );
  const samfallighetPerAr = beraknaSamfallighetsavgiftPerAr(samfallighetsavgift);

  return besiktningPerAr.map((rad) => {
    const investeringPlan = underhallPerAr[rad.ar] ?? 0;
    const besiktningarSumma = rad.summaBesiktningar + samfallighetPerAr;
    const utgifterArsbudget = besiktningarSumma + avsattning.arligAvsattningKr;
    const poster = rad.poster.map((p) => ({
      namn: p.namn,
      belopp: p.belopp,
    }));
    if (samfallighetPerAr > 0) {
      poster.push({ namn: "Samfällighetsavgift", belopp: samfallighetPerAr });
    }
    return {
      ar: rad.ar,
      avsattning: avsattning.arligAvsattningKr,
      besiktningar: besiktningarSumma,
      investeringPlan,
      utgifterArsbudget,
      totaltKassaflode: utgifterArsbudget + investeringPlan,
      besiktningPoster: poster,
    };
  });
}

/** Bakåtkompatibelt alias. */
export function beraknaPlanBudgetRader(
  input: Parameters<typeof beraknaPlanUtgiftsRader>[0],
): PlanBudgetArRad[] {
  return beraknaPlanUtgiftsRader(input).map((r) => ({
    ...r,
    planeratUnderhall: r.investeringPlan,
    totalt: r.totaltKassaflode,
  }));
}
