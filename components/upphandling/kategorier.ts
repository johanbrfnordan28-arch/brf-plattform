export const entreprenadKategorier = [
  "Bygg",
  "Fasad",
  "Tak",
  "El",
  "Målning",
  "VVS",
  "Byggservice",
] as const;

/** Konsulter och specialisttjänster — upphandlas ofta separat från entreprenaden. */
export const konsultKategorier = [
  "Konstruktör/arkitekt",
  "Projektledning",
  "Besiktningsman/Kvinna",
  "Bygglov",
  "Ljudmätning",
  "Tillgänglighet",
  "Brandkonsult",
  "Brandskydd",
  "Energideklaration",
] as const;

/** Löpande drift och förvaltning — separat från entreprenad och konsulter. */
export const fastighetsforvaltningKategorier = [
  "Teknisk förvaltning",
  "Städning",
  "Fastighetsskötsel",
  "Trädgårdsskötsel",
] as const;

export type UpphandlingsGruppId =
  | "entreprenad"
  | "konsulter"
  | "fastighetsforvaltning";

export type UpphandlingsGrupp = {
  id: UpphandlingsGruppId;
  titel: string;
  beskrivning: string;
  kategorier: readonly string[];
};

export const upphandlingsGrupper: UpphandlingsGrupp[] = [
  {
    id: "entreprenad",
    titel: "Entreprenad & installation",
    beskrivning:
      "Bygg, installation och ytskikt — vanliga entreprenadkategorier i BRF-projekt.",
    kategorier: entreprenadKategorier,
  },
  {
    id: "konsulter",
    titel: "Konsulter & specialisttjänster",
    beskrivning:
      "Yrkesområden som ofta underupphandlas separat från själva entreprenaden — t.ex. projektledning, besiktningsman och myndighetskrav.",
    kategorier: konsultKategorier,
  },
  {
    id: "fastighetsforvaltning",
    titel: "Fastighetsförvaltning",
    beskrivning:
      "Löpande drift och skötsel av fastigheten — teknisk förvaltning, städning, fastighetsskötsel och trädgård, ofta som återkommande avtal.",
    kategorier: fastighetsforvaltningKategorier,
  },
];

/** Platt lista — alla kategorier i visningsordning. */
export const upphandlingsKategorier = [
  ...entreprenadKategorier,
  ...konsultKategorier,
  ...fastighetsforvaltningKategorier,
] as const;

export type UpphandlingsKategori = (typeof upphandlingsKategorier)[number];

export type StandardDokumentPlats = {
  id: string;
  etikett: string;
};

/** Tre standardplatser per kategori — fler läggs till via ”Lägg till dokument”. */
export const standardDokumentPlatser: StandardDokumentPlats[] = [
  { id: "beskrivning", etikett: "Ladda upp projektets beskrivning" },
  { id: "underlag", etikett: "Ladda upp dokument" },
  { id: "anbudsformular", etikett: "Anbudsformulär" },
];

export function kategoriId(namn: string): string {
  return namn
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function skapaDokumentId(): string {
  return `dok-${Date.now()}`;
}

export function hamtaUpphandlingsGrupp(
  kategori: string,
): UpphandlingsGrupp | undefined {
  return upphandlingsGrupper.find((grupp) => grupp.kategorier.includes(kategori));
}

/** Grupper med tydlig inramning (ej entreprenad). */
export function arInramadUpphandlingsGrupp(id: UpphandlingsGruppId): boolean {
  return id === "konsulter" || id === "fastighetsforvaltning";
}
