/**
 * Kampanj / tilläggstjänst: professionell underhållsplan.
 * Skilt från plattformsabonnemanget (månadspris per lägenhetsnivå).
 */

import { PRISNIVAER } from "@/lib/prislista";

/** Ordinarie startpris exkl. moms (för föreningar med plattformsavtal). */
export const UNDERHALLSPLAN_FRAN_PRIS_KR = 25_000;

/** Kampanjrabatt på underhållsplanen t.o.m. årsskiftet. */
export const UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT = 40;

/** Kampanjen gäller t.o.m. detta datum. */
export const UNDERHALLSPLAN_KAMPANJ_GALLER_TOM = "2026-12-31";

export function underhallsplanKampanjPrisFran(): number {
  return Math.round(
    UNDERHALLSPLAN_FRAN_PRIS_KR *
      (1 - UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT / 100),
  );
}

/** Exempel: minsta lägenhetsnivå med årsavtal (12 × månadspris). */
export function underhallsplanExempelAbonnemangArKr(): number {
  const minNiva = PRISNIVAER[0];
  return minNiva.arsPrisPerManad * 12;
}

/** Exempel totalt första året: abonnemang + kampanjpris underhållsplan. */
export function underhallsplanExempelTotalForstaArKr(): number {
  return underhallsplanExempelAbonnemangArKr() + underhallsplanKampanjPrisFran();
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
