import {
  arStandardTestForening,
} from "@/lib/forening-konstanter";
import { byggLagratStateFranTestplan } from "@/lib/investerar-demo-seed";
import {
  FORENING_AKTIV_EVENT,
  lasForeningProfil,
  normaliseraForeningProfil,
  rensaForeningLocalStorage,
  repareraForeningRegistry,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { forberedNyForening } from "@/lib/kopiera-grundmall-data";
import type { TestplanId } from "@/components/underhallsplan/testplaner";
import {
  harUnderhallsplanSparat,
  sparaUnderhallsplanState,
} from "@/components/underhallsplan/underhallsplan-lager";
import { SAILOR_FORENING_ID } from "@/lib/sailor-forening";

export { arStandardTestForening };
export { SAILOR_FORENING_ID };

/** Inga fasta demoföreningar — Trazie/Nordan m.fl. är avvecklade. */
export const STANDARD_TESTFORENINGAR: readonly {
  id: string;
  namn: string;
  testplanId: TestplanId;
}[] = [];

export type StandardTestForeningId = string;

export const ANTAL_STANDARD_TESTFORENINGAR = STANDARD_TESTFORENINGAR.length;

const TESTPLAN_PER_FORENING: Record<string, TestplanId> = Object.fromEntries(
  STANDARD_TESTFORENINGAR.map((t) => [t.id, t.testplanId]),
);

/** Startnamn «Brf Test N» (äldre demoföreningar) — byts ut mot rent startnamn. */
export function arStandardTestStartNamn(namn: string): boolean {
  return /^Brf Test \d+(\s*[—–-].*)?$/i.test(namn.trim());
}

export function hamtaStandardTestForeningTestplan(
  foreningId: string,
): TestplanId | null {
  return TESTPLAN_PER_FORENING[foreningId] ?? null;
}

function tomStandardProfil(id: string, namn: string): ForeningProfil {
  return normaliseraForeningProfil({
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
  });
}

function seedTestForeningOmTom(foreningId: string, testplanId: TestplanId): void {
  if (harUnderhallsplanSparat(foreningId)) return;
  forberedNyForening(foreningId);
  const namn = lasForeningProfil(foreningId)?.namn;
  sparaUnderhallsplanState(
    byggLagratStateFranTestplan(testplanId, namn, { foreningId }),
    foreningId,
  );
}

/**
 * Avvecklade demoföreningar (Trazie m.fl.) rensas via repareraForeningRegistry.
 * Returnerar alltid tom lista.
 */
export function sakraStandardTestForeningar(): ForeningProfil[] {
  if (typeof window === "undefined") return [];
  repareraForeningRegistry();
  return [];
}

/** Testföreningar i fast ordning för inloggningssidan. */
export function listaInloggningsTestForeningar(): ForeningProfil[] {
  return sakraStandardTestForeningar();
}

/** Rensar all moduldata för en standard-testförening men behåller platsen i listan. */
export function rensaStandardTestForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  if (!arStandardTestForening(foreningId)) return;

  const def = STANDARD_TESTFORENINGAR.find((t) => t.id === foreningId);
  if (!def) return;

  rensaForeningLocalStorage(foreningId);
  sparaForeningProfil(tomStandardProfil(def.id, def.namn), { tyst: true });
  seedTestForeningOmTom(def.id, def.testplanId);
  window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
}
