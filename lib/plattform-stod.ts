/**
 * Offentliga kontaktadresser för Styrelse-Navet.
 * Privata adresser (t.ex. icloud) ska inte visas på publika sidor.
 */

export const OFFENTLIG_EPOST_JOHAN = "johan@styrelse-navet.se";
export const OFFENTLIG_EPOST_SUPPORT = "support@styrelse-navet.se";
export const OFFENTLIG_EPOST_SEIF = "seif@styrelse-navet.se";

/** Primär hjälp-/supportadress (footer, banners, mailto). */
export const PLATTFORM_STOD_EPOST = OFFENTLIG_EPOST_SUPPORT;

export const OFFENTLIGA_KONTAKT_EPOSTER = [
  { etikett: "Johan", epost: OFFENTLIG_EPOST_JOHAN },
  { etikett: "Support", epost: OFFENTLIG_EPOST_SUPPORT },
  { etikett: "Seif", epost: OFFENTLIG_EPOST_SEIF },
] as const;

export const PLATTFORM_STOD_AMNE_PREFIX = "Styrelse-Navet — hjälp";

export function plattformStodMailto(
  amne?: string,
  brodtext?: string,
  tillEpost: string = PLATTFORM_STOD_EPOST,
): string {
  const subject = encodeURIComponent(
    amne?.trim() || `${PLATTFORM_STOD_AMNE_PREFIX}`,
  );
  const body = brodtext?.trim()
    ? `&body=${encodeURIComponent(brodtext.trim())}`
    : "";
  return `mailto:${tillEpost}?subject=${subject}${body}`;
}
