/** Medlemstakterrass — egen terrass per lägenhet, utan el. Delar material med gemensam takterrass. */

import type {
  TakterrassGolvMaterialId,
  TakterrassTatskiktId,
  TakterrassVaggMaterialId,
} from "@/components/underhallsplan/takterrass";
import {
  normaliseraTakterrassData,
  skapaTomTakterrassData,
  standardTakterrassGolv,
  standardTakterrassTatskikt,
  standardTakterrassVagg,
  takterrassGolvMaterial,
  takterrassTatskiktFlytande,
  takterrassTatskiktIntro,
  takterrassTatskiktOvrigt,
  takterrassTatskiktPappTjara,
  takterrassTatskiktUtomhus,
  takterrassVaggMaterial,
} from "@/components/underhallsplan/takterrass";

export {
  takterrassGolvMaterial,
  takterrassTatskiktFlytande,
  takterrassTatskiktIntro,
  takterrassTatskiktOvrigt,
  takterrassTatskiktPappTjara,
  takterrassVaggMaterial,
};

export const MEDLEMS_TAKTERRASS_UNDERKOMPONENT_ID = "medlemstakterrass";

export type MedlemstakterrassPriser = {
  vaggar: string;
  golvsockel: string;
  golv: string;
  tatskikt: string;
  golvbrunn: string;
  breddavlopp: string;
  golvarme: string;
};

export function skapaTomMedlemstakterrassPriser(): MedlemstakterrassPriser {
  return {
    vaggar: "",
    golvsockel: "",
    golv: "",
    tatskikt: "",
    golvbrunn: "",
    breddavlopp: "",
    golvarme: "",
  };
}

export type MedlemstakterrassData = {
  vaggarMaterial: TakterrassVaggMaterialId;
  vaggarAnnanText: string;
  vaggarLopmeter: string;
  golvsockelLopmeter: string;
  golvMaterial: TakterrassGolvMaterialId;
  golvAnnanText: string;
  golvKvm: string;
  tatskiktMaterial: TakterrassTatskiktId;
  tatskiktAnnanText: string;
  tatskiktKvm: string;
  golvbrunnAntal: string;
  breddavloppAntal: string;
  golvarmeKvm: string;
  priser?: MedlemstakterrassPriser;
};

export function skapaTomMedlemstakterrassData(): MedlemstakterrassData {
  const bas = skapaTomTakterrassData();
  return {
    vaggarMaterial: bas.vaggarMaterial,
    vaggarAnnanText: bas.vaggarAnnanText,
    vaggarLopmeter: bas.vaggarLopmeter,
    golvsockelLopmeter: bas.golvsockelLopmeter,
    golvMaterial: standardTakterrassGolv(),
    golvAnnanText: bas.golvAnnanText,
    golvKvm: bas.golvKvm,
    tatskiktMaterial: standardTakterrassTatskikt(),
    tatskiktAnnanText: bas.tatskiktAnnanText,
    tatskiktKvm: bas.tatskiktKvm,
    golvbrunnAntal: bas.golvbrunnAntal,
    breddavloppAntal: bas.breddavloppAntal,
    golvarmeKvm: bas.golvarmeKvm,
    priser: skapaTomMedlemstakterrassPriser(),
  };
}

export function normaliseraMedlemstakterrassData(
  raw: MedlemstakterrassData & {
    breddavloppLopmeter?: string;
    vaggarMaterial?: string;
    tatskiktMaterial?: string;
  },
): MedlemstakterrassData {
  const viaTakterrass = normaliseraTakterrassData({
    ...raw,
    belysningAntal: "",
    elkontaktAntal: "",
  } as Parameters<typeof normaliseraTakterrassData>[0]);

  return {
    vaggarMaterial: viaTakterrass.vaggarMaterial,
    vaggarAnnanText: viaTakterrass.vaggarAnnanText,
    vaggarLopmeter: viaTakterrass.vaggarLopmeter,
    golvsockelLopmeter: viaTakterrass.golvsockelLopmeter,
    golvMaterial: viaTakterrass.golvMaterial,
    golvAnnanText: viaTakterrass.golvAnnanText,
    golvKvm: viaTakterrass.golvKvm,
    tatskiktMaterial: viaTakterrass.tatskiktMaterial,
    tatskiktAnnanText: viaTakterrass.tatskiktAnnanText,
    tatskiktKvm: viaTakterrass.tatskiktKvm,
    golvbrunnAntal: viaTakterrass.golvbrunnAntal,
    breddavloppAntal:
      raw.breddavloppAntal?.trim() ||
      raw.breddavloppLopmeter?.trim() ||
      "",
    golvarmeKvm: viaTakterrass.golvarmeKvm,
    priser: {
      ...skapaTomMedlemstakterrassPriser(),
      ...raw.priser,
    },
  };
}

function vaggEtikett(id: TakterrassVaggMaterialId, annan: string): string {
  if (id === "eget" && annan.trim()) return annan.trim();
  return takterrassVaggMaterial.find((m) => m.id === id)?.etikett ?? id;
}

function golvEtikett(id: TakterrassGolvMaterialId, annan: string): string {
  if (id === "annat" && annan.trim()) return annan.trim();
  return takterrassGolvMaterial.find((m) => m.id === id)?.etikett ?? id;
}

function tatskiktEtikett(id: TakterrassTatskiktId, annan: string): string {
  if (id === "ovrigt" && annan.trim()) return annan.trim();
  return takterrassTatskiktUtomhus.find((m) => m.id === id)?.etikett ?? id;
}

export function formateraMedlemstakterrass(data: MedlemstakterrassData): string {
  const delar: string[] = [];

  const vagg = vaggEtikett(data.vaggarMaterial, data.vaggarAnnanText);
  delar.push(
    data.vaggarLopmeter.trim()
      ? `väggar ${vagg} ${data.vaggarLopmeter.trim()} m`
      : `väggar ${vagg}`,
  );

  if (data.golvsockelLopmeter.trim()) {
    delar.push(`golvsockel klinker ${data.golvsockelLopmeter.trim()} m`);
  }

  const golv = golvEtikett(data.golvMaterial, data.golvAnnanText);
  if (data.golvKvm.trim()) {
    delar.push(`golv ${golv} ${data.golvKvm.trim()} m²`);
  } else if (data.golvMaterial !== "klinker" || data.golvAnnanText.trim()) {
    delar.push(`golv ${golv}`);
  }

  const tatskikt = tatskiktEtikett(data.tatskiktMaterial, data.tatskiktAnnanText);
  if (data.tatskiktKvm.trim()) {
    delar.push(`tätätskikt utomhus ${tatskikt} ${data.tatskiktKvm.trim()} m²`);
  } else {
    delar.push(`tätätskikt utomhus ${tatskikt}`);
  }

  if (data.golvbrunnAntal.trim()) {
    delar.push(`${data.golvbrunnAntal.trim()} golvbrunnar`);
  }
  if (data.breddavloppAntal.trim()) {
    delar.push(`${data.breddavloppAntal.trim()} breddavlopp`);
  }
  if (data.golvarmeKvm.trim()) {
    delar.push(`golvvärme ${data.golvarmeKvm.trim()} m²`);
  }

  return delar.join(", ");
}
