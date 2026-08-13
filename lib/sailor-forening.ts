import type { FastighetsVarderingsUnderlag } from "@/components/underhallsplan/fastighets-vardering";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Bostadsrättsföreningen Sailor — fast testförenings-id. */
export const SAILOR_FORENING_ID = "test-forening-5";

/** Profiluppgifter som alltid ska vara ifyllda för Sailor. */
export const SAILOR_PROFIL = {
  organisationsnummer: "769623-8166",
  epost: "styrelsen@brf-sailor.se",
  postadress: "Publikvägen 25",
  ort: "134 39 Gustavsberg",
  kontaktperson: "Trazie Lindberg",
  grundinfoPaborjad: true,
} as const;

/** Grunduppgifter i underhållsplanen — endast Sailor. */
export const SAILOR_GRUND: Pick<
  Grunduppgifter,
  | "boarea"
  | "antalLagenheter"
  | "antalVaningar"
  | "antalByggnader"
  | "adresser"
  | "byggar"
  | "uppvarmning"
  | "ventilationssystem"
  | "fastighetsbeteckning"
> = {
  boarea: "2 900",
  antalLagenheter: "40",
  antalVaningar: "4",
  antalByggnader: "3",
  byggar: "2013",
  uppvarmning: "Fjärrvärme",
  /** OVK 2026: systemtyp F/FX — frånluftsaggregat Exhausto FX (inte FTX). */
  ventilationssystem: "FX — frånluftsfläkt med värmeåtervinning",
  fastighetsbeteckning: "Gustavsberg 1:395",
  adresser: ["Publikvägen 25", "Publikvägen 27", "Publikvägen 29"],
};

/**
 * Internt värderingsunderlag för Sailor — får ALDRIG visas för föreningen.
 * Skalat till 2 756 m² utifrån typiska kr/m² i årsredovisning 2025
 * (taxering / anskaffning / mark) för jämförbar Gustavsbergsfastighet.
 */
export const SAILOR_VARDERING_UNDERLAG: FastighetsVarderingsUnderlag = {
  taxeringsvardeByggnadKr: 66_367_000,
  taxeringsvardeMarkKr: 12_776_000,
  anskaffningsvardeTotaltKr: 142_422_000,
  markAnskaffningsvardeKr: 29_398_000,
};

export function arSailorForening(foreningId?: string | null): boolean {
  return foreningId === SAILOR_FORENING_ID;
}

/** Lägger Sailors fasta grunduppgifter ovanpå befintlig grund. */
export function appliceraSailorGrund(grund: Grunduppgifter): Grunduppgifter {
  return {
    ...grund,
    ...SAILOR_GRUND,
    adresser: [...SAILOR_GRUND.adresser],
  };
}
