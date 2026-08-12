import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Bostadsrättsföreningen Sailor — fast testförenings-id. */
export const SAILOR_FORENING_ID = "test-forening-5";

/** Profiluppgifter som alltid ska vara ifyllda för Sailor. */
export const SAILOR_PROFIL = {
  organisationsnummer: "769623-8166",
  epost: "styrelsen@brf-sailor.se",
  postadress: "Publikvägen 25",
  ort: "134 51 Gustavsberg",
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
> = {
  boarea: "2 756",
  antalLagenheter: "40",
  antalVaningar: "4",
  antalByggnader: "3",
  adresser: ["Publikvägen 25", "Publikvägen 27", "Publikvägen 29"],
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
