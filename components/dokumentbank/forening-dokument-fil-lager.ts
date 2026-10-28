import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

const FIL_LAGER_BASE = "brf-forenings-dokument-filer";

export type SparadDokumentFil = {
  filnamn: string;
  mime: string;
  /** data: URL — demo-lagring i webbläsaren */
  dataUrl: string;
  storlek: number;
  uppladdad: string;
};

type FilLagerState = Record<string, SparadDokumentFil>;

function storageKey(): string {
  return foreningStorageKey(FIL_LAGER_BASE);
}

export const MAX_UPPLADDAD_FIL_STORLEK = 2_500_000;

export function lasDokumentFiler(): FilLagerState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return {};
    return JSON.parse(raw) as FilLagerState;
  } catch {
    return {};
  }
}

function sparaFiler(state: FilLagerState): boolean {
  return safeSetLocalStorage(storageKey(), JSON.stringify(state)).ok;
}

export function hamtaDokumentFil(dokId: string): SparadDokumentFil | null {
  return lasDokumentFiler()[dokId] ?? null;
}

export function sparaDokumentFil(
  dokId: string,
  fil: SparadDokumentFil,
): boolean {
  const all = lasDokumentFiler();
  all[dokId] = fil;
  return sparaFiler(all);
}

export function taBortDokumentFil(dokId: string): void {
  const all = lasDokumentFiler();
  delete all[dokId];
  sparaFiler(all);
}

export function lasFilSomDataUrl(fil: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
    reader.readAsDataURL(fil);
  });
}

export function lasFilSomText(fil: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
    reader.readAsText(fil, "UTF-8");
  });
}
