import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import {
  arGrundmallForening,
  hamtaAktivForeningId,
  hamtaAktivForeningsNamn,
  lasForeningProfil,
  GRUNDMALL_NAMN,
} from "@/lib/forening-registry";
import {
  arSailorForening,
  SAILOR_HUBB_NAMN,
} from "@/lib/sailor-forening";

/**
 * Hubbnamn högst upp på /forening: föreningens eget namn
 * (köpt sida eller testversion). Trazie fallback «Brf Trazie».
 */
export function hamtaHubbNamn(foreningId?: string | null): string {
  const id =
    foreningId === undefined || foreningId === null
      ? typeof window !== "undefined"
        ? hamtaAktivForeningId()
        : null
      : foreningId;

  if (typeof window !== "undefined") {
    if (id && !arGrundmallForening(id)) {
      const profilNamn = lasForeningProfil(id)?.namn?.trim();
      if (profilNamn) return profilNamn;
    }
    const aktivNamn = hamtaAktivForeningsNamn().trim();
    if (aktivNamn && aktivNamn !== GRUNDMALL_NAMN) return aktivNamn;
  }

  if (arSailorForening(id)) return SAILOR_HUBB_NAMN;
  return STYRELSEFLOW_NAMN;
}
