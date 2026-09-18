import { KONTAKT_EPOST, kontaktMailto } from "@/lib/kontakt-epost";

/** Hjälp och vägledning i plattformen — «Behöver ni hjälp? Mejla …». */
export const PLATTFORM_STOD_EPOST = KONTAKT_EPOST.johan;

export const PLATTFORM_STOD_AMNE_PREFIX = "Styrelse-Navet — hjälp";

export function plattformStodMailto(amne?: string, brodtext?: string): string {
  return kontaktMailto(
    KONTAKT_EPOST.johan,
    amne?.trim() || PLATTFORM_STOD_AMNE_PREFIX,
    brodtext,
  );
}
