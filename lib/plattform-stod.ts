/** Kontakt till Styrelse-Navet — hjälp för styrelser som är nya i plattformen. */

export const PLATTFORM_STOD_EPOST = "johancarlsen@icloud.com";

export const PLATTFORM_STOD_AMNE_PREFIX = "Styrelse-Navet — hjälp";

export function plattformStodMailto(amne?: string, brodtext?: string): string {
  const subject = encodeURIComponent(
    amne?.trim() || `${PLATTFORM_STOD_AMNE_PREFIX}`,
  );
  const body = brodtext?.trim()
    ? `&body=${encodeURIComponent(brodtext.trim())}`
    : "";
  return `mailto:${PLATTFORM_STOD_EPOST}?subject=${subject}${body}`;
}
