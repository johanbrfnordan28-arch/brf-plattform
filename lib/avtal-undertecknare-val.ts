import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";

export const AVTAL_UNDERTECKNARE_ANTAL = 2;

const STORAGE_BASE = "brf-avtal-undertecknare";

export type AvtalsUndertecknareVal = {
  ledamotId: string;
  namn: string;
  roll: string;
  epost: string;
};

export function tomAvtalsUndertecknare(): AvtalsUndertecknareVal {
  return { ledamotId: "", namn: "", roll: "", epost: "" };
}

export function undertecknareFranLedamot(
  ledamot: StyrelseLedamot,
): AvtalsUndertecknareVal {
  return {
    ledamotId: ledamot.id,
    namn: ledamot.namn.trim(),
    roll: ledamot.roll.trim(),
    epost: ledamot.epost.trim(),
  };
}

/** De två första namngivna ledamöterna, annars tomma platser. */
export function standardAvtalsUndertecknare(
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  const namngivna = ledamoter.filter((l) => l.namn.trim());
  const valda = namngivna
    .slice(0, AVTAL_UNDERTECKNARE_ANTAL)
    .map(undertecknareFranLedamot);
  while (valda.length < AVTAL_UNDERTECKNARE_ANTAL) {
    valda.push(tomAvtalsUndertecknare());
  }
  return valda;
}

function arVal(value: unknown): value is AvtalsUndertecknareVal {
  if (!value || typeof value !== "object") return false;
  const rad = value as Record<string, unknown>;
  return (
    typeof rad.namn === "string" &&
    typeof rad.epost === "string" &&
    typeof rad.roll === "string"
  );
}

export function lasAvtalsUndertecknare(
  foreningId: string,
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  const standard = standardAvtalsUndertecknare(ledamoter);
  if (typeof window === "undefined") return standard;
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_BASE, foreningId));
    if (!raw) return standard;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return standard;
    const rader = parsed.filter(arVal).slice(0, AVTAL_UNDERTECKNARE_ANTAL);
    while (rader.length < AVTAL_UNDERTECKNARE_ANTAL) {
      rader.push(tomAvtalsUndertecknare());
    }
    return rader.map((rad) => ({
      ledamotId: typeof rad.ledamotId === "string" ? rad.ledamotId : "",
      namn: rad.namn,
      roll: rad.roll,
      epost: rad.epost,
    }));
  } catch {
    return standard;
  }
}

export function sparaAvtalsUndertecknare(
  foreningId: string,
  personer: AvtalsUndertecknareVal[],
): void {
  const rader = personer.slice(0, AVTAL_UNDERTECKNARE_ANTAL);
  while (rader.length < AVTAL_UNDERTECKNARE_ANTAL) {
    rader.push(tomAvtalsUndertecknare());
  }
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_BASE, foreningId),
    JSON.stringify(rader),
  );
}

export function undertecknareSaknas(person: AvtalsUndertecknareVal): boolean {
  return !person.namn.trim();
}
