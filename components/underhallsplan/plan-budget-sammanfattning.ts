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
  arAtgardDirektkostnad,
  samlaAllaUnderhallAtgarder,
  underhallKostnadPerAr,
  type UnderhallAtgard,
} from "@/components/underhallsplan/underhall-budget";

export type PlanUtgiftspost = {
  namn: string;
  belopp: number;
  /** Komponent i underhållsplanen som posten avser. */
  komponent: string;
};

/** Årsvis uppdelning: utgifter i årsbudgeten vs investeringar enligt plan. */
export type PlanUtgiftsArRad = {
  ar: number;
  /** Jämn avsättning kr/m²/år — budgeteras varje år. */
  avsattning: number;
  /** Besiktningar m.m. det år de utförs. */
  besiktningar: number;
  /**
   * Kostnadsfört underhåll det år det utförs
   * (spolning, filmning, målning m.m. — aktiveras ej / skrivs ej av).
   */
  direktkostnader: number;
  /** Planerade investeringar/åtgärder enligt underhållsplanen det året. */
  investeringPlan: number;
  /** Avsättning + besiktningar + kostnadsfört underhåll — årsbudget. */
  utgifterArsbudget: number;
  /** Investering + utgifter i årsbudget (kassaflöde totalt det året). */
  totaltKassaflode: number;
  /** Besiktningar och samfällighet — med komponent. */
  besiktningPoster: PlanUtgiftspost[];
  /** Kostnadsfört underhåll — med komponent. */
  direktkostnadPoster: PlanUtgiftspost[];
  /** Planerade investeringar det året — med komponent. */
  investeringPoster: PlanUtgiftspost[];
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

/**
 * Typisk avsättning för BRF (kr/m² bo- och lokalyta och år).
 * Auto-beräkning från planerade investeringar får inte pressa upp över max —
 * orimligt höga åtgärdskostnader ska justeras i registret, inte i avsättningen.
 */
export const TYPISK_AVSATTNING_KR_PER_KVM = {
  min: 200,
  lage: 400,
  hog: 600,
  /** Tak för autosatt/klampad avsättning. */
  max: 600,
  /** Vid återställning av orimligt högt sparat värde. */
  standard: 500,
} as const;

/** Endast aktiverbara/avskrivningsbara investeringar. */
export function filtreraInvesteringAtgarder(
  atgarder: UnderhallAtgard[],
): UnderhallAtgard[] {
  return atgarder.filter((a) => !arAtgardDirektkostnad(a));
}

/** Kostnadsfört underhåll (resultaträkning, ej aktivering). */
export function filtreraDirektkostnadAtgarder(
  atgarder: UnderhallAtgard[],
): UnderhallAtgard[] {
  return atgarder.filter((a) => arAtgardDirektkostnad(a));
}

/** Summerar planerade investeringsbelopp (exkl. kostnadsfört underhåll). */
export function summaPlaneradeInvesteringar(
  atgarder: UnderhallAtgard[],
  planStartAr: number,
  planLangdAr: number,
): number {
  const perAr = underhallKostnadPerAr(
    filtreraInvesteringAtgarder(atgarder),
    planStartAr,
    planLangdAr,
  );
  return Object.values(perAr).reduce((sum, v) => sum + v, 0);
}

/**
 * Jämn avsättning kr/m²/år som motsvarar att totala planerade investeringar
 * fördelas jämnt över planperioden och avsättningsytan (obegränsad).
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

/** Begränsar avsättning till typiskt intervall (max 600 kr/m²/år). */
export function begransaAvsattningKrPerKvmAr(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, TYPISK_AVSATTNING_KR_PER_KVM.max);
}

export type ForeslagenAvsattning = {
  /** Obegränsat värde från planerade investeringar. */
  obegransad: number | null;
  /** Förslag att sätta i planen — aldrig över typiskt max. */
  foreslagen: number | null;
  /** true om obegransad ligger över typiskt max. */
  overTypiskt: boolean;
  /** Jämn fördelning: summa investering / (yta × planår). */
  jamnFordelningKrPerKvmAr: number | null;
  /** Livscykel: summa (snittkostnad / intervall) per åtgärdsström / yta. */
  livscykelKrPerKvmAr: number | null;
  /** Total kr/år från livscykelmodellen (före delning på kvm). */
  arligFranLivscykelKr: number;
};

/** Grupperar återkommande investeringar (samma komponent/del). */
export function avsattningsNyckelForAtgard(a: UnderhallAtgard): string {
  return [
    a.komponent,
    a.del,
    a.underkomponentId ?? "",
    a.atgardTyp ?? "",
  ].join("\0");
}

/**
 * Jämn årlig avsättning utifrån komponenternas intervall: varje större åtgärd
 * motsvarar ungefär kostnad/intervall kr per år (t.ex. 20 års livscykel → spara
 * hälften av beloppet per år mellan två investeringar).
 */
export function beraknaArligAvsattningKrFranLivscykel(
  investeringAtgarder: UnderhallAtgard[],
): number {
  const perStream = new Map<
    string,
    { sumKr: number; count: number; intervallAr: number }
  >();
  for (const a of investeringAtgarder) {
    if (a.kostnadKr <= 0) continue;
    const intervall = a.intervallAr >= 1 ? a.intervallAr : 0;
    if (intervall <= 0) continue;
    const key = avsattningsNyckelForAtgard(a);
    const cur = perStream.get(key) ?? {
      sumKr: 0,
      count: 0,
      intervallAr: intervall,
    };
    cur.sumKr += a.kostnadKr;
    cur.count += 1;
    cur.intervallAr = intervall;
    perStream.set(key, cur);
  }
  let total = 0;
  for (const s of perStream.values()) {
    const snitt = s.count > 0 ? s.sumKr / s.count : 0;
    total += snitt / s.intervallAr;
  }
  return Math.round(total);
}

export function beraknaKrPerKvmArFranLivscykel(
  investeringAtgarder: UnderhallAtgard[],
  boareaM2: number,
): number | null {
  const arlig = beraknaArligAvsattningKrFranLivscykel(investeringAtgarder);
  if (arlig <= 0 || boareaM2 <= 0) return null;
  return Math.max(1, Math.round(arlig / boareaM2));
}

function slutForeslagenAvsattning(
  obegransad: number | null,
  jamnFordelningKrPerKvmAr: number | null,
  livscykelKrPerKvmAr: number | null,
  arligFranLivscykelKr: number,
): ForeslagenAvsattning {
  if (obegransad == null) {
    return {
      obegransad: null,
      foreslagen: null,
      overTypiskt: false,
      jamnFordelningKrPerKvmAr,
      livscykelKrPerKvmAr,
      arligFranLivscykelKr,
    };
  }
  const overTypiskt = obegransad > TYPISK_AVSATTNING_KR_PER_KVM.max;
  return {
    obegransad,
    foreslagen: begransaAvsattningKrPerKvmAr(obegransad),
    overTypiskt,
    jamnFordelningKrPerKvmAr,
    livscykelKrPerKvmAr,
    arligFranLivscykelKr,
  };
}

export function beraknaForeslagenAvsattningKrPerKvmAr(
  summaInvesteringKr: number,
  boareaM2: number,
  planLangdAr: number,
): ForeslagenAvsattning {
  const jamnFordelningKrPerKvmAr = beraknaRekommenderadKrPerKvmAr(
    summaInvesteringKr,
    boareaM2,
    planLangdAr,
  );
  return slutForeslagenAvsattning(
    jamnFordelningKrPerKvmAr,
    jamnFordelningKrPerKvmAr,
    null,
    0,
  );
}

/** Rekommendation: högst av jämn planfördelning och livscykel (intervall) per investering. */
export function beraknaForeslagenAvsattningFranPlan(input: {
  atgarder: UnderhallAtgard[];
  planStartAr: number;
  planLangdAr: number;
  boareaM2: number;
}): ForeslagenAvsattning {
  const { atgarder, planStartAr, planLangdAr, boareaM2 } = input;
  const summa = summaPlaneradeInvesteringar(
    atgarder,
    planStartAr,
    planLangdAr,
  );
  const jamnFordelningKrPerKvmAr = beraknaRekommenderadKrPerKvmAr(
    summa,
    boareaM2,
    planLangdAr,
  );
  const investering = filtreraInvesteringAtgarder(atgarder);
  const arligFranLivscykelKr =
    beraknaArligAvsattningKrFranLivscykel(investering);
  const livscykelKrPerKvmAr = beraknaKrPerKvmArFranLivscykel(
    investering,
    boareaM2,
  );
  const kandidater = [
    jamnFordelningKrPerKvmAr ?? 0,
    livscykelKrPerKvmAr ?? 0,
  ].filter((n) => n > 0);
  const obegransad =
    kandidater.length > 0 ? Math.max(...kandidater) : null;
  return slutForeslagenAvsattning(
    obegransad,
    jamnFordelningKrPerKvmAr,
    livscykelKrPerKvmAr,
    arligFranLivscykelKr,
  );
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
  const investeringAtgarder = filtreraInvesteringAtgarder(underhallAtgarder);
  const direktAtgarder = filtreraDirektkostnadAtgarder(underhallAtgarder);
  const investeringPerAr = underhallKostnadPerAr(
    investeringAtgarder,
    planStartAr,
    planLangdAr,
  );
  const direktPerAr = underhallKostnadPerAr(
    direktAtgarder,
    planStartAr,
    planLangdAr,
  );
  const besiktningPerAr = sammanstallBesiktningBudget(
    besiktningar,
    antalLagenheter,
    planStartAr,
    planLangdAr,
    planKostnader,
  );
  const samfallighetPerAr = beraknaSamfallighetsavgiftPerAr(samfallighetsavgift);

  return besiktningPerAr.map((rad) => {
    const investeringPlan = investeringPerAr[rad.ar] ?? 0;
    const direktkostnader = direktPerAr[rad.ar] ?? 0;
    const besiktningarSumma = rad.summaBesiktningar + samfallighetPerAr;
    const utgifterArsbudget =
      besiktningarSumma + avsattning.arligAvsattningKr + direktkostnader;
    const poster: PlanUtgiftspost[] = rad.poster.map((p) => ({
      namn: p.namn,
      belopp: p.belopp,
      komponent: p.komponent,
    }));
    if (samfallighetPerAr > 0) {
      poster.push({
        namn: "Samfällighetsavgift",
        belopp: samfallighetPerAr,
        komponent: "Samfällighet",
      });
    }
    const direktkostnadPoster: PlanUtgiftspost[] = direktAtgarder
      .filter((a) => a.ar === rad.ar)
      .map((a) => ({
        namn: a.del,
        belopp: a.kostnadKr,
        komponent: a.komponent,
      }));
    const investeringPoster: PlanUtgiftspost[] = investeringAtgarder
      .filter((a) => a.ar === rad.ar)
      .map((a) => ({
        namn: a.del,
        belopp: a.kostnadKr,
        komponent: a.komponent,
      }));
    return {
      ar: rad.ar,
      avsattning: avsattning.arligAvsattningKr,
      besiktningar: besiktningarSumma,
      direktkostnader,
      investeringPlan,
      utgifterArsbudget,
      totaltKassaflode: utgifterArsbudget + investeringPlan,
      besiktningPoster: poster,
      direktkostnadPoster,
      investeringPoster,
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
