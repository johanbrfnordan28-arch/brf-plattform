/** Styrelsemedlemmar på föreningsprofilen — BankID-koppling (demo tills riktig e-legitimation). */

export type StyrelseLedamot = {
  id: string;
  namn: string;
  /** T.ex. Ordförande, Kassör, Ledamot, Suppleant */
  roll: string;
  bankidKopplad: boolean;
  /** ISO-tidpunkt när BankID kopplades (tom om ej kopplad). */
  bankidKoppladTidpunkt: string;
};

export const STYRELSE_ROLLER = [
  "Ordförande",
  "Kassör",
  "Sekreterare",
  "Ledamot",
  "Suppleant",
] as const;

export function skapaStyrelseLedamotId(): string {
  return `led-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function skapaTomStyrelseLedamot(
  delvis?: Partial<StyrelseLedamot>,
): StyrelseLedamot {
  return {
    id: delvis?.id ?? skapaStyrelseLedamotId(),
    namn: typeof delvis?.namn === "string" ? delvis.namn : "",
    roll: typeof delvis?.roll === "string" ? delvis.roll : "Ledamot",
    bankidKopplad: Boolean(delvis?.bankidKopplad),
    bankidKoppladTidpunkt:
      typeof delvis?.bankidKoppladTidpunkt === "string"
        ? delvis.bankidKoppladTidpunkt
        : "",
  };
}

export function normaliseraStyrelseLedamoter(raw: unknown): StyrelseLedamot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((rad): rad is Record<string, unknown> => rad != null && typeof rad === "object")
    .map((rad) =>
      skapaTomStyrelseLedamot({
        id: typeof rad.id === "string" ? rad.id : undefined,
        namn: typeof rad.namn === "string" ? rad.namn : "",
        roll: typeof rad.roll === "string" ? rad.roll : "Ledamot",
        bankidKopplad: Boolean(rad.bankidKopplad),
        bankidKoppladTidpunkt:
          typeof rad.bankidKoppladTidpunkt === "string"
            ? rad.bankidKoppladTidpunkt
            : "",
      }),
    );
}

/** Första namngivna ledamoten — används som kontaktperson i äldre flöden. */
export function forstaKontaktpersonFranStyrelse(
  ledamoter: StyrelseLedamot[],
): string {
  const medNamn = ledamoter.find((l) => l.namn.trim());
  return medNamn?.namn.trim() ?? "";
}
