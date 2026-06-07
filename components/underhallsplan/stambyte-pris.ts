import { formatKr } from "@/components/underhallsplan/besiktningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  normaliseraVvsStambyteData,
  skapaTomStambytePriser,
  type StambytePriser,
  type VvsStambyteData,
} from "@/components/underhallsplan/vvs-stambyte";

export type { StambytePriser };

export type StambytePrisFaltId = keyof StambytePriser;

export type StambytePrisRad = {
  id: StambytePrisFaltId;
  etikett: string;
  mangd: number;
  mangdText: string;
  enhet: string;
  enhetsprisKr: number;
  summaKr: number;
};

export const stambytePrisRadDef: {
  id: StambytePrisFaltId;
  etikett: string;
  enhet: string;
  enhetKort: string;
  hamtaMangd: (d: VvsStambyteData) => string;
}[] = [
  {
    id: "vattenVertikalKallvatten",
    etikett: "Tappvatten vertikal — kallvatten",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenVertikalKallvattenLpm,
  },
  {
    id: "vattenVertikalVarmvatten",
    etikett: "Tappvatten vertikal — varmvatten",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenVertikalVarmvattenLpm,
  },
  {
    id: "vattenVertikalCirkulation",
    etikett: "Tappvatten vertikal — cirkulation",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenVertikalCirkulationLpm,
  },
  {
    id: "vattenHorisontellKallvatten",
    etikett: "Tappvatten horisontell — kallvatten",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenHorisontellKallvattenLpm,
  },
  {
    id: "vattenHorisontellVarmvatten",
    etikett: "Tappvatten horisontell — varmvatten",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenHorisontellVarmvattenLpm,
  },
  {
    id: "vattenHorisontellCirkulation",
    etikett: "Tappvatten horisontell — cirkulation",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vattenHorisontellCirkulationLpm,
  },
  {
    id: "teknikskap",
    etikett: "Teknikskåp",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.teknikskapAntal,
  },
  {
    id: "stamventiler",
    etikett: "Stamventiler",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.stamventilerAntal,
  },
  {
    id: "stamventilLagenhet",
    etikett: "Stamventil lägenhet",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.stamventilLagenhetAntal,
  },
  {
    id: "avloppVertikalStam",
    etikett: "Avlopp — vertikal stam",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.avloppVertikalStamLpm,
  },
  {
    id: "avloppHorisontellStam",
    etikett: "Avlopp — horisontell stam",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.avloppHorisontellStamLpm,
  },
  {
    id: "avloppAvstick",
    etikett: "Avlopp — avstick",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.avloppAvstickAntal,
  },
  {
    id: "avloppGrenBadrum",
    etikett: "Avloppsgren badrum",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.avloppGrenBadrumAntal,
  },
  {
    id: "avloppGrenWc",
    etikett: "Avloppsgren WC",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.avloppGrenWcAntal,
  },
  {
    id: "brandmanschett",
    etikett: "Brandmanschett",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.brandmanschettAntal,
  },
];

function parseNum(s: string): number {
  const n = Number.parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function beraknaStambytePris(
  data: VvsStambyteData,
): { rader: StambytePrisRad[]; totaltKr: number } {
  const d = normaliseraVvsStambyteData(data);
  const priser = d.priser ?? skapaTomStambytePriser();
  const rader: StambytePrisRad[] = [];

  for (const def of stambytePrisRadDef) {
    const mangd = parseNum(def.hamtaMangd(d));
    const enhetsprisKr = parseNum(priser[def.id]);
    const summaKr =
      mangd > 0 && enhetsprisKr > 0
        ? Math.round(mangd * enhetsprisKr)
        : 0;
    rader.push({
      id: def.id,
      etikett: def.etikett,
      mangd,
      mangdText:
        mangd > 0
          ? `${mangd.toLocaleString("sv-SE")} ${def.enhet === "st" ? "st" : "m"}`
          : "—",
      enhet: def.enhetKort,
      enhetsprisKr,
      summaKr,
    });
  }

  const totaltKr = rader.reduce((s, r) => s + r.summaKr, 0);
  return { rader, totaltKr };
}

export function formateraStambytePris(totaltKr: number): string {
  if (totaltKr <= 0) return "";
  return formatKr(totaltKr);
}

export function hamtaStambyteKostnadVvs(
  vvsDetalj: KomponentDetaljData | undefined,
): number {
  if (!vvsDetalj) return 0;
  const rad = vvsDetalj.underkomponenter.find((r) => r.id === "stambyte");
  if (!rad?.aktiv) return 0;
  const data = vvsDetalj.vvsStambyteRegister?.["stambyte"];
  if (!data) return 0;
  return beraknaStambytePris(data).totaltKr;
}
