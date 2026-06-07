import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  summeraMangderFranFalt,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { hamtaMedlemstakterrassKostnadTak } from "@/components/underhallsplan/medlemstakterrass-pris";
import { hamtaTakfonsterKostnadTak } from "@/components/underhallsplan/takfonster-pris";
import {
  skapaTomTakterrassPriser,
  TAKTERRASS_UNDERKOMPONENT_ID,
  type TakterrassData,
  type TakterrassPriser,
} from "@/components/underhallsplan/takterrass";

export type { TakterrassPriser };

export type TakterrassPrisFaltId = keyof TakterrassPriser;

export type TakterrassPrisRad = {
  id: TakterrassPrisFaltId;
  etikett: string;
  mangd: number;
  mangdText: string;
  enhet: string;
  enhetsprisKr: number;
  summaKr: number;
};

export const takterrassPrisRadDef: {
  id: TakterrassPrisFaltId;
  etikett: string;
  enhet: string;
  enhetKort: string;
  hamtaMangd: (d: TakterrassData) => string;
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
    id: "belysning",
    etikett: "Belysning",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.belysningAntal,
  },
  {
    id: "elkontakt",
    etikett: "Elkontakter",
    enhet: "st",
    enhetKort: "kr/st",
    hamtaMangd: (d) => d.elkontaktAntal,
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

export function summeraTakterrassMangder(
  data: TakterrassData,
): ListaSummeringRad[] {
  return summeraMangderFranFalt(data, takterrassPrisRadDef);
}

export function beraknaTakterrassPris(
  data: TakterrassData,
): { rader: TakterrassPrisRad[]; totaltKr: number } {
  const priser = data.priser ?? skapaTomTakterrassPriser();
  const rader: TakterrassPrisRad[] = [];

  for (const def of takterrassPrisRadDef) {
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

  const totaltKr = rader.reduce((s, r) => s + r.summaKr, 0);
  return { rader, totaltKr };
}

export function formateraTakterrassPris(totaltKr: number): string {
  if (totaltKr <= 0) return "";
  return formatKr(totaltKr);
}

export function hamtaTakterrassPrisFranRegister(
  register: Record<string, TakterrassData> | undefined,
  underId: string,
): number {
  const data = register?.[underId];
  if (!data) return 0;
  return beraknaTakterrassPris(data).totaltKr;
}

/** Summerad prissatt kostnad för gemensam takterrass under Tak. */
export function hamtaTakterrassKostnadTak(
  takDetalj: KomponentDetaljData | undefined,
): number {
  if (!takDetalj) return 0;
  const rad = takDetalj.underkomponenter.find(
    (r) => r.id === TAKTERRASS_UNDERKOMPONENT_ID,
  );
  if (!rad?.aktiv) return 0;
  return hamtaTakterrassPrisFranRegister(
    takDetalj.takterrassRegister,
    TAKTERRASS_UNDERKOMPONENT_ID,
  );
}

export function hamtaTakterrassKostnaderTak(
  takDetalj: KomponentDetaljData | undefined,
): {
  gemensam: number;
  medlem: number;
  takfonster: number;
  totalt: number;
} {
  const gemensam = hamtaTakterrassKostnadTak(takDetalj);
  const medlem = hamtaMedlemstakterrassKostnadTak(takDetalj);
  const takfonster = hamtaTakfonsterKostnadTak(takDetalj);
  return {
    gemensam,
    medlem,
    takfonster,
    totalt: gemensam + medlem + takfonster,
  };
}
