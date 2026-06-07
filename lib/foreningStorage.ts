import {
  GRUNDMALL_FORENING_ID,
  hamtaAktivForeningId,
} from "@/lib/forening-registry";

/**
 * Prefixerar localStorage-nycklar per förening.
 * Grundmall (demo) behåller befintliga nycklar utan prefix.
 */
export function foreningStorageKey(
  baseKey: string,
  foreningId?: string,
): string {
  const id = foreningId ?? (typeof window !== "undefined" ? hamtaAktivForeningId() : GRUNDMALL_FORENING_ID);
  if (!id || id === GRUNDMALL_FORENING_ID) {
    return baseKey;
  }
  return `brf-f-${id}--${baseKey}`;
}
