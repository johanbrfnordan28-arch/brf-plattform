import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { hamtaAktivForeningId } from "@/lib/forening-registry";
import {
  arSailorForening,
  SAILOR_HUBB_NAMN,
} from "@/lib/sailor-forening";

/**
 * Hubbnamn på /forening: normalt «Styrelseflow»,
 * för Brf Sailor «Brf Sailor».
 */
export function hamtaHubbNamn(foreningId?: string | null): string {
  const id =
    foreningId === undefined || foreningId === null
      ? typeof window !== "undefined"
        ? hamtaAktivForeningId()
        : null
      : foreningId;
  if (arSailorForening(id)) return SAILOR_HUBB_NAMN;
  return STYRELSEFLOW_NAMN;
}
