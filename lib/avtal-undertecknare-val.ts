import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";

export const AVTAL_UNDERTECKNARE_ANTAL = 2;

const STORAGE_BASE = "brf-avtal-undertecknare";

export const AVTAL_UNDERTECKNARE_EVENT = "brf-avtal-undertecknare";

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

function fyllTillAntal(
  rader: AvtalsUndertecknareVal[],
): AvtalsUndertecknareVal[] {
  const valda = rader.slice(0, AVTAL_UNDERTECKNARE_ANTAL);
  while (valda.length < AVTAL_UNDERTECKNARE_ANTAL) {
    valda.push(tomAvtalsUndertecknare());
  }
  return valda;
}

/** Personer som kryssats i på ledamoten. */
export function undertecknareFranMarkerade(
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  return fyllTillAntal(
    ledamoter
      .filter((ledamot) => ledamot.signerarAvtal && ledamot.namn.trim())
      .slice(0, AVTAL_UNDERTECKNARE_ANTAL)
      .map(undertecknareFranLedamot),
  );
}

/** De två första namngivna ledamöterna, annars tomma platser. */
export function standardAvtalsUndertecknare(
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  const namngivna = ledamoter.filter((l) => l.namn.trim());
  return fyllTillAntal(
    namngivna.slice(0, AVTAL_UNDERTECKNARE_ANTAL).map(undertecknareFranLedamot),
  );
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

function fraschaMotLedamoter(
  rader: AvtalsUndertecknareVal[],
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  return fyllTillAntal(
    rader.map((rad) => {
      const ledamot = ledamoter.find((l) => l.id === rad.ledamotId);
      if (ledamot?.namn.trim()) return undertecknareFranLedamot(ledamot);
      return {
        ledamotId: rad.ledamotId,
        namn: rad.namn,
        roll: rad.roll,
        epost: rad.epost,
      };
    }),
  );
}

export function lasAvtalsUndertecknare(
  foreningId: string,
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  if (ledamoter.some((ledamot) => ledamot.signerarAvtal)) {
    return undertecknareFranMarkerade(ledamoter);
  }
  const tomt = fyllTillAntal([]);
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(
        foreningStorageKey(STORAGE_BASE, foreningId),
      );
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const rader = parsed
            .filter(arVal)
            .slice(0, AVTAL_UNDERTECKNARE_ANTAL);
          return fraschaMotLedamoter(
            rader.map((rad) => ({
              ledamotId: typeof rad.ledamotId === "string" ? rad.ledamotId : "",
              namn: rad.namn,
              roll: rad.roll,
              epost: rad.epost,
            })),
            ledamoter,
          );
        }
      }
    } catch {
      /* använd kryssen på ledamöterna */
    }
  }
  if (ledamoter.some((ledamot) => ledamot.signerarAvtal)) {
    return undertecknareFranMarkerade(ledamoter);
  }
  return tomt;
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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AVTAL_UNDERTECKNARE_EVENT));
  }
}

/** Skriver de ikryssade ledamöterna till signeringslistan. */
export function synkaAvtalsUndertecknareFranLedamoter(
  foreningId: string,
  ledamoter: StyrelseLedamot[],
): AvtalsUndertecknareVal[] {
  const personer = undertecknareFranMarkerade(ledamoter);
  sparaAvtalsUndertecknare(foreningId, personer);
  return personer;
}

export function undertecknareSaknas(person: AvtalsUndertecknareVal): boolean {
  return !person.namn.trim();
}
