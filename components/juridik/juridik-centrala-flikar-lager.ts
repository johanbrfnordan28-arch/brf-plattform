import { hamtaCentralaDomar } from "@/components/juridik/juridik-centralt-bibliotek";
import { domMappar } from "@/components/juridik/domar";
import type { EgenJuridikDokument } from "@/components/juridik/juridik-egna-mappar-lager";
import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

export type CentralDomFlik = {
  id: string;
  titel: string;
  beskrivning: string;
  vägledning: string;
  skapadTidpunkt: string;
  dokument: EgenJuridikDokument[];
};

export type CentralaDomFlikarState = {
  version: 1;
  flikar: CentralDomFlik[];
};

export const CENTRALA_DOMFLIKAR_KEY = "brf-juridik-centrala-domflikar";
export const CENTRALA_DOMFLIKAR_EVENT = "juridik-centrala-domflikar-uppdaterad";

function storageKey(): string {
  return foreningStorageKey(CENTRALA_DOMFLIKAR_KEY, GRUNDMALL_FORENING_ID);
}

function skapaSeedFranDomMappar(): CentralaDomFlikarState {
  return {
    version: 1,
    flikar: domMappar.map((mapp) => ({
      id: mapp.id,
      titel: mapp.titel,
      beskrivning: mapp.beskrivning,
      vägledning: mapp.vägledning,
      skapadTidpunkt: new Date().toISOString(),
      dokument: hamtaCentralaDomar(mapp.id),
    })),
  };
}

function normaliseraState(raw: unknown): CentralaDomFlikarState {
  if (!raw || typeof raw !== "object") return skapaSeedFranDomMappar();
  const data = raw as Partial<CentralaDomFlikarState>;
  if (!Array.isArray(data.flikar) || data.flikar.length === 0) {
    return skapaSeedFranDomMappar();
  }
  return {
    version: 1,
    flikar: data.flikar.map(
      (f): CentralDomFlik => ({
        id: f.id ?? skapaCentralFlikId(),
        titel: f.titel ?? "",
        beskrivning: f.beskrivning ?? "",
        vägledning: f.vägledning ?? "",
        skapadTidpunkt: f.skapadTidpunkt ?? new Date().toISOString(),
        dokument: Array.isArray(f.dokument) ? f.dokument : [],
      }),
    ),
  };
}

/** Läser centrala domflikar från grundmodulen — samma data visas publikt på BRF Navet. */
export function lasCentralaDomFlikar(): CentralaDomFlikarState {
  if (typeof window === "undefined") return skapaSeedFranDomMappar();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return skapaSeedFranDomMappar();
    return normaliseraState(JSON.parse(raw));
  } catch {
    return skapaSeedFranDomMappar();
  }
}

export function sparaCentralaDomFlikar(state: CentralaDomFlikarState): void {
  safeSetLocalStorage(storageKey(), JSON.stringify(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CENTRALA_DOMFLIKAR_EVENT));
  }
}

export function skapaCentralFlikId(): string {
  return `domflik-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaCentraltDokumentId(): string {
  return `domdok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
