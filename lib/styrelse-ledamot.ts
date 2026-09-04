/** Styrelsemedlemmar på föreningsprofilen — BankID-koppling (demo tills riktig e-legitimation). */

export type StyrelseLedamot = {
  id: string;
  namn: string;
  /** T.ex. Ordförande, Kassör, Ledamot, Suppleant */
  roll: string;
  /** Inloggningsmejl — syns endast för styrelsen, aldrig plattformsadmin. */
  epost: string;
  bankidKopplad: boolean;
  /** ISO-tidpunkt när BankID kopplades (tom om ej kopplad). */
  bankidKoppladTidpunkt: string;
};

export const MAX_STYRELSE_LEDAMOTER = 10;

export const STYRELSE_ROLLER = [
  "Ordförande",
  "Vice ordförande",
  "Sekreterare",
  "Kassör",
  "Förvaltare",
  "Projektledare",
  "Ledamot",
  "Suppleant",
] as const;

export type StyrelseRoll = (typeof STYRELSE_ROLLER)[number];

export function arGiltigStyrelseRoll(roll: string): boolean {
  return (STYRELSE_ROLLER as readonly string[]).includes(roll.trim());
}

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
    epost: typeof delvis?.epost === "string" ? delvis.epost : "",
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
    .slice(0, MAX_STYRELSE_LEDAMOTER)
    .map((rad) =>
      skapaTomStyrelseLedamot({
        id: typeof rad.id === "string" ? rad.id : undefined,
        namn: typeof rad.namn === "string" ? rad.namn : "",
        roll: typeof rad.roll === "string" ? rad.roll : "Ledamot",
        epost: typeof rad.epost === "string" ? rad.epost : "",
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
