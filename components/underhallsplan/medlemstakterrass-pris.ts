import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  summeraMangderFranFalt,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID,
  skapaTomMedlemstakterrassPriser,
  type MedlemstakterrassData,
  type MedlemstakterrassPriser,
} from "@/components/underhallsplan/medlemstakterrass";

export type MedlemstakterrassPrisFaltId = keyof MedlemstakterrassPriser;

export type MedlemstakterrassPrisRad = {
  id: MedlemstakterrassPrisFaltId;
  etikett: string;
  mangd: number;
  mangdText: string;
  enhet: string;
  enhetsprisKr: number;
  summaKr: number;
};

export const medlemstakterrassPrisRadDef: {
  id: MedlemstakterrassPrisFaltId;
  etikett: string;
  enhet: string;
  enhetKort: string;
  hamtaMangd: (d: MedlemstakterrassData) => string;
}[] = [
  {
    id: "vaggar",
    etikett: "Väggar / uppkragning",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.vaggarLopmeter,
  },
  {
    id: "golvsockel",
    etikett: "Golvsockel (klinker)",
    enhet: "löpmeter",
    enhetKort: "kr/m",
    hamtaMangd: (d) => d.golvsockelLopmeter,
  },
  {
    id: "golv",
    etikett: "Golv",
    enhet: "m²",
    enhetKort: "kr/m²",
    hamtaMangd: (d) => d.golvKvm,
  },
  {
    id: "tatskikt",
    etikett: "Tätätskikt utomhus",
    enhet: "m²",
    enhetKort: "kr/m²",
    hamtaMangd: (d) => d.tatskiktKvm,
  },
  {
    id: "golvbrunn",
    etikett: "Golvbrunnar",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.golvbrunnAntal,
  },
  {
    id: "breddavlopp",
    etikett: "Breddavlopp",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.breddavloppAntal,
  },
  {
    id: "golvarme",
    etikett: "Golvvärme",
    enhet: "m²",
    enhetKort: "kr/m²",
    hamtaMangd: (d) => d.golvarmeKvm,
  },
];

function parseNum(s: string): number {
  const n = Number.parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function summeraMedlemstakterrassMangder(
  data: MedlemstakterrassData,
): ListaSummeringRad[] {
  return summeraMangderFranFalt(data, medlemstakterrassPrisRadDef);
}

export function beraknaMedlemstakterrassPris(
  data: MedlemstakterrassData,
): { rader: MedlemstakterrassPrisRad[]; totaltKr: number } {
  const priser = data.priser ?? skapaTomMedlemstakterrassPriser();
  const rader: MedlemstakterrassPrisRad[] = [];

  for (const def of medlemstakterrassPrisRadDef) {
    const mangd = parseNum(def.hamtaMangd(data));
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
          ? `${mangd.toLocaleString("sv-SE")} ${def.enhet}`
          : "—",
      enhet: def.enhetKort,
      enhetsprisKr,
      summaKr,
    });
  }

  return { rader, totaltKr: rader.reduce((s, r) => s + r.summaKr, 0) };
}

export function formateraMedlemstakterrassPris(totaltKr: number): string {
  if (totaltKr <= 0) return "";
  return formatKr(totaltKr);
}

export function hamtaMedlemstakterrassKostnadTak(
  takDetalj: KomponentDetaljData | undefined,
): number {
  if (!takDetalj) return 0;
  const rad = takDetalj.underkomponenter.find(
    (r) => r.id === MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  const data = takDetalj.medlemstakterrassRegister?.[MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID];
  if (!data) return 0;
  return beraknaMedlemstakterrassPris(data).totaltKr;
}
