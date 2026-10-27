/** Gemensam takterrass — underkomponent under Tak. */

import type { GolvbrunnKopplingId } from "@/components/underhallsplan/takterrass-avlopp";

export const TAKTERRASS_UNDERKOMPONENT_ID = "takterrass";

export type TakterrassGolvBekladningId = "papp" | "keramik";

export const takterrassGolvBekladningAlternativ: {
  id: TakterrassGolvBekladningId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "papp",
    etikett: "Papp / tjärpapp",
    beskrivning:
      "Beläggningen är tätskikt i sig — utomhuspapp eller tjärpapp som avslutande yta.",
  },
  {
    id: "keramik",
    etikett: "Keramik / klinker",
    beskrivning:
      "Plattor ovanpå separat tätskikt — produkterna ska vara avsedda för utomhusbruk.",
  },
];

/** Enhetspris per prispost — se takterrass-pris.ts */
export type TakterrassPriser = {
  vaggar: string;
  golvsockel: string;
  golv: string;
  tatskikt: string;
  golvbrunn: string;
  breddavlopp: string;
  belysning: string;
  elkontakt: string;
  golvarme: string;
};

export function skapaTomTakterrassPriser(): TakterrassPriser {
  return {
    vaggar: "",
    golvsockel: "",
    golv: "",
    tatskikt: "",
    golvbrunn: "",
    breddavlopp: "",
    belysning: "",
    elkontakt: "",
    golvarme: "",
  };
}

export type TakterrassVaggMaterialId = "bandtackt-plat" | "eget";

export type TakterrassGolvMaterialId =
  | "klinker"
  | "sten"
  | "tra-composit"
  | "annat";

export type TakterrassTatskiktId =
  | "mapelastic-mapei"
  | "fb3-hoganas"
  | "tjarpapp"
  | "tatskiktsmatta"
  | "underlagsduk"
  | "asfaltsduk"
  | "ovrigt";

export type TakterrassData = {
  /** Papp som tätskikt i sig, eller keramik med tätskikt under. */
  golvBekladning: TakterrassGolvBekladningId;
  vaggarMaterial: TakterrassVaggMaterialId;
  vaggarAnnanText: string;
  /** Vägglängd vid upphöjda kanter / stödmurar (valfritt) */
  vaggarLopmeter: string;
  /** Golvsockel i klinker */
  golvsockelLopmeter: string;
  golvMaterial: TakterrassGolvMaterialId;
  golvAnnanText: string;
  golvKvm: string;
  /** Tätätskikt för utomhus — inte samma som inomhus */
  tatskiktMaterial: TakterrassTatskiktId;
  tatskiktAnnanText: string;
  tatskiktKvm: string;
  golvbrunnAntal: string;
  /** Vart golvbrunnen leder vattnet. */
  golvbrunnKoppling: GolvbrunnKopplingId;
  breddavloppAntal: string;
  belysningAntal: string;
  elkontaktAntal: string;
  golvarmeKvm: string;
  /** Enhetspris per del — används för kostnadsberäkning */
  priser?: TakterrassPriser;
};

export type TakterrassPost = TakterrassData & {
  id: string;
  /** T.ex. «Terrass mot gård» eller lägenhetsnummer. */
  benamning: string;
};

export type TakterrassRegister = Record<string, TakterrassPost[]>;

export const takterrassVaggMaterial: {
  id: TakterrassVaggMaterialId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "bandtackt-plat",
    etikett: "Bandtäckt plåt",
    beskrivning:
      "Vanligast — plåtklädda väggar/uppkragningar. Välj «Eget val» om materialet avviker.",
  },
  { id: "eget", etikett: "Eget val" },
];

export const takterrassGolvMaterial: {
  id: TakterrassGolvMaterialId;
  etikett: string;
}[] = [
  { id: "klinker", etikett: "Klinker / keramik" },
  { id: "sten", etikett: "Natursten / betongplattor" },
  { id: "tra-composit", etikett: "Trädäck / komposit (ovanligt)" },
  { id: "annat", etikett: "Annat golv (ovanligt)" },
];

/** Kort förklaring i formuläret — utomhus, under klinker/beläggning. */
export const takterrassTatskiktIntro =
  "Tätätskiktet ligger under terrassgolvet och ska tåla utomhusklimat och stående vatten. Det är inte samma produkter som i våtutrymmen inomhus.";

export const takterrassTatskiktFlytande: {
  id: TakterrassTatskiktId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "mapelastic-mapei",
    etikett: "Mapelastic (Mapei)",
    beskrivning:
      "Flytande, flexibelt tätskikt — vanligt val under klinker på balkong och takterrass.",
  },
  {
    id: "fb3-hoganas",
    etikett: "FB3 Tätslamma (CC Höganäs)",
    beskrivning:
      "Cementbaserat tätskiktsmembran för terrasser och balkonger utomhus, ofta under keramik.",
  },
];

/** Rullade tätskikt — papp, tjära och mattor (äldre och nyare system). */
export const takterrassTatskiktPappTjara: {
  id: TakterrassTatskiktId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "tjarpapp",
    etikett: "Tjärpapp / takpapp",
    beskrivning: "Klassisk bitumenpapp med tjära — rullas ut och lödas vid skarvar.",
  },
  {
    id: "tatskiktsmatta",
    etikett: "Tätskiktsmatta",
    beskrivning: "Modern bitumenmatta (t.ex. SBS eller APP) — rullad duk med tjära/bitumen.",
  },
  {
    id: "underlagsduk",
    etikett: "Underlagsduk",
    beskrivning: "Duk under tätskikt eller som första lager i papp- och tjärsystem.",
  },
  {
    id: "asfaltsduk",
    etikett: "Asfaltsduk / tjärad duk",
    beskrivning: "Tjärad eller asfalterad duk — ibland i flera skikt ovanpå varandra.",
  },
];

export const takterrassTatskiktOvrigt: {
  id: TakterrassTatskiktId;
  etikett: string;
  beskrivning?: string;
} = {
  id: "ovrigt",
  etikett: "Övrigt",
  beskrivning: "Ange produkt eller system om det inte finns i listan.",
};

export const takterrassTatskiktUtomhus = [
  ...takterrassTatskiktFlytande,
  ...takterrassTatskiktPappTjara,
  takterrassTatskiktOvrigt,
];

export function standardTakterrassVagg(): TakterrassVaggMaterialId {
  return "bandtackt-plat";
}

const legacyVaggMaterialIds = new Set([
  "bandtackt-puts",
  "plat",
  "tra-panel",
  "fasadskivor",
  "annat",
]);

function normaliseraVaggMaterial(
  id: string,
  annanText: string,
): { material: TakterrassVaggMaterialId; annanText: string } {
  if (id === "bandtackt-plat") {
    return { material: "bandtackt-plat", annanText };
  }
  if (id === "eget") {
    return { material: "eget", annanText };
  }
  if (id === "bandtackt-puts") {
    return { material: "bandtackt-plat", annanText };
  }
  if (legacyVaggMaterialIds.has(id)) {
    const etiketter: Record<string, string> = {
      plat: "Plåt / profilerad plåt",
      "tra-panel": "Träpanel / träskärm",
      fasadskivor: "Fasadskivor / fibercement",
      annat: "",
    };
    return {
      material: "eget",
      annanText: annanText.trim() || etiketter[id] || id,
    };
  }
  return { material: "bandtackt-plat", annanText };
}

export function standardTakterrassGolv(): TakterrassGolvMaterialId {
  return "klinker";
}

export function standardTakterrassTatskikt(): TakterrassTatskiktId {
  return "mapelastic-mapei";
}

const legacyTatskiktIds = new Set([
  "duk-membran",
  "polymer",
  "plastbaltad",
  "annat",
]);

function normaliseraTatskiktMaterial(
  id: string,
  annanText: string,
): { material: TakterrassTatskiktId; annanText: string } {
  const giltiga = new Set(takterrassTatskiktUtomhus.map((a) => a.id));
  if (giltiga.has(id as TakterrassTatskiktId)) {
    return { material: id as TakterrassTatskiktId, annanText };
  }
  if (id === "duk-membran" || id === "polymer") {
    return { material: "mapelastic-mapei", annanText };
  }
  if (id === "plastbaltad") {
    return { material: "underlagsduk", annanText };
  }
  if (id === "annat" || legacyTatskiktIds.has(id)) {
    return {
      material: "ovrigt",
      annanText: annanText.trim() || (id !== "annat" ? id : ""),
    };
  }
  return { material: "mapelastic-mapei", annanText };
}

function inferGolvBekladning(
  raw: Partial<TakterrassData>,
): TakterrassGolvBekladningId {
  if (raw.golvBekladning === "papp" || raw.golvBekladning === "keramik") {
    return raw.golvBekladning;
  }
  const pappTatskikt = new Set<TakterrassTatskiktId>([
    "tjarpapp",
    "tatskiktsmatta",
    "underlagsduk",
    "asfaltsduk",
  ]);
  if (
    pappTatskikt.has(raw.tatskiktMaterial as TakterrassTatskiktId) &&
    (!raw.golvKvm?.trim() || raw.golvMaterial === "annat")
  ) {
    return "papp";
  }
  return "keramik";
}

export function skapaTomTakterrassData(): TakterrassData {
  return {
    golvBekladning: "keramik",
    vaggarMaterial: standardTakterrassVagg(),
    vaggarAnnanText: "",
    vaggarLopmeter: "",
    golvsockelLopmeter: "",
    golvMaterial: standardTakterrassGolv(),
    golvAnnanText: "",
    golvKvm: "",
    tatskiktMaterial: standardTakterrassTatskikt(),
    tatskiktAnnanText: "",
    tatskiktKvm: "",
    golvbrunnAntal: "",
    golvbrunnKoppling: "",
    breddavloppAntal: "",
    belysningAntal: "",
    elkontaktAntal: "",
    golvarmeKvm: "",
    priser: skapaTomTakterrassPriser(),
  };
}

/** Bakåtkompatibilitet — tidigare fält i löpmeter */
export function normaliseraTakterrassData(
  raw: TakterrassData & {
    breddavloppLopmeter?: string;
    vaggarMaterial?: string;
  },
): TakterrassData {
  const tom = skapaTomTakterrassData();
  const vagg = normaliseraVaggMaterial(
    raw.vaggarMaterial ?? tom.vaggarMaterial,
    raw.vaggarAnnanText ?? "",
  );
  const tatskikt = normaliseraTatskiktMaterial(
    raw.tatskiktMaterial ?? tom.tatskiktMaterial,
    raw.tatskiktAnnanText ?? "",
  );
  const golvBekladning = inferGolvBekladning(raw);
  const koppling = raw.golvbrunnKoppling;
  return {
    ...tom,
    ...raw,
    golvBekladning,
    vaggarMaterial: vagg.material,
    vaggarAnnanText: vagg.annanText,
    tatskiktMaterial: tatskikt.material,
    tatskiktAnnanText: tatskikt.annanText,
    golvbrunnKoppling:
      koppling === "avloppsstam" || koppling === "stupror" ? koppling : "",
    priser: {
      ...skapaTomTakterrassPriser(),
      ...raw.priser,
    },
    breddavloppAntal:
      raw.breddavloppAntal?.trim() ||
      raw.breddavloppLopmeter?.trim() ||
      "",
  };
}

export function skapaTomTakterrassPost(benamning = ""): TakterrassPost {
  return {
    id: `terrass-${Date.now().toString(36)}`,
    benamning,
    ...skapaTomTakterrassData(),
  };
}

/** Tidigare sparades en enskild terrass — migrera till lista. */
export function normaliseraTakterrassPoster(raw: unknown): TakterrassPost[] {
  if (Array.isArray(raw)) {
    return raw.map((post, index) => {
      const p = post as Partial<TakterrassPost>;
      return {
        id: p.id?.trim() || `terrass-${index + 1}`,
        benamning: p.benamning?.trim() ?? "",
        ...normaliseraTakterrassData(p as TakterrassData),
      };
    });
  }
  if (raw && typeof raw === "object") {
    const data = normaliseraTakterrassData(raw as TakterrassData);
    return [{ id: "terrass-1", benamning: "", ...data }];
  }
  return [];
}

export function formateraTakterrassLista(poster: TakterrassPost[]): string {
  if (poster.length === 0) return "";
  return poster
    .map((p, i) => {
      const rubrik = p.benamning.trim() || `Terrass ${i + 1}`;
      const innehall = formateraTakterrass(p);
      return innehall ? `${rubrik}: ${innehall}` : rubrik;
    })
    .join(" · ");
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

export function formateraTakterrass(data: TakterrassData): string {
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
  if (data.belysningAntal.trim()) {
    delar.push(`${data.belysningAntal.trim()} belysningspunkter`);
  }
  if (data.elkontaktAntal.trim()) {
    delar.push(`${data.elkontaktAntal.trim()} elkontakter`);
  }
  if (data.golvarmeKvm.trim()) {
    delar.push(`golvvärme ${data.golvarmeKvm.trim()} m²`);
  }

  return delar.join(", ");
}
