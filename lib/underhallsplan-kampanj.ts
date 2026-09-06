/**
 * Pris för professionell underhållsplan (tilläggstjänst).
 * Skilt från plattformsabonnemanget (från 6 000 kr/år vid 1 årsavtal).
 *
 * Ordinarie: 24 000 kr exkl. moms.
 * Med tecknat plattformsavtal: 12 000 kr exkl. moms (50 % rabatt).
 * Kan köpas samtidigt eller senare. Exakt belopp via offert.
 */

/** Ordinarie pris exkl. moms (utan plattformsavtal). */
export const UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR = 24_000;

/** Pris exkl. moms när föreningen även har tecknat plattformsavtal. */
export const UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR = 12_000;

/** Rabatt på underhållsplanen när plattformsavtal tecknas. */
export const UNDERHALLSPLAN_AVTAL_RABATT_PROCENT = 50;

/** @deprecated Använd UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR */
export const UNDERHALLSPLAN_FRAN_PRIS_KR = UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR;

/** @deprecated Använd UNDERHALLSPLAN_AVTAL_RABATT_PROCENT */
export const UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT =
  UNDERHALLSPLAN_AVTAL_RABATT_PROCENT;

/** Visningsdatum för avtalserbjudande (året ut). */
export const UNDERHALLSPLAN_KAMPANJ_GALLER_TOM = "2026-12-31";

/** Avtalspris (12 000 kr). */
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

/** Erbjudandet om avtalspris på underhållsplanen är aktivt. */
export function underhallsplanKampanjArAktiv(
  nu: Date = new Date(),
): boolean {
  const slut = new Date(`${UNDERHALLSPLAN_KAMPANJ_GALLER_TOM}T23:59:59`);
  return nu.getTime() <= slut.getTime();
}
