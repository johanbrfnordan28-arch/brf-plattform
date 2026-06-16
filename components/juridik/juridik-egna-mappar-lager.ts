import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type EgenJuridikDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

export type EgenJuridikMapp = {
  id: string;
  titel: string;
  beskrivning: string;
  skapadTidpunkt: string;
  dokument: EgenJuridikDokument[];
};

export type EgnaJuridikMapparState = {
  version: 1;
  mappar: EgenJuridikMapp[];
};

// ── Konstanter ───────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-juridik-egna-mappar";
export const EGNA_MAPPAR_EVENT = "juridik-egna-mappar-uppdaterad";

function storageKey(): string {
  return foreningStorageKey(STORAGE_KEY_BASE);
}

// ── Läsa ─────────────────────────────────────────────────────────────────────

export function lasEgnaJuridikMappar(): EgnaJuridikMapparState {
  if (typeof window === "undefined") return { version: 1, mappar: [] };
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return { version: 1, mappar: [] };
    const parsed = JSON.parse(raw) as Partial<EgnaJuridikMapparState>;
    const mappar = Array.isArray(parsed.mappar)
      ? parsed.mappar.map(
          (m): EgenJuridikMapp => ({
            id: m.id ?? skapaEgenMappId(),
            titel: m.titel ?? "",
            beskrivning: m.beskrivning ?? "",
            skapadTidpunkt: m.skapadTidpunkt ?? new Date().toISOString(),
            dokument: Array.isArray(m.dokument) ? m.dokument : [],
          }),
        )
      : [];
    return { version: 1, mappar };
  } catch {
    return { version: 1, mappar: [] };
  }
}

// ── Spara ─────────────────────────────────────────────────────────────────────

export function sparaEgnaJuridikMappar(state: EgnaJuridikMapparState): void {
  safeSetLocalStorage(storageKey(), JSON.stringify(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EGNA_MAPPAR_EVENT));
  }
}

// ── ID-hjälp ──────────────────────────────────────────────────────────────────

export function skapaEgenMappId(): string {
  return `egenmapp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaEgetDokumentId(): string {
  return `egendok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
