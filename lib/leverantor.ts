/**
 * Avtalspart / personuppgiftsansvarig — Svea Ingenjörsbyrå AB
 * som tillhandahåller plattformen Styrelse-Navet.
 */

export const LEVERANTOR = {
  namn: "Svea Ingenjörsbyrå AB",
  organisationsnummer: "559085-2702",
  gatuadress: "Bollmorabacken 17",
  postnummer: "135 38",
  ort: "TYRESÖ",
  varumarke: "Styrelse-Navet",
} as const;

export function leverantorPostadress(): string {
  return `${LEVERANTOR.gatuadress}, ${LEVERANTOR.postnummer} ${LEVERANTOR.ort}`;
}

/** En rad för avtals- och villkorstexter. */
export function leverantorRad(): string {
  return `${LEVERANTOR.namn}, org.nr ${LEVERANTOR.organisationsnummer}, ${leverantorPostadress()}`;
}
