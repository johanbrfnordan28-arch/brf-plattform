/** Gemensam takterrass — underkomponent under Tak. */

export const TAKTERRASS_UNDERKOMPONENT_ID = "takterrass";

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
  breddavloppAntal: string;
  belysningAntal: string;
  elkontaktAntal: string;
  golvarmeKvm: string;
  /** Enhetspris per del — används för kostnadsberäkning */
  priser?: TakterrassPriser;
};

export const takterrassVaggMaterial: {
  id: TakterrassVaggMaterialId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "bandtackt-plat",
    etikett: "Bandtäckt plåt",
    beskrivning: "Vanligast på uppkragningar och stödmurar mot terrassen.",
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

export function skapaTomTakterrassData(): TakterrassData {
  return {
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
  return {
    ...tom,
    ...raw,
    vaggarMaterial: vagg.material,
    vaggarAnnanText: vagg.annanText,
    tatskiktMaterial: tatskikt.material,
    tatskiktAnnanText: tatskikt.annanText,
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
