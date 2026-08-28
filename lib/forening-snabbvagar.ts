/**
 * Sparar vilka fyra snabbvägsmoduler som visas först på föreningssidan.
 * Per förening i localStorage.
 */

import {
  FORENING_MODULER,
  SNABBVAG_ANTAL,
  STANDARD_SNABBVAG_IDS,
} from "@/lib/forening-moduler";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

const STORAGE_BASE = "brf-snabbvagar-moduler";

export const SNABBVAGAR_EVENT = "brf-snabbvagar-uppdaterad";

function giltigId(id: string): boolean {
  return FORENING_MODULER.some((m) => m.id === id);
}

export function normaliseraSnabbvagIds(ids: string[]): string[] {
  const sedda = new Set<string>();
  const rena: string[] = [];
  for (const id of ids) {
    if (!giltigId(id) || sedda.has(id)) continue;
    sedda.add(id);
    rena.push(id);
    if (rena.length >= SNABBVAG_ANTAL) break;
  }
  for (const fallback of [
    ...STANDARD_SNABBVAG_IDS,
    ...FORENING_MODULER.map((m) => m.id),
  ]) {
    if (rena.length >= SNABBVAG_ANTAL) break;
    if (sedda.has(fallback)) continue;
    sedda.add(fallback);
    rena.push(fallback);
  }
  return rena.slice(0, SNABBVAG_ANTAL);
}

export function lasSnabbvagIds(foreningId?: string): string[] {
  if (typeof window === "undefined") {
    return [...STANDARD_SNABBVAG_IDS];
  }
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_BASE, foreningId));
    if (!raw) return [...STANDARD_SNABBVAG_IDS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...STANDARD_SNABBVAG_IDS];
    return normaliseraSnabbvagIds(parsed.map(String));
  } catch {
    return [...STANDARD_SNABBVAG_IDS];
  }
}

export function sparaSnabbvagIds(ids: string[], foreningId?: string): void {
  const rena = normaliseraSnabbvagIds(ids);
  const key = foreningStorageKey(STORAGE_BASE, foreningId);
  safeSetLocalStorage(key, JSON.stringify(rena));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SNABBVAGAR_EVENT));
  }
}

export function flyttaSnabbvag(
  ids: string[],
  index: number,
  riktning: -1 | 1,
): string[] {
  const next = [...ids];
  const till = index + riktning;
  if (till < 0 || till >= next.length) return next;
  const tmp = next[index]!;
  next[index] = next[till]!;
  next[till] = tmp;
  return next;
}

export function bytSnabbvagModul(
  ids: string[],
  index: number,
  nyModulId: string,
): string[] {
  if (!giltigId(nyModulId)) return ids;
  if (ids.includes(nyModulId) && ids[index] !== nyModulId) return ids;
  const next = [...ids];
  next[index] = nyModulId;
  return normaliseraSnabbvagIds(next);
}
