import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  effektivEnhetspris,
  RIKT_HISS_MODERNISERING_KR,
} from "@/components/underhallsplan/riktpriser";
import {
  HISS_UNDERKOMPONENT_ID,
  type HissPost,
} from "@/components/underhallsplan/hissar";

export function hamtaHissPostEnhetspris(post: HissPost): number {
  return effektivEnhetspris(
    post.uppskattadModerniseringKr,
    RIKT_HISS_MODERNISERING_KR,
  );
}

export function beraknaHissListaPris(poster: HissPost[]): number {
  return poster.reduce((s, p) => s + hamtaHissPostEnhetspris(p), 0);
}

export function hamtaHissKostnadTrapphus(
  trapphusDetalj: KomponentDetaljData | undefined,
): number {
  if (!trapphusDetalj) return 0;
  const rad = trapphusDetalj.underkomponenter.find(
    (r) => r.id === HISS_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  const poster = trapphusDetalj.hissRegister?.[HISS_UNDERKOMPONENT_ID] ?? [];
  return beraknaHissListaPris(poster);
}

export function formateraHissPris(totaltKr: number): string {
  return totaltKr > 0 ? formatKr(totaltKr) : "";
}
