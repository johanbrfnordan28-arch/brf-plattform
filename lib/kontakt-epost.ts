/** Offentliga kontaktadresser till Styrelse-Navet. */

export const KONTAKT_EPOST = {
  johan: "johan@styrelse-navet.se",
  info: "info@styrelse-navet.se",
  support: "support@styrelse-navet.se",
  offert: "offert@styrelse-navet.se",
} as const;

export type KontaktEpostNyckel = keyof typeof KONTAKT_EPOST;

export const KONTAKT_EPOST_ETIKETTER: Record<KontaktEpostNyckel, string> = {
  johan: "Hjälp & vägledning",
  info: "Allmän info",
  support: "Support",
  offert: "Offert",
};

export function kontaktMailto(
  epost: string,
  amne?: string,
  brodtext?: string,
): string {
  const subject = encodeURIComponent(amne?.trim() || "Styrelse-Navet");
  const body = brodtext?.trim()
    ? `&body=${encodeURIComponent(brodtext.trim())}`
    : "";
  return `mailto:${epost}?subject=${subject}${body}`;
}
