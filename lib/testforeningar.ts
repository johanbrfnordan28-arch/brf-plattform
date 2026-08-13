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
import {
  hamtaAntalLagenheterFranGrund,
  normaliseraGrund,
  uppdateraPlanTitelMedLagenheter,
} from "@/components/underhallsplan/grund-synk";
import {
  harUnderhallsplanSparat,
  sparaUnderhallsplanState,
  type UnderhallsplanLagratState,
} from "@/components/underhallsplan/underhallsplan-lager";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { normaliseraPlaninstallningar } from "@/components/underhallsplan/planinstallningar";
import {
  appliceraSailorGrund,
  arSailorForening,
  SAILOR_FORENING_ID,
  SAILOR_PLAN_START_AR,
  SAILOR_PROFIL,
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";
import { byggSailorKomponentUtkast } from "@/lib/sailor-underhallsplan-utkast";

export { arStandardTestForening };
export { SAILOR_FORENING_ID };

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
    namn: "Brf Nordan 28",
    testplanId: "test-90" satisfies TestplanId,
  },
  {
    id: SAILOR_FORENING_ID,
    namn: "Bostadsrättsföreningen Sailor",
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
  const bas: ForeningProfil = {
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
  if (arSailorForening(id)) {
    return { ...bas, ...SAILOR_PROFIL };
  }
  return bas;
}

function appliceraSailorProfil(profil: ForeningProfil): ForeningProfil {
  return {
    ...profil,
    namn: "Bostadsrättsföreningen Sailor",
    ...SAILOR_PROFIL,
  };
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

const UNDERHALLSPLAN_KEY_BASE = "brf-underhallsplan-state";

/** Uppdaterar Sailors grund och underhållsutkast även om planen redan sparats. */
function synkaSailorUnderhallsplanGrund(): void {
  if (typeof window === "undefined") return;
  const key = foreningStorageKey(UNDERHALLSPLAN_KEY_BASE, SAILOR_FORENING_ID);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as UnderhallsplanLagratState;
    if (!parsed?.grund) return;
    const grund = normaliseraGrund(appliceraSailorGrund(parsed.grund));
    const lgh = hamtaAntalLagenheterFranGrund(grund);
    const planNamn = uppdateraPlanTitelMedLagenheter(
      parsed.planNamn?.trim() || "Bostadsrättsföreningen Sailor",
      lgh,
    );
    const utkast = byggSailorKomponentUtkast();
    sparaUnderhallsplanState(
      {
        ...parsed,
        grund,
        planNamn,
        planNotering: utkast.planNotering,
        activeComponents: utkast.activeComponents,
        komponentDetaljer: utkast.komponentDetaljer,
        samfallighetsavgift: utkast.samfallighetsavgift,
        besiktningar: utkast.besiktningar,
        krPerKvmAr: utkast.krPerKvmAr,
        varderingsUnderlag: SAILOR_VARDERING_UNDERLAG,
        planinstallningar: normaliseraPlaninstallningar({
          ...(parsed.planinstallningar ?? {
            planStartAr: String(SAILOR_PLAN_START_AR),
            planLangdAr: "50",
          }),
          planStartAr: String(SAILOR_PLAN_START_AR),
        }),
        grundSaved: true,
        komponenterSaved: true,
        besiktningarSaved: true,
        sparad: new Date().toISOString(),
      },
      SAILOR_FORENING_ID,
    );
  } catch {
    /* behåll rådata */
  }
}

/**
 * Säkerställer att alla fem testföreningar finns i registret.
 * Behåller användarens sparade namn/uppgifter — skriver bara över startnamn.
 * Sailor får alltid fasta kontakt- och grunduppgifter.
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
    } else if (arSailorForening(def.id)) {
      profil = appliceraSailorProfil({ ...befintlig, id: def.id });
    } else {
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

  synkaSailorUnderhallsplanGrund();

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
