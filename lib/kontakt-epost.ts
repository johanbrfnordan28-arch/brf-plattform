/** Offentliga kontaktadresser till Styrelse-Navet. */

export const KONTAKT_EPOST = {
  johan: "johan@styrelse-navet.se",
  seif: "seif@styrelse-navet.se",
  info: "info@styrelse-navet.se",
  support: "support@styrelse-navet.se",
  offert: "offert@styrelse-navet.se",
} as const;

export type KontaktEpostNyckel = keyof typeof KONTAKT_EPOST;

export const KONTAKT_EPOST_ETIKETTER: Record<KontaktEpostNyckel, string> = {
  johan: "Hjälp & vägledning",
  seif: "Teknisk förvaltning",
  info: "Allmän info",
  support: "Support",
  offert: "Offert",
};

/** Kontaktpersoner kunden kan välja på offertformuläret. */
export const OFFERT_KONTAKTPERSONER = [
  {
    id: "johan",
    namn: "Johan",
    epost: KONTAKT_EPOST.johan,
    beskrivning: "Hjälp, vägledning och plattformen",
  },
  {
    id: "seif",
    namn: "Seif",
    epost: KONTAKT_EPOST.seif,
    beskrivning: "Teknisk förvaltning och besiktning",
  },
  {
    id: "offert",
    namn: "Offertteamet",
    epost: KONTAKT_EPOST.offert,
    beskrivning: "Allmän offert — vi fördelar internt",
  },
] as const;

export type OffertKontaktpersonId = (typeof OFFERT_KONTAKTPERSONER)[number]["id"];

export function hamtaOffertKontaktperson(id: string) {
  return OFFERT_KONTAKTPERSONER.find((p) => p.id === id) ?? null;
}

export function arGiltigOffertKontaktEpost(epost: string): boolean {
  const nyckel = epost.trim().toLowerCase();
  return OFFERT_KONTAKTPERSONER.some((p) => p.epost === nyckel);
}

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
