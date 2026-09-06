/**
 * Pris för professionell underhållsplan (tilläggstjänst).
 * Skilt från plattformsabonnemanget (månadspris per lägenhetsnivå i prislista.ts).
 *
 * Ordinarie från-pris: 24 000 kr exkl. moms.
 * Vid tecknat plattformsavtal: 50 % rabatt → från 12 000 kr exkl. moms.
 * Exakt belopp via offert utifrån fastighetens omfattning.
 */

/** Ordinarie startpris exkl. moms (utan avtalsrabatt). */
export const UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR = 24_000;

/** Från-pris exkl. moms för föreningar med tecknat avtal (50 % rabatt). */
export const UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR = 12_000;

/** Rabatt vid tecknande av avtal. */
export const UNDERHALLSPLAN_AVTAL_RABATT_PROCENT = 50;

/** @deprecated Använd UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR */
export const UNDERHALLSPLAN_FRAN_PRIS_KR = UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR;

/** @deprecated Använd UNDERHALLSPLAN_AVTAL_RABATT_PROCENT */
export const UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT =
  UNDERHALLSPLAN_AVTAL_RABATT_PROCENT;

/** Visningsdatum för avtalserbjudande (året ut). */
export const UNDERHALLSPLAN_KAMPANJ_GALLER_TOM = "2026-12-31";

/** Avtalspris från (12 000 kr). */
export function underhallsplanKampanjPrisFran(): number {
  return UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR;
}

export function formatKampanjDatum(isoDatum: string): string {
  try {
    return new Date(`${isoDatum}T12:00:00`).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoDatum;
  }
}

export function underhallsplanKampanjArAktiv(
  nu: Date = new Date(),
): boolean {
  const slut = new Date(`${UNDERHALLSPLAN_KAMPANJ_GALLER_TOM}T23:59:59`);
  return nu.getTime() <= slut.getTime();
}
