import type { KommandeProjekt } from "@/components/underhallsplan/kommande-projekt";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

const STORAGE_KEY_BASE = "brf-underhallsplan-kommande-projekt";

function storageKey(): string {
  return foreningStorageKey(STORAGE_KEY_BASE);
}

export type KommandeProjektLager = {
  projekt: KommandeProjekt[];
};

export function tomtKommandeProjektLager(): KommandeProjektLager {
  return { projekt: [] };
}

export function lasKommandeProjektLager(): KommandeProjektLager {
  if (typeof window === "undefined") return tomtKommandeProjektLager();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return tomtKommandeProjektLager();
    const parsed = JSON.parse(raw) as KommandeProjektLager;
    if (!parsed || !Array.isArray(parsed.projekt)) return tomtKommandeProjektLager();
    return parsed;
  } catch {
    return tomtKommandeProjektLager();
  }
}

export function sparaKommandeProjektLager(lager: KommandeProjektLager): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(storageKey(), JSON.stringify(lager)).ok;
}
