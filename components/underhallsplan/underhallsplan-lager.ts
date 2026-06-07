import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
  type LocalStorageSetError,
} from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  normaliseraPlaninstallningar,
  standardPlaninstallningar,
  type Planinstallningar,
} from "@/components/underhallsplan/planinstallningar";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import type { TestplanId } from "@/components/underhallsplan/testplaner";
import type { Samfallighetsavgift } from "@/components/underhallsplan/samfallighetsavgift";
import type {
  Grunduppgifter,
  RenoveringSammanfattning,
} from "@/components/underhallsplan/types";

export const UNDERHALLSPLAN_STATE_EVENT = "underhallsplan-state-uppdaterad";

const STORAGE_KEY_BASE = "brf-underhallsplan-state";

function storageKey(): string {
  return foreningStorageKey(STORAGE_KEY_BASE);
}
const LAGER_VERSION = 1;

export type UnderhallsplanLagratState = {
  version: typeof LAGER_VERSION;
  sparad: string;
  aktivTestplan: TestplanId | null;
  planNamn: string | null;
  planNotering: string | null;
  grund: Grunduppgifter;
  planinstallningar: Planinstallningar;
  grundSaved: boolean;
  renoveringarSaved: boolean;
  komponenterSaved: boolean;
  besiktningarSaved: boolean;
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  besiktningar: Besiktning[];
  /** Valfritt — äldre sparade planer saknar fältet. */
  samfallighetsavgift?: Samfallighetsavgift;
  renoveringarLista: UtfördRenovering[];
  renoveringSammanfattning: RenoveringSammanfattning | null;
  krPerKvmAr: number;
};

export function harUnderhallsplanSparat(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(storageKey()));
}

function uppgraderaUnderhallsplanState(
  parsed: Partial<UnderhallsplanLagratState>,
): UnderhallsplanLagratState | null {
  if (!parsed.grund || !Array.isArray(parsed.activeComponents)) return null;
  return {
    version: LAGER_VERSION,
    sparad: parsed.sparad ?? new Date().toISOString(),
    aktivTestplan: parsed.aktivTestplan ?? null,
    planNamn: parsed.planNamn ?? null,
    planNotering: parsed.planNotering ?? null,
    grund: parsed.grund,
    planinstallningar: parsed.planinstallningar
      ? normaliseraPlaninstallningar({
          ...standardPlaninstallningar(),
          ...parsed.planinstallningar,
          planStartAr:
            parsed.planinstallningar.planStartAr ??
            standardPlaninstallningar().planStartAr,
          planLangdAr:
            parsed.planinstallningar.planLangdAr ??
            standardPlaninstallningar().planLangdAr,
        })
      : standardPlaninstallningar(),
    grundSaved: parsed.grundSaved ?? false,
    renoveringarSaved: parsed.renoveringarSaved ?? false,
    komponenterSaved: parsed.komponenterSaved ?? false,
    besiktningarSaved: parsed.besiktningarSaved ?? false,
    activeComponents: parsed.activeComponents,
    komponentDetaljer: parsed.komponentDetaljer ?? {},
    besiktningar: parsed.besiktningar ?? [],
    samfallighetsavgift: parsed.samfallighetsavgift,
    renoveringarLista: parsed.renoveringarLista ?? [],
    renoveringSammanfattning: parsed.renoveringSammanfattning ?? null,
    krPerKvmAr: parsed.krPerKvmAr ?? 0,
  };
}

export function lasUnderhallsplanState(): UnderhallsplanLagratState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UnderhallsplanLagratState>;
    if (!parsed) return null;
    if (parsed.version === LAGER_VERSION && parsed.grund && Array.isArray(parsed.activeComponents)) {
      return parsed as UnderhallsplanLagratState;
    }
    return uppgraderaUnderhallsplanState(parsed);
  } catch {
    return null;
  }
}

/** Behåller ifyllda grunduppgifter och komponenter vid plattformsuppdatering. */
export function migreraUnderhallsplanForForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  const key = foreningStorageKey(STORAGE_KEY_BASE, foreningId);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<UnderhallsplanLagratState>;
    const uppgraderad = uppgraderaUnderhallsplanState(parsed);
    if (uppgraderad) {
      safeSetLocalStorage(key, JSON.stringify(uppgraderad));
    }
  } catch {
    /* behåll rådata */
  }
}

export type SparaUnderhallsplanResult =
  | { ok: true; sparad: string }
  | { ok: false; error: LocalStorageSetError; message: string };

export function sparaUnderhallsplanState(
  state: UnderhallsplanLagratState,
): SparaUnderhallsplanResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "unavailable",
      message: localStorageFelMeddelande("unavailable"),
    };
  }
  const result = safeSetLocalStorage(storageKey(), JSON.stringify(state));
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      message: localStorageFelMeddelande(result.error),
    };
  }
  window.dispatchEvent(new CustomEvent(UNDERHALLSPLAN_STATE_EVENT));
  return { ok: true, sparad: state.sparad };
}

export function rensaUnderhallsplanState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey());
  window.dispatchEvent(new CustomEvent(UNDERHALLSPLAN_STATE_EVENT));
}
