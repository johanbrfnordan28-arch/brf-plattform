import { KONTAKT_EPOST, kontaktMailto } from "@/lib/kontakt-epost";

/** Publik offertadress — visas i UI och mailto-länkar. */
export const OFFERT_EPOST = KONTAKT_EPOST.offert;

export function offertMailto(amne?: string, brodtext?: string): string {
  return kontaktMailto(
    KONTAKT_EPOST.offert,
    amne?.trim() || "Styrelse-Navet — offertförfrågan",
    brodtext,
  );
}

export function byggOffertForfraganMejl(input: {
  foreningsNamn: string;
  kontaktperson: string;
  epost: string;
  telefon: string;
  antalLagenheter: string;
  tjanster: string[];
  meddelande: string;
}): { amne: string; brodtext: string } {
  return {
    amne: `Ny offertförfrågan — ${input.foreningsNamn}`,
    brodtext: [
      "Ny offertförfrågan via styrelse-navet.se/offert",
      "",
      `Förening: ${input.foreningsNamn}`,
      `Kontaktperson: ${input.kontaktperson}`,
      `E-post: ${input.epost}`,
      input.telefon ? `Telefon: ${input.telefon}` : "",
      input.antalLagenheter ? `Antal lägenheter: ${input.antalLagenheter}` : "",
      "",
      `Tjänster: ${input.tjanster.join(", ")}`,
      input.meddelande ? `\nMeddelande:\n${input.meddelande}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function byggOffertSkickadMejl(input: {
  foreningsNamn: string;
  kontaktperson: string;
  kundEpost: string;
  tjanster: string;
  prisText: string;
  brodtextTillKund: string;
}): { amne: string; brodtext: string } {
  return {
    amne: `Offert skickad — ${input.foreningsNamn}`,
    brodtext: [
      "Offert har förberetts och skickas till kunden.",
      "",
      `Förening: ${input.foreningsNamn}`,
      `Kontakt: ${input.kontaktperson}`,
      `Kundens e-post: ${input.kundEpost}`,
      `Tjänster: ${input.tjanster}`,
      `Pris / upplägg: ${input.prisText}`,
      "",
      "— Mejl till kund —",
      input.brodtextTillKund,
    ].join("\n"),
  };
}
