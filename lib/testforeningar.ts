import { arStandardTestForening } from "@/lib/forening-konstanter";
import { byggLagratStateFranTestplan } from "@/lib/investerar-demo-seed";
import {
  FORENING_AKTIV_EVENT,
  lasForeningProfil,
  rensaForeningLocalStorage,
  repareraForeningRegistry,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { forberedNyForening } from "@/lib/kopiera-grundmall-data";
import type { TestplanId } from "@/components/underhallsplan/testplaner";
import { harUnderhallsplanSparat, sparaUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";

export { arStandardTestForening };

/** Fem fasta testföreningar — alltid synliga vid inloggning, data isoleras per id. */
export const STANDARD_TESTFORENINGAR = [
  {
    id: "test-forening-1",
    namn: "Brf Test 1",
    testplanId: "test-1900" satisfies TestplanId,
  },
  {
    id: "test-forening-2",
    namn: "Brf Test 2",
    testplanId: "test-90" satisfies TestplanId,
  },
  {
    id: "test-forening-3",
    namn: "Brf Test 3",
    testplanId: "test-70" satisfies TestplanId,
  },
  {
    id: "test-forening-4",
    namn: "Brf Test 4",
    testplanId: "test-90" satisfies TestplanId,
  },
  {
    id: "test-forening-5",
    namn: "Brf Test 5",
    testplanId: "test-50" satisfies TestplanId,
  },
] as const;

export type StandardTestForeningId =
  (typeof STANDARD_TESTFORENINGAR)[number]["id"];

export const ANTAL_STANDARD_TESTFORENINGAR = STANDARD_TESTFORENINGAR.length;

const TESTPLAN_PER_FORENING: Record<string, TestplanId> = Object.fromEntries(
  STANDARD_TESTFORENINGAR.map((t) => [t.id, t.testplanId]),
);

/** Startnamn «Brf Test N» eller äldre «Brf Test N — …» — byts ut mot rent startnamn. */
export function arStandardTestStartNamn(namn: string): boolean {
  return /^Brf Test \d+(\s*[—–-].*)?$/i.test(namn.trim());
}

export function hamtaStandardTestForeningTestplan(
  foreningId: string,
): TestplanId | null {
  return TESTPLAN_PER_FORENING[foreningId] ?? null;
}

function tomStandardProfil(id: string, namn: string): ForeningProfil {
  return {
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
    organisationsnummer: "",
    epost: "",
    postadress: "",
    ort: "",
    kontaktperson: "",
    grundinfoPaborjad: false,
  };
}

function seedTestForeningOmTom(foreningId: string, testplanId: TestplanId): void {
  if (harUnderhallsplanSparat(foreningId)) return;
  forberedNyForening(foreningId);
  sparaUnderhallsplanState(
    byggLagratStateFranTestplan(testplanId),
    foreningId,
  );
}

/**
 * Säkerställer att alla fem testföreningar finns i registret.
 * Behåller användarens sparade namn/uppgifter — skriver bara över startnamn.
 */
export function sakraStandardTestForeningar(): ForeningProfil[] {
  if (typeof window === "undefined") {
    return STANDARD_TESTFORENINGAR.map((t) => tomStandardProfil(t.id, t.namn));
  }

  repareraForeningRegistry();
  const resultat: ForeningProfil[] = [];

  for (const def of STANDARD_TESTFORENINGAR) {
    const befintlig = lasForeningProfil(def.id);
    let profil: ForeningProfil;
    if (!befintlig) {
      profil = tomStandardProfil(def.id, def.namn);
    } else {
      // Användarens inmatade föreningsnamn behålls; annars «Brf Test N».
      const namn =
        befintlig.namn.trim() && !arStandardTestStartNamn(befintlig.namn)
          ? befintlig.namn.trim()
          : def.namn;
      profil = { ...befintlig, id: def.id, namn };
    }
    sparaForeningProfil(profil, { tyst: true });
    seedTestForeningOmTom(def.id, def.testplanId);
    resultat.push(profil);
  }

  return resultat;
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
