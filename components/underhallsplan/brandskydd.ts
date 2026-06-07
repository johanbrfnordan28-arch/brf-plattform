/** Systematiskt brandskyddsarbete (SBA) — kontrollpunkter och registerdata. */

export const SBA_UNDERKOMPONENT_ID = "sba";
export const BRANDDORRAR_UNDERKOMPONENT_ID = "branddorrar";
export const UTRYMNING_UNDERKOMPONENT_ID = "utrymningsvag";
export const ROKGAS_UNDERKOMPONENT_ID = "rokgasevakuering";

export type SbaKontrollPunkt = {
  id: string;
  kategori: string;
  text: string;
};

/** Mall för vad som ska ingå i SBA-besiktningen / egenkontrollen. */
export const sbaBesiktningMall: SbaKontrollPunkt[] = [
  {
    id: "sba-plan",
    kategori: "Organisation",
    text: "Brandskyddsdokumentation och ansvarsfördelning (SBA-plan) är uppdaterad och känd i styrelsen.",
  },
  {
    id: "utrymning",
    kategori: "Utrymning",
    text: "Utrymningsvägar i trapphus och korridorer är fria — inga förråd, cyklar eller möbler blockerar.",
  },
  {
    id: "skyltning",
    kategori: "Utrymning",
    text: "Utrymningsskyltning och nödbelysning är synlig, hel och fungerar.",
  },
  {
    id: "branddorr-funktion",
    kategori: "Branddörrar",
    text: "Branddörrar och ståldörrar stänger och låser som de ska — inga kilar, tejp eller permanenta dörrstopp.",
  },
  {
    id: "branddorr-rok",
    kategori: "Branddörrar",
    text: "Röktäthet kontrollerad: branddörrar ska hindra både eld och rökgasspridning mellan brandceller (t.ex. trapphus mot lägenhet/källare).",
  },
  {
    id: "rokgas-trapphus",
    kategori: "Rökgasevakuering",
    text: "Rökgasevakuering i trapphus — fläktar, spjäll och styrning testade enligt anvisning.",
  },
  {
    id: "slckare",
    kategori: "Släckutrustning",
    text: "Handbrandsläckare och brandsläckare i gemensamma utrymmen är på plats och inom giltighetstid.",
  },
  {
    id: "sba-utbildning",
    kategori: "Organisation",
    text: "Styrelse och fastighetsskötare känner till rutiner vid larm och utrymning.",
  },
];

export const branddorrRokinformationText =
  "Branddörrar ska begränsa både eldspridning och rökspridning. Rök sprider sig ofta snabbare än eld och är den vanligaste orsaken till att utrymningsvägar blir obrukbara — därför krävs röktäthet (t.ex. EI2 eller S200 enligt klassning) och att dörrar inte hålls öppna med dörrstopp.";

export const SBA_BRANDKONSULT_INTERVALL_AR = 3;

export const SBA_DEFAULT_KOSTNAD_KR = 8_000;
export const SBA_DEFAULT_BRANDKONSULT_KR = 18_000;

export type BrandskyddSbaData = {
  /** Senast genomförd SBA-egenkontroll (år). */
  senastKontrollAr?: string;
  /** Anteckning från senaste rond. */
  anteckning?: string;
  inkluderaBrandkonsult?: boolean;
  brandkonsultIntervallAr?: string;
};

export type BrandskyddBranddorrarData = {
  antalBranddorrar: string;
  antalRoksparrade: string;
  /** T.ex. trapphus, källare, garage. */
  placeringAnteckning?: string;
};

export type BrandskyddRegister = Record<string, BrandskyddSbaData | BrandskyddBranddorrarData>;

export function tomBrandskyddSbaData(): BrandskyddSbaData {
  return {
    senastKontrollAr: "",
    anteckning: "",
    inkluderaBrandkonsult: false,
    brandkonsultIntervallAr: String(SBA_BRANDKONSULT_INTERVALL_AR),
  };
}

export function tomBrandskyddBranddorrarData(): BrandskyddBranddorrarData {
  return {
    antalBranddorrar: "",
    antalRoksparrade: "",
    placeringAnteckning: "",
  };
}

export function normaliseraBrandskyddSbaData(
  raw?: Partial<BrandskyddSbaData>,
): BrandskyddSbaData {
  return {
    ...tomBrandskyddSbaData(),
    ...raw,
    brandkonsultIntervallAr:
      raw?.brandkonsultIntervallAr?.trim() ||
      String(SBA_BRANDKONSULT_INTERVALL_AR),
  };
}

export function normaliseraBrandskyddBranddorrarData(
  raw?: Partial<BrandskyddBranddorrarData>,
): BrandskyddBranddorrarData {
  return { ...tomBrandskyddBranddorrarData(), ...raw };
}

export function formateraBrandskyddSba(data: BrandskyddSbaData): string {
  const delar: string[] = [];
  if (data.senastKontrollAr?.trim()) {
    delar.push(`senast ${data.senastKontrollAr.trim()}`);
  }
  if (data.inkluderaBrandkonsult) {
    delar.push(
      `brandkonsult vart ${data.brandkonsultIntervallAr || SBA_BRANDKONSULT_INTERVALL_AR}:e år`,
    );
  }
  return delar.join(", ");
}

export function formateraBrandskyddBranddorrar(
  data: BrandskyddBranddorrarData,
): string {
  const antal = data.antalBranddorrar?.trim();
  const rok = data.antalRoksparrade?.trim();
  if (!antal && !rok) return "";
  const delar: string[] = [];
  if (antal) delar.push(`${antal} branddörrar`);
  if (rok) delar.push(`${rok} rökspärrade`);
  return delar.join(", ");
}
