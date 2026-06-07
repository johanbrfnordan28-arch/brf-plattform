import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  effektivEnhetspris,
  parsePrisKr,
  RIKT_DORR_KR,
  RIKT_FONSTER_KR,
} from "@/components/underhallsplan/riktpriser";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  hamtaDorrMaterialId,
  type DorrMaterialId,
  type DorrPlatAlderId,
  type DorrPlatUnderhallId,
  type DorrTraUnderhallId,
  type FonsterDorrPost,
  type FonsterMaterialId,
  type TraUnderhallId,
} from "@/components/underhallsplan/fonster-dorrar";

export type FonsterDorrPrisRad = {
  postId: string;
  etikett: string;
  antal: number;
  enhetsprisKr: number;
  summaKr: number;
  anvanderRiktpris: boolean;
};

function parseAntal(s: string): number {
  const n = Number.parseInt(s.replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function hamtaRiktFonsterEnhetsprisKr(
  material: FonsterMaterialId,
  traUnderhall?: TraUnderhallId,
): number {
  if (material === "tra") {
    return traUnderhall === "renovering"
      ? RIKT_FONSTER_KR.tra_renovering
      : RIKT_FONSTER_KR.tra_malning;
  }
  return RIKT_FONSTER_KR[material] ?? 15_000;
}

export function hamtaRiktDorrEnhetsprisKr(
  material: DorrMaterialId,
  opts?: {
    dorrTraUnderhall?: DorrTraUnderhallId;
    platAlder?: DorrPlatAlderId;
    dorrPlatUnderhall?: DorrPlatUnderhallId;
  },
): number {
  if (material === "malad-tra" || material === "ek") {
    const key = `${material}_${opts?.dorrTraUnderhall ?? "malning"}`;
    return RIKT_DORR_KR[key] ?? 20_000;
  }
  if (material === "plat") {
    const key =
      (opts?.platAlder ?? "aldre") === "aldre"
        ? "plat_malning"
        : `plat_${opts?.dorrPlatUnderhall ?? "kontroll"}`;
    return RIKT_DORR_KR[key] ?? 2_500;
  }
  return RIKT_DORR_KR[material] ?? 18_000;
}

export function hamtaFonsterPostEnhetspris(
  post: FonsterDorrPost,
  dorr: boolean,
): number {
  if (dorr) {
    const mat = hamtaDorrMaterialId(post) ?? "malad-tra";
    const rikt = hamtaRiktDorrEnhetsprisKr(mat, {
      dorrTraUnderhall: post.dorrTraUnderhall,
      platAlder: post.platAlder,
      dorrPlatUnderhall: post.dorrPlatUnderhall,
    });
    return effektivEnhetspris(post.enhetsprisKr, rikt);
  }
  const mat = post.material ?? "tra";
  const rikt = hamtaRiktFonsterEnhetsprisKr(mat, post.traUnderhall);
  return effektivEnhetspris(post.enhetsprisKr, rikt);
}

export function beraknaFonsterDorrListaPris(
  poster: FonsterDorrPost[],
  dorr: boolean,
): { rader: FonsterDorrPrisRad[]; totaltKr: number } {
  const rader: FonsterDorrPrisRad[] = [];

  for (const post of poster) {
    const antal = parseAntal(post.antal);
    if (antal <= 0 && !post.modulmatt.trim()) continue;
    const enhetsprisKr = hamtaFonsterPostEnhetspris(post, dorr);
    const rikt = dorr
      ? hamtaRiktDorrEnhetsprisKr(hamtaDorrMaterialId(post) ?? "malad-tra", {
          dorrTraUnderhall: post.dorrTraUnderhall,
          platAlder: post.platAlder,
          dorrPlatUnderhall: post.dorrPlatUnderhall,
        })
      : hamtaRiktFonsterEnhetsprisKr(post.material ?? "tra", post.traUnderhall);
    const summaKr = antal > 0 ? Math.round(antal * enhetsprisKr) : 0;
    rader.push({
      postId: post.id,
      etikett: post.modulmatt.trim() || (dorr ? "Dörr" : "Fönster"),
      antal,
      enhetsprisKr,
      summaKr,
      anvanderRiktpris: parsePrisKr(post.enhetsprisKr) <= 0,
    });
  }

  return {
    rader,
    totaltKr: rader.reduce((s, r) => s + r.summaKr, 0),
  };
}

export function hamtaFonsterDorrKostnadFasad(
  fasadDetalj: KomponentDetaljData | undefined,
): { fonster: number; dorrar: number; totalt: number } {
  if (!fasadDetalj) return { fonster: 0, dorrar: 0, totalt: 0 };
  const fonsterRad = fasadDetalj.underkomponenter.find((r) => r.id === "fonster");
  const dorrRad = fasadDetalj.underkomponenter.find((r) => r.id === "dorrar");
  const fonster =
    fonsterRad?.aktiv
      ? beraknaFonsterDorrListaPris(
          fasadDetalj.fonsterDorrRegister?.fonster ?? [],
          false,
        ).totaltKr
      : 0;
  const dorrar =
    dorrRad?.aktiv
      ? beraknaFonsterDorrListaPris(
          fasadDetalj.fonsterDorrRegister?.dorrar ?? [],
          true,
        ).totaltKr
      : 0;
  return { fonster, dorrar, totalt: fonster + dorrar };
}

export function hamtaFonsterKostnadFonster(
  fonsterDetalj: KomponentDetaljData | undefined,
): number {
  if (!fonsterDetalj) return 0;
  const fonsterRad = fonsterDetalj.underkomponenter.find((r) => r.id === "fonster");
  if (!fonsterRad?.aktiv) return 0;
  return beraknaFonsterDorrListaPris(
    fonsterDetalj.fonsterDorrRegister?.fonster ?? [],
    false,
  ).totaltKr;
}

export function formateraFonsterDorrPris(totaltKr: number): string {
  return totaltKr > 0 ? formatKr(totaltKr) : "";
}
