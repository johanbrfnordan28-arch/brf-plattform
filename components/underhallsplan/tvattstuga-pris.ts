import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  effektivEnhetspris,
  RIKT_TVATTSTUGA_KR,
} from "@/components/underhallsplan/riktpriser";
import {
  TVATTSTUGA_UNDERKOMPONENT_ID,
  type TvattstugaPost,
  type TvattstugaPriser,
} from "@/components/underhallsplan/tvattstugor";

export type TvattstugaPrisRad = {
  id: keyof TvattstugaPriser;
  etikett: string;
  mangd: number;
  mangdText: string;
  enhet: string;
  enhetsprisKr: number;
  summaKr: number;
};

export function skapaTomTvattstugaPriser(): TvattstugaPriser {
  return {
    tvattmaskin: "",
    torktumlare: "",
    torkskap: "",
    mangel: "",
    belysning: "",
    golv: "",
    vaggar: "",
  };
}

const tvattstugaPrisDef: {
  id: keyof TvattstugaPriser;
  etikett: string;
  enhet: string;
  enhetKort: string;
  hamtaMangd: (p: TvattstugaPost) => string;
}[] = [
  {
    id: "tvattmaskin",
    etikett: "Tvättmaskiner",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (p) => p.tvattmaskin,
  },
  {
    id: "torktumlare",
    etikett: "Torktumlare",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (p) => p.torktumlare,
  },
  {
    id: "torkskap",
    etikett: "Torkskåp",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (p) => p.torkskap,
  },
  {
    id: "mangel",
    etikett: "Mangel",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (p) => p.mangel,
  },
  {
    id: "belysning",
    etikett: "Belysning",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (p) => p.belysning,
  },
  {
    id: "golv",
    etikett: "Golv",
    enhet: "m²",
    enhetKort: "kr/m²",
    hamtaMangd: (p) => p.golvKvm,
  },
  {
    id: "vaggar",
    etikett: "Väggar",
    enhet: "m²",
    enhetKort: "kr/m²",
    hamtaMangd: (p) => p.vaggarKvm,
  },
];

function parseMangd(s: string): number {
  const n = Number.parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function beraknaTvattstugaPostPris(post: TvattstugaPost): {
  rader: TvattstugaPrisRad[];
  totaltKr: number;
} {
  const priser = { ...skapaTomTvattstugaPriser(), ...post.priser };
  const rader: TvattstugaPrisRad[] = [];

  for (const def of tvattstugaPrisDef) {
    const mangd = parseMangd(def.hamtaMangd(post));
    if (mangd <= 0) continue;
    const rikt = RIKT_TVATTSTUGA_KR[def.id];
    const enhetsprisKr = effektivEnhetspris(priser[def.id], rikt);
    rader.push({
      id: def.id,
      etikett: def.etikett,
      mangd,
      mangdText: `${mangd.toLocaleString("sv-SE")} ${def.enhet}`,
      enhet: def.enhetKort,
      enhetsprisKr,
      summaKr: Math.round(mangd * enhetsprisKr),
    });
  }

  return { rader, totaltKr: rader.reduce((s, r) => s + r.summaKr, 0) };
}

export function beraknaTvattstugaListaPris(poster: TvattstugaPost[]): number {
  return poster.reduce(
    (s, p) => s + beraknaTvattstugaPostPris(p).totaltKr,
    0,
  );
}

export function hamtaTvattstugaKostnadKallare(
  kallareDetalj: KomponentDetaljData | undefined,
): number {
  if (!kallareDetalj) return 0;
  const rad = kallareDetalj.underkomponenter.find(
    (r) => r.id === TVATTSTUGA_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  const poster =
    kallareDetalj.tvattstugaRegister?.[TVATTSTUGA_UNDERKOMPONENT_ID] ?? [];
  return beraknaTvattstugaListaPris(poster);
}

export function formateraTvattstugaPris(totaltKr: number): string {
  return totaltKr > 0 ? formatKr(totaltKr) : "";
}
