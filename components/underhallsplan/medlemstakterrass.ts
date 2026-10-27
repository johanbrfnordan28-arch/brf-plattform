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
  golvBekladning: import("@/components/underhallsplan/takterrass").TakterrassGolvBekladningId;
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
  golvbrunnKoppling: import("@/components/underhallsplan/takterrass-avlopp").GolvbrunnKopplingId;
  breddavloppAntal: string;
  golvarmeKvm: string;
  priser?: MedlemstakterrassPriser;
};

export type MedlemstakterrassPost = MedlemstakterrassData & {
  id: string;
  benamning: string;
};

export type MedlemstakterrassRegister = Record<string, MedlemstakterrassPost[]>;

export function skapaTomMedlemstakterrassData(): MedlemstakterrassData {
  const bas = skapaTomTakterrassData();
  return {
    golvBekladning: bas.golvBekladning,
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
    golvbrunnKoppling: bas.golvbrunnKoppling,
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
    golvBekladning: viaTakterrass.golvBekladning,
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
    golvbrunnKoppling: viaTakterrass.golvbrunnKoppling,
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

export function skapaTomMedlemstakterrassPost(benamning = ""): MedlemstakterrassPost {
  return {
    id: `medlem-terrass-${Date.now().toString(36)}`,
    benamning,
    ...skapaTomMedlemstakterrassData(),
  };
}

export function normaliseraMedlemstakterrassPoster(
  raw: unknown,
): MedlemstakterrassPost[] {
  if (Array.isArray(raw)) {
    return raw.map((post, index) => {
      const p = post as Partial<MedlemstakterrassPost>;
      return {
        id: p.id?.trim() || `medlem-terrass-${index + 1}`,
        benamning: p.benamning?.trim() ?? "",
        ...normaliseraMedlemstakterrassData(p as MedlemstakterrassData),
      };
    });
  }
  if (raw && typeof raw === "object") {
    return [
      {
        id: "medlem-terrass-1",
        benamning: "",
        ...normaliseraMedlemstakterrassData(raw as MedlemstakterrassData),
      },
    ];
  }
  return [];
}

export function formateraMedlemstakterrassLista(
  poster: MedlemstakterrassPost[],
): string {
  if (poster.length === 0) return "";
  return poster
    .map((p, i) => {
      const rubrik = p.benamning.trim() || `Terrass ${i + 1}`;
      const innehall = formateraMedlemstakterrass(p);
      return innehall ? `${rubrik}: ${innehall}` : rubrik;
    })
    .join(" · ");
}

export function formateraMedlemstakterrass(data: MedlemstakterrassData): string {
  const delar: string[] = [];

  delar.push(
    data.golvBekladning === "papp"
      ? "golv papp (tätätskikt)"
      : "golv keramik/klinker",
  );

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

  if (data.golvBekladning === "keramik") {
    const tatskikt = tatskiktEtikett(
      data.tatskiktMaterial,
      data.tatskiktAnnanText,
    );
    if (data.tatskiktKvm.trim()) {
      delar.push(
        `tätätskikt utomhus ${tatskikt} ${data.tatskiktKvm.trim()} m²`,
      );
    } else {
      delar.push(`tätätskikt utomhus ${tatskikt}`);
    }
  }

  if (data.golvbrunnAntal.trim()) {
    const koppling =
      data.golvbrunnKoppling === "avloppsstam"
        ? " → stam"
        : data.golvbrunnKoppling === "stupror"
          ? " → stuprör"
          : "";
    delar.push(`${data.golvbrunnAntal.trim()} golvbrunnar${koppling}`);
  }
  if (data.breddavloppAntal.trim()) {
    delar.push(`${data.breddavloppAntal.trim()} breddavlopp`);
  }
  if (data.golvarmeKvm.trim()) {
    delar.push(`golvvärme ${data.golvarmeKvm.trim()} m²`);
  }

  return delar.join(", ");
}
