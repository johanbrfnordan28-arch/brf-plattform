/**
 * Nästa besiktning räknas från när den ordinarie besiktningen skulle ha gjorts,
 * inte från när den till slut blev godkänd efter en ombesiktning.
 */
export function beraknaNastaBesiktningAr(opts: {
  godkandAr?: number | null;
  ordinarieAr?: number | null;
  intervallAr?: number | null;
}): number | null {
  const intervall = opts.intervallAr ?? 0;
  if (intervall < 1) return null;
  const bas = opts.ordinarieAr ?? opts.godkandAr;
  if (!bas || !Number.isFinite(bas)) return null;
  return bas + intervall;
}

/** Årtal ur ett ISO-datum (YYYY-MM-DD). */
export function arFranDatum(datum: string | undefined | null): number | null {
  const ar = Number((datum ?? "").slice(0, 4));
  return Number.isInteger(ar) && ar >= 1900 && ar <= 2100 ? ar : null;
}

export function tolkaAr(text: string): number | null {
  const ar = Number.parseInt(text.trim(), 10);
  return Number.isInteger(ar) && ar >= 1900 && ar <= 2100 ? ar : null;
}

/** Fel om ordinarie år är orimligt jämfört med godkännandet, annars null. */
export function kontrolleraOrdinarieAr(
  ordinarieAr: number | null,
  godkandAr: number | null,
): string | null {
  if (ordinarieAr == null) {
    return "Ange vilket år den ordinarie besiktningen skulle ha gjorts.";
  }
  if (godkandAr != null && ordinarieAr > godkandAr) {
    return "Ordinarie besiktningsår kan inte vara senare än året för godkännandet.";
  }
  return null;
}

export const BESIKTNING_INTERVALL_RUBRIK = "Om besiktningen först blev underkänd";

export const BESIKTNING_INTERVALL_TEXT =
  "Intervallet räknas från det år då den ordinarie besiktningen skulle ha gjorts, inte från datumet då den till slut godkändes. En besiktning som underkänns och godkänns vid en ombesiktning flyttar alltså inte fram nästa besiktning.";

export const BESIKTNING_INTERVALL_EXEMPEL =
  "Exempel: en OVK skulle göras 2020 men underkändes och godkändes först 2021. Med 6 års intervall ska nästa OVK ändå göras 2026 – inte 2027.";
