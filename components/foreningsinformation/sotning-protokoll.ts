import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

export type SotningProtokollMapp = {
  id: string;
  titel: string;
  skapad: string;
};

export type SotningProtokollDokument = {
  id: string;
  filnamn: string;
  /** Datum för sotningen eller protokollet (YYYY-MM-DD) */
  datum: string;
  uppladdad: string;
};

export type SotningProtokollUndermappState = {
  öppen: boolean;
  dokument: SotningProtokollDokument[];
};

export type SotningProtokollState = {
  mappDefinitioner: SotningProtokollMapp[];
  undermappar: Record<string, SotningProtokollUndermappState>;
};

const SOTNING_PROTOKOLL_BASE = "brf-forening-sotning-protokoll";

export function sotningProtokollStorageKey(): string {
  return foreningStorageKey(SOTNING_PROTOKOLL_BASE);
}

export function skapaSotningMappId(): string {
  return `sotning-mapp-${Date.now()}`;
}

export function skapaSotningDokumentId(): string {
  return `sotning-doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function tomSotningProtokollState(): SotningProtokollState {
  return { mappDefinitioner: [], undermappar: {} };
}

export function lasSotningProtokoll(): SotningProtokollState {
  if (typeof window === "undefined") return tomSotningProtokollState();
  try {
    const raw = localStorage.getItem(sotningProtokollStorageKey());
    if (!raw) return tomSotningProtokollState();
    const parsed = JSON.parse(raw) as SotningProtokollState;
    return {
      mappDefinitioner: parsed.mappDefinitioner ?? [],
      undermappar: parsed.undermappar ?? {},
    };
  } catch {
    return tomSotningProtokollState();
  }
}

export function sparaSotningProtokoll(state: SotningProtokollState): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(
    sotningProtokollStorageKey(),
    JSON.stringify(state),
  ).ok;
}

export function antalSotningProtokollDokument(state: SotningProtokollState): number {
  return Object.values(state.undermappar).reduce(
    (sum, mapp) => sum + mapp.dokument.length,
    0,
  );
}

export function formateraProtokollDatum(isoDatum: string): string {
  if (!isoDatum) return "—";
  const [år, månad, dag] = isoDatum.split("-");
  if (!år || !månad || !dag) return isoDatum;
  return `${år}-${månad}-${dag}`;
}

export function sorteraProtokollDokument(
  lista: SotningProtokollDokument[],
): SotningProtokollDokument[] {
  return [...lista].sort((a, b) => b.datum.localeCompare(a.datum));
}
