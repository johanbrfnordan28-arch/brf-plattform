/**
 * Avtalspart / personuppgiftsansvarig — Svea Ingenjörsbyrå AB
 * som tillhandahåller plattformen Styrelse-Navet.
 */

import { svenskAdressRader } from "@/lib/svensk-adress";

export const LEVERANTOR = {
  namn: "Svea Ingenjörsbyrå AB",
  organisationsnummer: "559085-2702",
  gatuadress: "Bollmorabacken 17",
  postnummer: "135 38",
  ort: "TYRESÖ",
  varumarke: "Styrelse-Navet",
} as const;

/** Gatadress på egen rad, postnummer och ort på nästa. */
export function leverantorAdressRader(): string[] {
  return svenskAdressRader({
    gata: LEVERANTOR.gatuadress,
    postnummer: LEVERANTOR.postnummer,
    ort: LEVERANTOR.ort,
  });
}

export function leverantorPostadress(): string {
  return leverantorAdressRader().join(", ");
}

/** En rad för avtals- och villkorstexter. */
export function leverantorRad(): string {
  return `${LEVERANTOR.namn}, org.nr ${LEVERANTOR.organisationsnummer}, ${leverantorPostadress()}`;
}
