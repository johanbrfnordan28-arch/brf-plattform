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

/**
 * Grunduppgifter — enligt årsredovisning 2024
 * (40 bostadsrätter, 2 756 kvm, Gustavsberg 1:395).
 */
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
  boarea: "2 756",
  antalLagenheter: "40",
  antalVaningar: "4",
  antalByggnader: "3",
  byggar: "2013",
  uppvarmning: "Fjärrvärme",
  /** OVK 2026: FX — frånluft med värmeåtervinning (inte FTX). */
  ventilationssystem: "FX — frånluftsfläkt med värmeåtervinning",
  fastighetsbeteckning: "Gustavsberg 1:395",
  adresser: ["Publikvägen 25", "Publikvägen 27", "Publikvägen 29"],
};

/**
 * Internt värderingsunderlag — får ALDRIG visas för föreningen.
 * Källa: årsredovisning 2024, not 10 Byggnad och mark.
 */
export const SAILOR_VARDERING_UNDERLAG: FastighetsVarderingsUnderlag = {
  taxeringsvardeByggnadKr: 54_000_000,
  taxeringsvardeMarkKr: 14_400_000,
  anskaffningsvardeTotaltKr: 104_605_000,
  markAnskaffningsvardeKr: 22_158_148,
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
