import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import { foreningStorageKey } from "@/lib/foreningStorage";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  lasUnderhallsplanState,
  type UnderhallsplanLagratState,
} from "@/components/underhallsplan/underhallsplan-lager";

const STORAGE_KEY_BASE = "brf-underhallsplan-state";

/** Läser grundmallens underhållsplan (oprefixad nyckel) — påverkar aldrig föreningsdata. */
export function lasGrundmallUnderhallsplanState(): UnderhallsplanLagratState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BASE);
    if (!raw) return null;
    // Återanvänd samma läsning via tillfällig prefix-fri nyckel
    const parsed = JSON.parse(raw) as Partial<UnderhallsplanLagratState>;
    if (
      parsed?.version === 1 &&
      parsed.grund &&
      Array.isArray(parsed.activeComponents)
    ) {
      return parsed as UnderhallsplanLagratState;
    }
    return null;
  } catch {
    return null;
  }
}

export type ImporteraFranGrundmallResultat = {
  tillagdaKomponenter: string[];
  meddelande: string;
};

/**
 * Lägger till komponenter som finns i grundmallen men saknas i föreningens plan.
 * Skriver aldrig tillbaka till grundmallen. Befintliga komponenter/priser behålls.
 */
export function importeraSaknadeKomponenterFranGrundmall(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  aktivForeningId: string,
): {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  resultat: ImporteraFranGrundmallResultat;
} {
  if (
    !aktivForeningId ||
    aktivForeningId === GRUNDMALL_FORENING_ID
  ) {
    return {
      activeComponents,
      komponentDetaljer,
      resultat: {
        tillagdaKomponenter: [],
        meddelande:
          "Importera används i föreningens egen plan — inte i grundmallen.",
      },
    };
  }

  const mall = lasGrundmallUnderhallsplanState();
  if (!mall || mall.activeComponents.length === 0) {
    return {
      activeComponents,
      komponentDetaljer,
      resultat: {
        tillagdaKomponenter: [],
        meddelande:
          "Ingen grundmall-plan hittades. Öppna grundmallen och spara underhållsplanen där först.",
      },
    };
  }

  const tillagda: string[] = [];
  const nastaActive = [...activeComponents];
  const nastaDetaljer = { ...komponentDetaljer };

  for (const namn of mall.activeComponents) {
    if (nastaActive.includes(namn)) continue;
    nastaActive.push(namn);
    tillagda.push(namn);
    const mallData = mall.komponentDetaljer?.[namn];
    if (mallData && !nastaDetaljer[namn]) {
      nastaDetaljer[namn] = structuredClone(mallData);
    }
  }

  // Verifiera att vi inte råkat skriva till grundmall-nyckeln
  void foreningStorageKey(STORAGE_KEY_BASE, aktivForeningId);

  return {
    activeComponents: nastaActive,
    komponentDetaljer: nastaDetaljer,
    resultat: {
      tillagdaKomponenter: tillagda,
      meddelande:
        tillagda.length > 0
          ? `Importerade ${tillagda.length} komponent${tillagda.length === 1 ? "" : "er"} från grundmallen: ${tillagda.join(", ")}.`
          : "Inga nya komponenter att importera — er plan har redan det som finns i grundmallen.",
    },
  };
}

/** Aktuell förenings plan (för jämförelse) — samma som lasUnderhallsplanState. */
export function lasAktivUnderhallsplanState(): UnderhallsplanLagratState | null {
  return lasUnderhallsplanState();
}
