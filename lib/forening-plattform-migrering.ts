import { safeSetLocalStorage } from "@/lib/localStorage";
import { listaAllaForeningIds } from "@/lib/forening-registry";
import { migreraRonderingStateForForening } from "@/components/rondering/rondering-lager";
import {
  migreraSigneringSchemaForForening,
  slaInNyaGrundmallPunktIdsForForening,
} from "@/components/rondering/signering-schema";
import { migreraUnderhallsplanForForening } from "@/components/underhallsplan/underhallsplan-lager";

/** Öka vid strukturella plattformsändringar (nya mallpunkter, fält, normalisering). */
export const PLATTFORM_VERSION = 1;

const MIGRERING_STATE_KEY = "brf-plattform-migreringar";

type MigreringsState = Record<string, number>;

function lasMigreringsState(): MigreringsState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MIGRERING_STATE_KEY);
    return raw ? (JSON.parse(raw) as MigreringsState) : {};
  } catch {
    return {};
  }
}

function sparaMigreringsState(state: MigreringsState): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(MIGRERING_STATE_KEY, JSON.stringify(state));
}

export function hamtaMigreradPlattformVersion(foreningId: string): number {
  return lasMigreringsState()[foreningId] ?? 0;
}

function sattMigreradPlattformVersion(foreningId: string, version: number): void {
  const state = lasMigreringsState();
  state[foreningId] = version;
  sparaMigreringsState(state);
}

type PlattformMigrering = {
  version: number;
  beskrivning: string;
  kor: (foreningId: string) => void;
};

/**
 * Varje migrering får endast lägga till / normalisera — aldrig rensa användarens
 * ifyllda fält, avvikelser, egna punkter eller inaktiverade val.
 */
const PLATTFORM_MIGRERINGAR: PlattformMigrering[] = [
  {
    version: 1,
    beskrivning:
      "Normaliserar sparad rondering, signeringsschema och underhållsplan per förening.",
    kor: (foreningId) => {
      migreraSigneringSchemaForForening(foreningId);
      migreraRonderingStateForForening(foreningId);
      migreraUnderhallsplanForForening(foreningId);
    },
  },
];

export function korPlattformMigreringarForForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  let v = hamtaMigreradPlattformVersion(foreningId);
  for (const m of PLATTFORM_MIGRERINGAR) {
    if (m.version <= v) continue;
    m.kor(foreningId);
    v = m.version;
    sattMigreradPlattformVersion(foreningId, v);
  }
  if (v < PLATTFORM_VERSION) {
    sattMigreradPlattformVersion(foreningId, PLATTFORM_VERSION);
  }
}

/** Körs vid inlogg på föreningssidor — uppdaterar alla föreningar parallellt i localStorage. */
export function korPlattformMigreringarForAllaForeningar(): void {
  for (const id of listaAllaForeningIds()) {
    korPlattformMigreringarForForening(id);
  }
}

/**
 * Anropas från en framtida migrering när nya grundmall-punkter lagts i koden.
 * Lägger till nya id:n i aktiva punkter; tar inte bort avstängda eller egna moment.
 */
export function appliceraNyaGrundmallPunkterPaAllaForeninger(
  nyaIds: Partial<Record<"fastighetsskotare" | "stadning", string[]>>,
): void {
  for (const id of listaAllaForeningIds()) {
    for (const roll of ["fastighetsskotare", "stadning"] as const) {
      const lista = nyaIds[roll];
      if (lista?.length) {
        slaInNyaGrundmallPunktIdsForForening(id, roll, lista);
      }
    }
  }
}
