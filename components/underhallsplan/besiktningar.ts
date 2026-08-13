import {
  SBA_BRANDKONSULT_INTERVALL_AR,
  SBA_DEFAULT_BRANDKONSULT_KR,
  SBA_DEFAULT_KOSTNAD_KR,
} from "@/components/underhallsplan/brandskydd";
import { ovkIntervallArForVentilation } from "@/components/underhallsplan/grunduppgifter-val";
import { standardPlanLangdAr } from "@/components/underhallsplan/planinstallningar";

export type BesiktningId =
  | "ovk"
  | "sotning"
  | "hiss"
  | "radon"
  | "energideklaration"
  | "sba";

export type BesiktningPrismodell =
  | "per_lagenhet"
  | "per_hiss"
  | "per_lagenhet_och_eldstad"
  | "fast";

/** Riktpris OVK bostadslägenheter (kr/lgh). */
export const OVK_RIKTPRIS_PER_LGH_KR = 375;

/** Schablon OVK verksamhetslokaler (kr/st) — ofta högre än bostad. */
export const OVK_DEFAULT_VERKSAMHET_KR = 2_500;

/** OVK för verksamhetslokaler — alltid vart 3:e år oavsett fläksystem. */
export const OVK_INTERVALL_VERKSAMHET_AR = 3;

/** Tillåtna OVK-intervall bostadslägenheter enligt ventilationstyp. */
export const OVK_INTERVALL_BOSTAD_ALTERNATIV = [3, 6] as const;

export const SOTNING_INTERVALL_ALTERNATIV = [1, 2, 3] as const;

export const SBA_INTERVALL_ALTERNATIV = [1] as const;

export type Besiktning = {
  id: BesiktningId;
  namn: string;
  intervallAr: number;
  nastaBesiktningAr: number;
  /** Senaste utförda tillfälle — fylls i steg 2 (utförda arbeten). */
  senastUtförtAr?: number;
  /** Faktisk kostnad senaste tillfälle; annars schablon från prismodell. */
  senastKostnadKr?: number;
  aktiv: boolean;
  prismodell: BesiktningPrismodell;
  /** OVK, spolning — kr per lägenhet. Sotning — kr per lägenhet (bas). */
  kostnadPerLagenhetKr: number;
  /** Hiss — kr per hiss. */
  kostnadPerHissKr: number;
  antalHissar: number;
  /** Sotning — kr per eldstad (utöver per lägenhet). */
  kostnadPerEldstadKr: number;
  antalEldstäder: number;
  /** Radon, energideklaration — fast pris per tillfälle. */
  kostnadFastKr: number;
  /** Sotning: debitering mot lägenheter med öppen spis/eldstad — ingår ej i föreningens budget. */
  sotningInternDebitering?: boolean;
  /** Sotning intern debitering: antal lägenheter som debiteras. */
  antalLagenheterMedEldstad?: number;
  /** OVK: även verksamhetslokaler (butik, kontor m.m.). */
  ovkInkluderaVerksamhet?: boolean;
  antalVerksamheter?: number;
  kostnadPerVerksamhetKr?: number;
  /** OVK verksamhet — intervall (normalt 3 år). */
  ovkIntervallVerksamhetAr?: number;
  /** OVK verksamhet — nästa planerade år (kan skilja sig från bostäder). */
  ovkNastaVerksamhetAr?: number;
  /** OVK verksamhet — senast utfört år (steg 2). */
  ovkSenastVerksamhetAr?: number;
  /** SBA: extern brandkonsult med jämna intervaller. */
  sbaInkluderaBrandkonsult?: boolean;
  sbaBrandkonsultIntervallAr?: number;
  sbaBrandkonsultKostnadKr?: number;
  sbaNastaBrandkonsultAr?: number;
  sbaSenastBrandkonsultAr?: number;
};

export function hamtaBesiktningIntervallAlternativ(
  id: BesiktningId,
  planLangdAr: number,
): number[] {
  if (id === "sotning") return [...SOTNING_INTERVALL_ALTERNATIV];
  if (id === "ovk") return [...OVK_INTERVALL_BOSTAD_ALTERNATIV];
  if (id === "sba") return [...SBA_INTERVALL_ALTERNATIV];
  const max = Math.min(planLangdAr, 50);
  return Array.from({ length: max }, (_, i) => i + 1);
}

/** OVK-intervall bostäder utifrån ventilationssystem i grunduppgifter. */
export function ovkBostadIntervallFromVentilation(ventilationssystem: string): 3 | 6 {
  return ovkIntervallArForVentilation(ventilationssystem) ?? 6;
}

export function ovkIntervallBostadHint(ventilationssystem: string): string {
  const ar = ovkBostadIntervallFromVentilation(ventilationssystem);
  const system = ventilationssystem.trim();
  if (!system) {
    return "Ange ventilationssystem i grunduppgifter — S/F/FX ger 6 år, FT/FTX ger 3 år för bostäder.";
  }
  return `Enligt ventilationssystem (${system}): bostäder vart ${ar}:e år. Verksamhetslokaler alltid vart ${OVK_INTERVALL_VERKSAMHET_AR}:e år.`;
}

export function normaliseraOvkBesiktning(
  b: Besiktning,
  ventilationssystem?: string,
): Besiktning {
  if (b.id !== "ovk") return b;
  const bostadIntervall =
    b.intervallAr === 3 || b.intervallAr === 6
      ? b.intervallAr
      : ventilationssystem
        ? ovkBostadIntervallFromVentilation(ventilationssystem)
        : 6;
  const verksamhetIntervall =
    b.ovkIntervallVerksamhetAr ?? OVK_INTERVALL_VERKSAMHET_AR;
  return {
    ...b,
    intervallAr: bostadIntervall,
    ovkIntervallVerksamhetAr: verksamhetIntervall,
    ovkNastaVerksamhetAr:
      b.ovkInkluderaVerksamhet && b.ovkNastaVerksamhetAr == null
        ? b.nastaBesiktningAr
        : b.ovkNastaVerksamhetAr,
  };
}

export function tillampaOvkIntervallFromVentilation(
  lista: Besiktning[],
  ventilationssystem: string,
): Besiktning[] {
  return lista.map((b) =>
    b.id === "ovk"
      ? normaliseraOvkBesiktning(
          {
            ...b,
            intervallAr: ovkBostadIntervallFromVentilation(ventilationssystem),
            ovkIntervallVerksamhetAr: OVK_INTERVALL_VERKSAMHET_AR,
          },
          ventilationssystem,
        )
      : b,
  );
}

function arArIFSchema(nastaAr: number, intervallAr: number, ar: number): boolean {
  if (intervallAr < 1 || ar < nastaAr) return false;
  return (ar - nastaAr) % intervallAr === 0;
}

function beraknaNastaArFranSenast(
  senastAr: number,
  intervallAr: number,
  planStartAr: number,
): number {
  let nasta = senastAr + intervallAr;
  while (nasta < planStartAr) nasta += intervallAr;
  return nasta;
}

export function beraknaOvkBostadKostnad(
  b: Besiktning,
  antalLagenheter: number,
): number {
  if (b.id !== "ovk" || !b.aktiv) return 0;
  return Math.round(
    (b.kostnadPerLagenhetKr ?? 0) * Math.max(antalLagenheter, 0),
  );
}

export function beraknaOvkVerksamhetKostnad(b: Besiktning): number {
  if (b.id !== "ovk" || !b.aktiv || !b.ovkInkluderaVerksamhet) return 0;
  return Math.round(
    (b.kostnadPerVerksamhetKr ?? OVK_DEFAULT_VERKSAMHET_KR) *
      Math.max(b.antalVerksamheter ?? 0, 0),
  );
}

export function beraknaSbaEgenkontrollKostnad(b: Besiktning): number {
  if (b.id !== "sba" || !b.aktiv) return 0;
  return Math.round(b.kostnadFastKr ?? 0);
}

export function beraknaSbaBrandkonsultKostnad(b: Besiktning): number {
  if (b.id !== "sba" || !b.aktiv || !b.sbaInkluderaBrandkonsult) return 0;
  return Math.round(b.sbaBrandkonsultKostnadKr ?? SBA_DEFAULT_BRANDKONSULT_KR);
}

export function normaliseraSbaBesiktning(b: Besiktning): Besiktning {
  if (b.id !== "sba") return b;
  return {
    ...b,
    intervallAr: 1,
    sbaBrandkonsultIntervallAr:
      b.sbaBrandkonsultIntervallAr ?? SBA_BRANDKONSULT_INTERVALL_AR,
    sbaNastaBrandkonsultAr:
      b.sbaInkluderaBrandkonsult && b.sbaNastaBrandkonsultAr == null
        ? b.nastaBesiktningAr
        : b.sbaNastaBrandkonsultAr,
  };
}

/** Stänger av sotning och nollställer eldstäder — för föreningar utan eldstäder. */
export function taBortSotningOchEldstader(
  lista: Besiktning[],
): Besiktning[] {
  return lista.map((b) =>
    b.id === "sotning"
      ? {
          ...b,
          aktiv: false,
          antalEldstäder: 0,
          antalLagenheterMedEldstad: 0,
          sotningInternDebitering: false,
        }
      : b,
  );
}

/** Kostnad som inte ska in i föreningens årsbudget (t.ex. intern sotningsdebitering). */
export function ingarEjIForeningensBudget(b: Besiktning): boolean {
  return b.id === "sotning" && Boolean(b.sotningInternDebitering);
}

/** @deprecated Använd planinstallningar.planLangdAr — standard är 50 år. */
export const budgetPlanLangdAr = standardPlanLangdAr;

export const besiktningMallar: {
  id: BesiktningId;
  namn: string;
  prismodell: BesiktningPrismodell;
  defaultIntervall: number;
  defaultNastaArOffset: number;
  intervallHint: string;
  defaultPerLagenhetKr: number;
  defaultPerHissKr: number;
  defaultAntalHissar: number;
  defaultPerEldstadKr: number;
  defaultAntalEldstäder: number;
  defaultFastKr: number;
  defaultAktiv: boolean;
}[] = [
  {
    id: "ovk",
    namn: "OVK",
    prismodell: "per_lagenhet",
    defaultIntervall: 6,
    defaultNastaArOffset: 0,
    intervallHint:
      "Intervall bostäder styrs av ventilationssystem (S/F/FX: 6 år, FT/FTX: 3 år). Verksamhetslokaler alltid vart 3:e år.",
    defaultPerLagenhetKr: OVK_RIKTPRIS_PER_LGH_KR,
    defaultPerHissKr: 0,
    defaultAntalHissar: 0,
    defaultPerEldstadKr: 0,
    defaultAntalEldstäder: 0,
    defaultFastKr: 0,
    defaultAktiv: true,
  },
  {
    id: "sotning",
    namn: "Sotning",
    prismodell: "per_lagenhet_och_eldstad",
    defaultIntervall: 3,
    defaultNastaArOffset: 0,
    intervallHint:
      "Vanligt vart 3:e år. Vid intern debitering debiteras lägenheter med öppen spis eller eldstad — kostnaden ingår då inte i föreningens budget.",
    defaultPerLagenhetKr: 45,
    defaultPerHissKr: 0,
    defaultAntalHissar: 0,
    defaultPerEldstadKr: 850,
    defaultAntalEldstäder: 2,
    defaultFastKr: 0,
    defaultAktiv: true,
  },
  {
    id: "hiss",
    namn: "Hiss",
    prismodell: "per_hiss",
    defaultIntervall: 1,
    defaultNastaArOffset: 0,
    intervallHint: "Årlig besiktning — kostnad per hiss.",
    defaultPerLagenhetKr: 0,
    defaultPerHissKr: 8_500,
    defaultAntalHissar: 1,
    defaultPerEldstadKr: 0,
    defaultAntalEldstäder: 0,
    defaultFastKr: 0,
    defaultAktiv: false,
  },
  {
    id: "radon",
    namn: "Radonmätning",
    prismodell: "fast",
    defaultIntervall: 10,
    defaultNastaArOffset: 2,
    intervallHint: "Intervall varierar; ofta vart 10:e år eller vid behov.",
    defaultPerLagenhetKr: 0,
    defaultPerHissKr: 0,
    defaultAntalHissar: 0,
    defaultPerEldstadKr: 0,
    defaultAntalEldstäder: 0,
    defaultFastKr: 12_000,
    defaultAktiv: true,
  },
  {
    id: "energideklaration",
    namn: "Energideklaration",
    prismodell: "fast",
    defaultIntervall: 10,
    defaultNastaArOffset: 4,
    intervallHint: "Gäller normalt vart 10:e år.",
    defaultPerLagenhetKr: 0,
    defaultPerHissKr: 0,
    defaultAntalHissar: 0,
    defaultPerEldstadKr: 0,
    defaultAntalEldstäder: 0,
    defaultFastKr: 18_000,
    defaultAktiv: true,
  },
  {
    id: "sba",
    namn: "Systematiskt brandskyddsarbete (SBA)",
    prismodell: "fast",
    defaultIntervall: 1,
    defaultNastaArOffset: 0,
    intervallHint:
      "Årlig egenkontroll enligt kontrollmall. Brandkonsult kan läggas till med längre intervall.",
    defaultPerLagenhetKr: 0,
    defaultPerHissKr: 0,
    defaultAntalHissar: 0,
    defaultPerEldstadKr: 0,
    defaultAntalEldstäder: 0,
    defaultFastKr: SBA_DEFAULT_KOSTNAD_KR,
    defaultAktiv: true,
  },
];

export function skapaStandardBesiktningar(): Besiktning[] {
  const innevarandeAr = new Date().getFullYear();
  return besiktningMallar.map((mall) => ({
    id: mall.id,
    namn: mall.namn,
    prismodell: mall.prismodell,
    intervallAr: mall.defaultIntervall,
    nastaBesiktningAr: innevarandeAr + mall.defaultNastaArOffset,
    aktiv: mall.defaultAktiv,
    kostnadPerLagenhetKr: mall.defaultPerLagenhetKr,
    kostnadPerHissKr: mall.defaultPerHissKr,
    antalHissar: mall.defaultAntalHissar,
    kostnadPerEldstadKr: mall.defaultPerEldstadKr,
    antalEldstäder: mall.defaultAntalEldstäder,
    kostnadFastKr: mall.defaultFastKr,
    sotningInternDebitering: mall.id === "sotning" ? false : undefined,
    antalLagenheterMedEldstad: undefined,
    ovkInkluderaVerksamhet: mall.id === "ovk" ? false : undefined,
    antalVerksamheter: mall.id === "ovk" ? 0 : undefined,
    kostnadPerVerksamhetKr:
      mall.id === "ovk" ? OVK_DEFAULT_VERKSAMHET_KR : undefined,
    ovkIntervallVerksamhetAr: mall.id === "ovk" ? OVK_INTERVALL_VERKSAMHET_AR : undefined,
    sbaInkluderaBrandkonsult: mall.id === "sba" ? false : undefined,
    sbaBrandkonsultIntervallAr:
      mall.id === "sba" ? SBA_BRANDKONSULT_INTERVALL_AR : undefined,
    sbaBrandkonsultKostnadKr:
      mall.id === "sba" ? SBA_DEFAULT_BRANDKONSULT_KR : undefined,
  }));
}

/** Total kostnad ett år besiktningen utförs. */
export function beraknaBesiktningKostnad(
  b: Besiktning,
  antalLagenheter: number,
): number {
  if (!b.aktiv) return 0;
  if (ingarEjIForeningensBudget(b)) return 0;

  if (b.id === "ovk") {
    return beraknaOvkBostadKostnad(b, antalLagenheter) + beraknaOvkVerksamhetKostnad(b);
  }

  if (b.id === "sba") {
    return beraknaSbaEgenkontrollKostnad(b) + beraknaSbaBrandkonsultKostnad(b);
  }

  if (b.intervallAr < 1) return 0;

  let summa = 0;

  switch (b.prismodell) {
    case "per_lagenhet":
      summa = Math.round(
        (b.kostnadPerLagenhetKr ?? 0) * Math.max(antalLagenheter, 0),
      );
      break;
    case "per_hiss":
      summa = Math.round((b.kostnadPerHissKr ?? 0) * Math.max(b.antalHissar, 0));
      break;
    case "per_lagenhet_och_eldstad": {
      const lghSotning = b.sotningInternDebitering
        ? Math.max(b.antalLagenheterMedEldstad ?? 0, 0)
        : Math.max(antalLagenheter, 0);
      summa = Math.round(
        (b.kostnadPerLagenhetKr ?? 0) * lghSotning +
          (b.kostnadPerEldstadKr ?? 0) * Math.max(b.antalEldstäder, 0),
      );
      break;
    }
    case "fast":
      summa = Math.round(b.kostnadFastKr ?? 0);
      break;
    default:
      summa = 0;
  }

  return summa;
}

/** Beräknad kostnad inkl. poster som debiteras internt (visas som information). */
export function beraknaBesiktningKostnadInklIntern(
  b: Besiktning,
  antalLagenheter: number,
): number {
  if (!b.aktiv) return 0;
  if (b.id === "ovk" || b.id === "sba") {
    return beraknaBesiktningKostnad(b, antalLagenheter);
  }
  if (b.intervallAr < 1) return 0;

  if (b.id === "sotning" && b.sotningInternDebitering) {
    const lgh = Math.max(b.antalLagenheterMedEldstad ?? 0, 0);
    return Math.round(
      (b.kostnadPerLagenhetKr ?? 0) * lgh +
        (b.kostnadPerEldstadKr ?? 0) * Math.max(b.antalEldstäder, 0),
    );
  }

  return beraknaBesiktningKostnad(b, antalLagenheter);
}

export function besiktningKostnadFormel(
  b: Besiktning,
  antalLagenheter: number,
): string {
  if (b.id === "sotning" && b.sotningInternDebitering) {
    const lgh = b.antalLagenheterMedEldstad ?? 0;
    return `Intern debitering: ${b.kostnadPerLagenhetKr} kr × ${lgh} lgh (öppen spis/eldstad) + ${b.kostnadPerEldstadKr} kr × ${b.antalEldstäder} eldstäder — ingår ej i föreningsbudget`;
  }

  if (b.id === "ovk") {
    const ovkDelar: string[] = [];
    const bostad = beraknaOvkBostadKostnad(b, antalLagenheter);
    if (bostad > 0) {
      ovkDelar.push(`${b.kostnadPerLagenhetKr} kr × ${antalLagenheter} lgh (bostäder)`);
    }
    if (b.ovkInkluderaVerksamhet && (b.antalVerksamheter ?? 0) > 0) {
      ovkDelar.push(
        `${b.kostnadPerVerksamhetKr ?? OVK_DEFAULT_VERKSAMHET_KR} kr × ${b.antalVerksamheter} verksamhet`,
      );
    }
    return ovkDelar.join(" + ");
  }

  if (b.id === "sba") {
    const sbaDelar: string[] = [];
    const egen = beraknaSbaEgenkontrollKostnad(b);
    if (egen > 0) {
      sbaDelar.push(`${b.kostnadFastKr} kr (årlig SBA-egenkontroll)`);
    }
    if (b.sbaInkluderaBrandkonsult) {
      sbaDelar.push(
        `${b.sbaBrandkonsultKostnadKr ?? SBA_DEFAULT_BRANDKONSULT_KR} kr (brandkonsult)`,
      );
    }
    return sbaDelar.join(" + ");
  }

  const delar: string[] = [];

  switch (b.prismodell) {
    case "per_lagenhet":
      delar.push(`${b.kostnadPerLagenhetKr} kr × ${antalLagenheter} lgh`);
      break;
    case "per_hiss":
      delar.push(`${b.kostnadPerHissKr} kr × ${b.antalHissar} hiss`);
      break;
    case "per_lagenhet_och_eldstad":
      delar.push(
        `${b.kostnadPerLagenhetKr} kr × ${antalLagenheter} lgh + ${b.kostnadPerEldstadKr} kr × ${b.antalEldstäder} eldstäder`,
      );
      break;
    case "fast":
      delar.push(`${b.kostnadFastKr} kr (fast)`);
      break;
    default:
      break;
  }

  return delar.join(" + ");
}

function ovkKostnadPerAr(
  b: Besiktning,
  antalLagenheter: number,
  planStartAr: number,
  planSlutAr: number,
): Record<number, number> {
  const perAr: Record<number, number> = {};
  const bostadKost = beraknaOvkBostadKostnad(b, antalLagenheter);
  if (bostadKost > 0 && b.intervallAr >= 1) {
    let ar = b.nastaBesiktningAr;
    while (ar <= planSlutAr) {
      if (ar >= planStartAr) {
        perAr[ar] = (perAr[ar] ?? 0) + bostadKost;
      }
      ar += b.intervallAr;
    }
  }

  const verksamhetKost = beraknaOvkVerksamhetKostnad(b);
  if (verksamhetKost > 0) {
    const verkIntervall = b.ovkIntervallVerksamhetAr ?? OVK_INTERVALL_VERKSAMHET_AR;
    const nastaVerk = b.ovkNastaVerksamhetAr ?? b.nastaBesiktningAr;
    let ar = nastaVerk;
    while (ar <= planSlutAr) {
      if (ar >= planStartAr) {
        perAr[ar] = (perAr[ar] ?? 0) + verksamhetKost;
      }
      ar += verkIntervall;
    }
  }

  return perAr;
}

function sbaKostnadPerAr(
  b: Besiktning,
  planStartAr: number,
  planSlutAr: number,
): Record<number, number> {
  const perAr: Record<number, number> = {};
  const egenKost = beraknaSbaEgenkontrollKostnad(b);
  if (egenKost > 0 && b.intervallAr >= 1) {
    let ar = b.nastaBesiktningAr;
    while (ar <= planSlutAr) {
      if (ar >= planStartAr) {
        perAr[ar] = (perAr[ar] ?? 0) + egenKost;
      }
      ar += b.intervallAr;
    }
  }

  const konsultKost = beraknaSbaBrandkonsultKostnad(b);
  if (konsultKost > 0) {
    const intervall = b.sbaBrandkonsultIntervallAr ?? SBA_BRANDKONSULT_INTERVALL_AR;
    const nasta = b.sbaNastaBrandkonsultAr ?? b.nastaBesiktningAr;
    let ar = nasta;
    while (ar <= planSlutAr) {
      if (ar >= planStartAr) {
        perAr[ar] = (perAr[ar] ?? 0) + konsultKost;
      }
      ar += intervall;
    }
  }

  return perAr;
}

/** Komponent i underhållsplanen som besiktningen hör till. */
export function besiktningKomponentNamn(id: BesiktningId): string {
  switch (id) {
    case "ovk":
      return "Ventilation";
    case "hiss":
      return "Trapphus";
    case "sba":
      return "Brandskydd";
    case "sotning":
      return "Skorsten / eldstad";
    case "radon":
    case "energideklaration":
      return "Byggnad";
    default:
      return "Övrigt";
  }
}

export type BesiktningUtgiftspost = {
  namn: string;
  belopp: number;
  formel?: string;
  /** Komponent i underhållsplanen som posten avser. */
  komponent: string;
};

export function besiktningPosterForAr(
  b: Besiktning,
  antalLagenheter: number,
  ar: number,
): BesiktningUtgiftspost[] {
  if (!b.aktiv || ingarEjIForeningensBudget(b)) return [];
  const komponent = besiktningKomponentNamn(b.id);

  if (b.id === "ovk") {
    const poster: BesiktningUtgiftspost[] = [];
    const bostadKost = beraknaOvkBostadKostnad(b, antalLagenheter);
    if (bostadKost > 0 && arArIFSchema(b.nastaBesiktningAr, b.intervallAr, ar)) {
      poster.push({
        namn: "OVK bostäder",
        belopp: bostadKost,
        formel: `${b.kostnadPerLagenhetKr} kr × ${antalLagenheter} lgh`,
        komponent,
      });
    }
    const verksamhetKost = beraknaOvkVerksamhetKostnad(b);
    if (verksamhetKost > 0) {
      const verkIntervall = b.ovkIntervallVerksamhetAr ?? OVK_INTERVALL_VERKSAMHET_AR;
      const nastaVerk = b.ovkNastaVerksamhetAr ?? b.nastaBesiktningAr;
      if (arArIFSchema(nastaVerk, verkIntervall, ar)) {
        poster.push({
          namn: "OVK verksamhetslokaler",
          belopp: verksamhetKost,
          formel: `${b.kostnadPerVerksamhetKr ?? OVK_DEFAULT_VERKSAMHET_KR} kr × ${b.antalVerksamheter} lokaler`,
          komponent,
        });
      }
    }
    return poster;
  }

  if (b.id === "sba") {
    const poster: BesiktningUtgiftspost[] = [];
    const egenKost = beraknaSbaEgenkontrollKostnad(b);
    if (egenKost > 0 && arArIFSchema(b.nastaBesiktningAr, b.intervallAr, ar)) {
      poster.push({
        namn: "SBA egenkontroll",
        belopp: egenKost,
        formel: `${b.kostnadFastKr} kr (årlig)`,
        komponent,
      });
    }
    const konsultKost = beraknaSbaBrandkonsultKostnad(b);
    if (konsultKost > 0) {
      const intervall = b.sbaBrandkonsultIntervallAr ?? SBA_BRANDKONSULT_INTERVALL_AR;
      const nasta = b.sbaNastaBrandkonsultAr ?? b.nastaBesiktningAr;
      if (arArIFSchema(nasta, intervall, ar)) {
        poster.push({
          namn: "SBA brandkonsult",
          belopp: konsultKost,
          formel: `${b.sbaBrandkonsultKostnadKr ?? SBA_DEFAULT_BRANDKONSULT_KR} kr`,
          komponent,
        });
      }
    }
    return poster;
  }

  if (b.intervallAr < 1) return [];
  if (!arArIFSchema(b.nastaBesiktningAr, b.intervallAr, ar)) return [];

  const belopp = beraknaBesiktningKostnad(b, antalLagenheter);
  if (belopp <= 0) return [];

  return [
    {
      namn: b.namn,
      belopp,
      formel: besiktningKostnadFormel(b, antalLagenheter),
      komponent,
    },
  ];
}

/** Kostnad per kalenderår när besiktningen faktiskt utförs. */
export function besiktningKostnadPerAr(
  b: Besiktning,
  antalLagenheter: number,
  planStartAr: number,
  planSlutAr: number,
): Record<number, number> {
  if (!b.aktiv) return {};

  if (b.id === "ovk") {
    return ovkKostnadPerAr(b, antalLagenheter, planStartAr, planSlutAr);
  }

  if (b.id === "sba") {
    return sbaKostnadPerAr(b, planStartAr, planSlutAr);
  }

  const perAr: Record<number, number> = {};
  const belopp = beraknaBesiktningKostnad(b, antalLagenheter);
  if (belopp <= 0 || b.intervallAr < 1) return perAr;

  let ar = b.nastaBesiktningAr;
  while (ar <= planSlutAr) {
    if (ar >= planStartAr) {
      perAr[ar] = (perAr[ar] ?? 0) + belopp;
    }
    ar += b.intervallAr;
  }
  return perAr;
}

export type BesiktningBudgetAr = {
  ar: number;
  poster: BesiktningUtgiftspost[];
  summaBesiktningar: number;
};

export function sammanstallBesiktningBudget(
  besiktningar: Besiktning[],
  antalLagenheter: number,
  planStartAr: number,
  planLangdAr: number = standardPlanLangdAr,
): BesiktningBudgetAr[] {
  const arLista = Array.from({ length: planLangdAr }, (_, i) => planStartAr + i);

  return arLista.map((ar) => {
    const poster: BesiktningUtgiftspost[] = [];

    for (const b of besiktningar) {
      for (const post of besiktningPosterForAr(b, antalLagenheter, ar)) {
        poster.push(post);
      }
    }

    return {
      ar,
      poster,
      summaBesiktningar: poster.reduce((sum, p) => sum + p.belopp, 0),
    };
  });
}

export function formatKr(value: number): string {
  return `${value.toLocaleString("sv-SE")} kr`;
}

/** Uppdaterar nästa besiktning utifrån senast utfört + intervall, minst planStartAr. */
export function synkaNastaBesiktningFranUtfört(
  lista: Besiktning[],
  planStartAr: number,
): Besiktning[] {
  return lista.map((item) => {
    if (!item.aktiv) return item;

    if (item.id === "ovk") {
      const patch: Partial<Besiktning> = {};
      if (item.senastUtförtAr != null && item.senastUtförtAr > 0) {
        patch.nastaBesiktningAr = beraknaNastaArFranSenast(
          item.senastUtförtAr,
          item.intervallAr,
          planStartAr,
        );
      }
      if (item.ovkInkluderaVerksamhet) {
        const senastVerk =
          item.ovkSenastVerksamhetAr ?? item.senastUtförtAr;
        if (senastVerk != null && senastVerk > 0) {
          patch.ovkNastaVerksamhetAr = beraknaNastaArFranSenast(
            senastVerk,
            item.ovkIntervallVerksamhetAr ?? OVK_INTERVALL_VERKSAMHET_AR,
            planStartAr,
          );
        } else if (patch.nastaBesiktningAr != null) {
          patch.ovkNastaVerksamhetAr = patch.nastaBesiktningAr;
        }
      }
      return Object.keys(patch).length > 0 ? { ...item, ...patch } : item;
    }

    if (item.id === "sba") {
      const patch: Partial<Besiktning> = {};
      if (item.senastUtförtAr != null && item.senastUtförtAr > 0) {
        patch.nastaBesiktningAr = beraknaNastaArFranSenast(
          item.senastUtförtAr,
          item.intervallAr,
          planStartAr,
        );
      }
      if (item.sbaInkluderaBrandkonsult) {
        const senastKonsult =
          item.sbaSenastBrandkonsultAr ?? item.senastUtförtAr;
        if (senastKonsult != null && senastKonsult > 0) {
          patch.sbaNastaBrandkonsultAr = beraknaNastaArFranSenast(
            senastKonsult,
            item.sbaBrandkonsultIntervallAr ?? SBA_BRANDKONSULT_INTERVALL_AR,
            planStartAr,
          );
        } else if (patch.nastaBesiktningAr != null) {
          patch.sbaNastaBrandkonsultAr = patch.nastaBesiktningAr;
        }
      }
      return Object.keys(patch).length > 0
        ? normaliseraSbaBesiktning({ ...item, ...patch })
        : item;
    }

    if (item.senastUtförtAr == null || item.senastUtförtAr <= 0) {
      return item;
    }
    return {
      ...item,
      nastaBesiktningAr: beraknaNastaArFranSenast(
        item.senastUtförtAr,
        item.intervallAr,
        planStartAr,
      ),
    };
  });
}
