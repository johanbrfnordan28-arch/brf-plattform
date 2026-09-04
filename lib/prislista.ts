/**
 * Prislista för Styrelse-Navet (exkl. moms).
 * Årsavtal = 50 % rabatt mot ordinarie månadspris.
 * Fakturering vid årsavtal: kvartalsvis i förskott.
 */

export const ARSAVTAL_RABATT_PROCENT = 50;

export type PrisNiva = {
  id: string;
  /** Inklusive min */
  minLagenheter: number;
  /** Inklusive max (null = obegränsat / offert) */
  maxLagenheter: number | null;
  /** Kr/månad vid årsavtal (exkl. moms) */
  arsPrisPerManad: number;
  etikett: string;
};

/** Ordinarie månadspris = årspris × 2 (50 % rabatt på årsavtal). */
export const PRISNIVAER: readonly PrisNiva[] = [
  {
    id: "1-15",
    minLagenheter: 1,
    maxLagenheter: 15,
    arsPrisPerManad: 500,
    etikett: "Upp till 15 lägenheter",
  },
  {
    id: "16-30",
    minLagenheter: 16,
    maxLagenheter: 30,
    arsPrisPerManad: 600,
    etikett: "16–30 lägenheter",
  },
  {
    id: "31-50",
    minLagenheter: 31,
    maxLagenheter: 50,
    arsPrisPerManad: 700,
    etikett: "31–50 lägenheter",
  },
  {
    id: "51-100",
    minLagenheter: 51,
    maxLagenheter: 100,
    arsPrisPerManad: 800,
    etikett: "51–100 lägenheter",
  },
] as const;

export type BeraknatPris = {
  antalLagenheter: number;
  niva: PrisNiva;
  /** Kr/månad årsavtal exkl. moms */
  arsPrisPerManad: number;
  /** Kr/månad ordinarie (månadsbetalning) exkl. moms */
  ordinariePrisPerManad: number;
  /** Kr per kvartal i förskott (årsavtal) */
  kvartalsbelopp: number;
  rabattProcent: number;
};

export function ordinarieFranArsPris(arsPrisPerManad: number): number {
  return Math.round(arsPrisPerManad / (1 - ARSAVTAL_RABATT_PROCENT / 100));
}

export function finnPrisNiva(antalLagenheter: number): PrisNiva | null {
  if (!Number.isFinite(antalLagenheter) || antalLagenheter < 1) return null;
  for (const niva of PRISNIVAER) {
    const max = niva.maxLagenheter ?? Number.POSITIVE_INFINITY;
    if (antalLagenheter >= niva.minLagenheter && antalLagenheter <= max) {
      return niva;
    }
  }
  return null;
}

export function beraknaPris(
  antalLagenheter: number,
): BeraknatPris | null {
  const niva = finnPrisNiva(antalLagenheter);
  if (!niva) return null;
  const arsPrisPerManad = niva.arsPrisPerManad;
  const ordinariePrisPerManad = ordinarieFranArsPris(arsPrisPerManad);
  return {
    antalLagenheter,
    niva,
    arsPrisPerManad,
    ordinariePrisPerManad,
    kvartalsbelopp: arsPrisPerManad * 3,
    rabattProcent: ARSAVTAL_RABATT_PROCENT,
  };
}

export function formatKr(belopp: number): string {
  return `${belopp.toLocaleString("sv-SE")} kr`;
}

/** Kort villkorstext gemensam för huvud- och undersidor. */
export function avtalsVillkorKort(): string[] {
  return [
    "Prövoperiod 30 dagar — ingen uppsägningstid",
    "Utan tecknat avtal raderas föreningen efter prövoperioden",
    `Årsavtal: ${ARSAVTAL_RABATT_PROCENT} % rabatt mot månadsdebitering`,
    "Fakturering kvartalsvis i förskott (årsavtal)",
    "Avtalstid 1 år · uppsägningstid 6 månader",
    "Prisjustering enligt KPI vid förlängning",
    "Alla priser exkl. moms",
  ];
}
