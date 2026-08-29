/**
 * Kampanj / tilläggstjänst: professionell underhållsplan.
 * Skilt från plattformsabonnemanget (månadspris per lägenhetsnivå).
 */

import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";

/** Ordinarie startpris exkl. moms (för föreningar med plattformsavtal). */
export const UNDERHALLSPLAN_FRAN_PRIS_KR = 12_000;

/** Kampanjrabatt på underhållsplanen (samma procentsats som årsavtal). */
export const UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT = ARSAVTAL_RABATT_PROCENT;

/** Kampanjen gäller t.o.m. detta datum (året ut). */
export const UNDERHALLSPLAN_KAMPANJ_GALLER_TOM = "2026-12-31";

export function underhallsplanKampanjPrisFran(): number {
  return Math.round(
    UNDERHALLSPLAN_FRAN_PRIS_KR *
      (1 - UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT / 100),
  );
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
