import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import { filtreraMallarForUpphandling } from "@/components/dokumentbank/mallar";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const DOKUMENTBANK_EGNA_BASE = "brf-dokumentbank-egna";

export const DOKUMENTBANK_EGNA_EVENT = "dokumentbank-egna-uppdaterad";

export function dokumentbankEgnaStorageKey(): string {
  return foreningStorageKey(DOKUMENTBANK_EGNA_BASE);
}

export type EgenDokumentbankMall = DokumentbankMall & {
  uppladdad: string;
};

export function skapaEgenMallId(): string {
  return `egen-${Date.now().toString(36)}`;
}

export function lasEgnaDokumentbankMallar(): EgenDokumentbankMall[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(dokumentbankEgnaStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is EgenDokumentbankMall =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as EgenDokumentbankMall).id === "string" &&
        typeof (item as EgenDokumentbankMall).titel === "string" &&
        typeof (item as EgenDokumentbankMall).filnamn === "string",
    );
  } catch {
    return [];
  }
}

export function sparaEgnaDokumentbankMallar(
  mallar: EgenDokumentbankMall[],
): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    dokumentbankEgnaStorageKey(),
    JSON.stringify(mallar),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(DOKUMENTBANK_EGNA_EVENT));
  }
  return ok;
}

export function läggTillEgenDokumentbankMall(
  filnamn: string,
  titel?: string,
): EgenDokumentbankMall {
  const mall: EgenDokumentbankMall = {
    id: skapaEgenMallId(),
    titel: titel?.trim() || filnamn.replace(/\.[^.]+$/, ""),
    filnamn: filnamn.trim(),
    beskrivning: "Uppladdad av styrelsen i er förenings dokumentbank.",
    omrade: "upphandling",
    uppladdad: new Date().toLocaleDateString("sv-SE"),
  };
  const befintliga = lasEgnaDokumentbankMallar();
  sparaEgnaDokumentbankMallar([mall, ...befintliga]);
  return mall;
}

export function taBortEgenDokumentbankMall(id: string): void {
  sparaEgnaDokumentbankMallar(
    lasEgnaDokumentbankMallar().filter((m) => m.id !== id),
  );
}

/** BRF Företags mallar + föreningens egna uppladdningar. */
export function hamtaAllaUpphandlingsMallar(): DokumentbankMall[] {
  return [...filtreraMallarForUpphandling(), ...lasEgnaDokumentbankMallar()];
}
