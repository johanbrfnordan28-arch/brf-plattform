/** Takbeläggning — materialvägar och underhållsregler (tegel, plåt, papp). */

import { parseNummerSumma } from "@/components/underhallsplan/lista-summering";

export type TakBelaggningMangdEnhet = "kvm" | "antal" | "styck";

export const takBelaggningMangdEnhetEtiketter: Record<
  TakBelaggningMangdEnhet,
  { etikett: string; enhet: string }
> = {
  kvm: { etikett: "Yta", enhet: "m²" },
  antal: { etikett: "Antal", enhet: "st" },
  styck: { etikett: "Styck", enhet: "st" },
};

export type TakBelaggningHuvudtyp =
  | "tegel"
  | "plat-korrigerad"
  | "plat-bandlagd"
  | "papp";

export type TegelTyp = "betongpannor" | "lertegel";

export type BandlagdPlatMaterial =
  | "stalplat"
  | "koppar"
  | "aluminium"
  | "zink"
  | "rostfritt";

export type KorrigeradInfastning = "spik" | "skruv";

export type TakBelaggningPost = {
  id: string;
  /** T.ex. Koppar tak väster — valfritt namn på byggnadsdelen. */
  namn?: string;
  huvudtyp: TakBelaggningHuvudtyp;
  /** Mängd för denna del — enhet väljs separat. */
  mangd?: string;
  mangdEnhet?: TakBelaggningMangdEnhet;
  tegelTyp?: TegelTyp;
  /** Kulör på tegelpannor, t.ex. röd, svart glaserad. */
  tegelKulor?: string;
  bandlagdMaterial?: BandlagdPlatMaterial;
  /** Kulör på lackad plåt (stålplåt). */
  bandlagdKulor?: string;
  /** Gäller bandlagd aluminium — lackerad yta kan målas om. */
  aluminiumLackerad?: boolean;
  korrigeradInfastning?: KorrigeradInfastning;
};

export type TakBelaggningData = {
  belaggningar: TakBelaggningPost[];
};

export type TakBelaggningRegister = Record<string, TakBelaggningData>;

const tegelTyper: { id: TegelTyp; etikett: string }[] = [
  { id: "betongpannor", etikett: "Betongpannor" },
  { id: "lertegel", etikett: "Lertegel" },
];

const bandlagdMaterial: {
  id: BandlagdPlatMaterial;
  etikett: string;
  kanMalas: boolean | "aluminium-val";
  underhall: string;
}[] = [
  {
    id: "stalplat",
    etikett: "Plåt lackad",
    kanMalas: true,
    underhall: "Rengöring och ommålning.",
  },
  {
    id: "koppar",
    etikett: "Koppar",
    kanMalas: false,
    underhall: "Rengöring — koppar får patina och målas inte.",
  },
  {
    id: "aluminium",
    etikett: "Aluminium",
    kanMalas: "aluminium-val",
    underhall:
      "Rengöring alltid. Lackerad aluminium kan målas om; obehandlad patineras.",
  },
  {
    id: "zink",
    etikett: "Zink",
    kanMalas: false,
    underhall: "Rengöring — zink får patina och målas normalt inte.",
  },
  {
    id: "rostfritt",
    etikett: "Rostfri plåt",
    kanMalas: false,
    underhall: "Rengöring — rostfritt målas inte.",
  },
];

export {
  tegelTyper as takBelaggningTegelTyper,
  bandlagdMaterial as takBelaggningBandlagdMaterial,
};

/** Vanliga kulörer på lackad plåt — väljbar i takpartier. */
export const lackadPlatKulorAlternativ: { id: string; etikett: string }[] = [
  { id: "rod", etikett: "Röd" },
  { id: "svart", etikett: "Svart" },
  { id: "gra", etikett: "Grå" },
  { id: "gra-gron", etikett: "Grågrön" },
  { id: "gra-bla", etikett: "Gråblå" },
  { id: "brun", etikett: "Brun" },
  { id: "vit", etikett: "Vit" },
  { id: "annan", etikett: "Annan kulör" },
];

export function etikettForLackadPlatKulor(kulorId: string | undefined): string {
  const id = kulorId?.trim() ?? "";
  if (!id) return "";
  const fast = lackadPlatKulorAlternativ.find((k) => k.id === id);
  if (fast && fast.id !== "annan") return fast.etikett;
  if (id.startsWith("annan:")) return id.slice("annan:".length).trim();
  if (id === "annan") return "";
  return id;
}

/** Alla takmaterial i en lista — för rullgardin i steg 2. */
export type TakBelaggningMaterialVal = {
  id: string;
  etikett: string;
  grupp: string;
};

export const takBelaggningMaterialAlternativ: TakBelaggningMaterialVal[] = [
  ...tegelTyper.map((t) => ({
    id: `tegel:${t.id}`,
    etikett: t.etikett,
    grupp: "Tegel",
  })),
  {
    id: "plat-korrigerad:spik",
    etikett: "Korrugerad plåt — spikad",
    grupp: "Plåt",
  },
  {
    id: "plat-korrigerad:skruv",
    etikett: "Korrugerad plåt — skruvad",
    grupp: "Plåt",
  },
  ...bandlagdMaterial.map((m) => ({
    id: `plat-bandlagd:${m.id}`,
    etikett: m.etikett,
    grupp: "Bandlagd plåt",
  })),
  { id: "papp", etikett: "Papp / underlag", grupp: "Papp" },
];

export function takMaterialValIdFranPost(post: TakBelaggningPost): string {
  if (post.huvudtyp === "papp") return "papp";
  if (post.huvudtyp === "tegel") {
    return `tegel:${post.tegelTyp === "lertegel" ? "lertegel" : "betongpannor"}`;
  }
  if (post.huvudtyp === "plat-korrigerad") {
    return `plat-korrigerad:${post.korrigeradInfastning === "skruv" ? "skruv" : "spik"}`;
  }
  if (post.huvudtyp === "plat-bandlagd") {
    const mat = post.bandlagdMaterial ?? "stalplat";
    return `plat-bandlagd:${mat}`;
  }
  return "tegel:betongpannor";
}

export function postPatchFranTakMaterialVal(
  valId: string,
  befintlig?: TakBelaggningPost,
): Partial<TakBelaggningPost> {
  if (valId === "papp") {
    return { huvudtyp: "papp" };
  }
  if (valId.startsWith("tegel:")) {
    const typ: TegelTyp =
      valId.endsWith(":lertegel") ? "lertegel" : "betongpannor";
    return {
      huvudtyp: "tegel",
      tegelTyp: typ,
      tegelKulor: befintlig?.tegelKulor ?? "",
    };
  }
  if (valId.startsWith("plat-korrigerad:")) {
    const inf: KorrigeradInfastning = valId.endsWith(":skruv")
      ? "skruv"
      : "spik";
    return { huvudtyp: "plat-korrigerad", korrigeradInfastning: inf };
  }
  if (valId.startsWith("plat-bandlagd:")) {
    const raw = valId.slice("plat-bandlagd:".length) as BandlagdPlatMaterial;
    const mat: BandlagdPlatMaterial =
      raw === "koppar" ||
      raw === "aluminium" ||
      raw === "zink" ||
      raw === "rostfritt"
        ? raw
        : "stalplat";
    return {
      huvudtyp: "plat-bandlagd",
      bandlagdMaterial: mat,
      bandlagdKulor:
        mat === "stalplat" ? (befintlig?.bandlagdKulor ?? "") : undefined,
      aluminiumLackerad:
        mat === "aluminium" ? befintlig?.aluminiumLackerad : undefined,
    };
  }
  return { huvudtyp: "tegel", tegelTyp: "betongpannor", tegelKulor: "" };
}

function standardMangdEnhet(
  huvudtyp: TakBelaggningHuvudtyp,
): TakBelaggningMangdEnhet {
  return huvudtyp === "papp" ? "kvm" : "kvm";
}

function normaliseraMangdEnhet(
  raw: TakBelaggningMangdEnhet | undefined,
): TakBelaggningMangdEnhet {
  if (raw === "antal" || raw === "styck" || raw === "kvm") return raw;
  return "kvm";
}

export function skapaTomTakBelaggningPost(): TakBelaggningPost {
  return {
    id: `tak-${Date.now().toString(36)}`,
    namn: "",
    huvudtyp: "tegel",
    mangd: "",
    mangdEnhet: "kvm",
    tegelTyp: "betongpannor",
    tegelKulor: "",
  };
}

export function skapaTomTakBelaggningData(): TakBelaggningData {
  return { belaggningar: [] };
}

function normaliseraPost(raw: Partial<TakBelaggningPost>, index: number): TakBelaggningPost {
  const huvudtyp = raw.huvudtyp ?? "tegel";
  const post: TakBelaggningPost = {
    id: raw.id?.trim() || `tak-${index + 1}`,
    namn: raw.namn?.trim() ?? "",
    huvudtyp,
    mangd: raw.mangd?.trim() ?? "",
    mangdEnhet: normaliseraMangdEnhet(
      raw.mangdEnhet ?? standardMangdEnhet(huvudtyp),
    ),
  };
  if (huvudtyp === "tegel") {
    post.tegelTyp =
      raw.tegelTyp === "lertegel" ? "lertegel" : "betongpannor";
    post.tegelKulor = raw.tegelKulor?.trim() ?? "";
  }
  if (huvudtyp === "plat-korrigerad") {
    post.korrigeradInfastning =
      raw.korrigeradInfastning === "skruv" ? "skruv" : "spik";
  }
  if (huvudtyp === "plat-bandlagd") {
    const mat = raw.bandlagdMaterial;
    post.bandlagdMaterial =
      mat === "koppar" ||
      mat === "aluminium" ||
      mat === "zink" ||
      mat === "rostfritt"
        ? mat
        : "stalplat";
    if (post.bandlagdMaterial === "stalplat") {
      post.bandlagdKulor = raw.bandlagdKulor?.trim() ?? "";
    }
    if (post.bandlagdMaterial === "aluminium") {
      post.aluminiumLackerad = raw.aluminiumLackerad === true;
    }
  }
  return post;
}

export function normaliseraTakBelaggningData(raw: unknown): TakBelaggningData {
  if (!raw || typeof raw !== "object") return skapaTomTakBelaggningData();
  const belaggningar = Array.isArray((raw as TakBelaggningData).belaggningar)
    ? (raw as TakBelaggningData).belaggningar.map(normaliseraPost)
    : [];
  return { belaggningar };
}

/** Bakåtkompatibilitet — tidigare valda deltyper i komponentregistret. */
const legacyDeltypTillPost: Record<string, Omit<TakBelaggningPost, "id">> = {
  tegel: { huvudtyp: "tegel", tegelTyp: "betongpannor" },
  papp: { huvudtyp: "papp" },
  "korrugerad-plat": {
    huvudtyp: "plat-korrigerad",
    korrigeradInfastning: "spik",
  },
  "bandlaggd-plat": {
    huvudtyp: "plat-bandlagd",
    bandlagdMaterial: "stalplat",
  },
  "bandlaggd-koppar": {
    huvudtyp: "plat-bandlagd",
    bandlagdMaterial: "koppar",
  },
  "bandlaggd-aluminium": {
    huvudtyp: "plat-bandlagd",
    bandlagdMaterial: "aluminium",
  },
  "bandlaggd-zink": {
    huvudtyp: "plat-bandlagd",
    bandlagdMaterial: "zink",
  },
  "bandlaggd-rostfritt": {
    huvudtyp: "plat-bandlagd",
    bandlagdMaterial: "rostfritt",
  },
};

export function migreraTakBelaggningFranDeltyper(
  valdaDeltyper: string[],
  befintlig?: TakBelaggningData,
): TakBelaggningData {
  const nu = normaliseraTakBelaggningData(befintlig);
  if (nu.belaggningar.length > 0) return nu;
  const belaggningar = valdaDeltyper
    .map((id) => legacyDeltypTillPost[id])
    .filter(Boolean)
    .map((mall, i) => ({
      ...mall,
      id: `tak-migr-${i + 1}`,
    })) as TakBelaggningPost[];
  return { belaggningar };
}

export function valdaDeltyperFranTakBelaggning(
  data: TakBelaggningData,
): string[] {
  const ids: string[] = [];
  for (const p of data.belaggningar) {
    if (p.huvudtyp === "tegel") ids.push("tegel");
    else if (p.huvudtyp === "papp") ids.push("papp");
    else if (p.huvudtyp === "plat-korrigerad") ids.push("korrugerad-plat");
    else if (p.huvudtyp === "plat-bandlagd") {
      switch (p.bandlagdMaterial) {
        case "koppar":
          ids.push("bandlaggd-koppar");
          break;
        case "aluminium":
          ids.push("bandlaggd-aluminium");
          break;
        case "zink":
          ids.push("bandlaggd-zink");
          break;
        case "rostfritt":
          ids.push("bandlaggd-rostfritt");
          break;
        default:
          ids.push("bandlaggd-plat");
      }
    }
  }
  return [...new Set(ids)];
}

export function postKanMalas(post: TakBelaggningPost): boolean {
  if (post.huvudtyp === "plat-korrigerad") return true;
  if (post.huvudtyp === "plat-bandlagd") {
    if (post.bandlagdMaterial === "stalplat") return true;
    if (post.bandlagdMaterial === "aluminium") {
      return post.aluminiumLackerad === true;
    }
  }
  return false;
}

export function takBelaggningKanMalas(data: TakBelaggningData): boolean {
  return data.belaggningar.some(postKanMalas);
}

export function takBelaggningHarTegel(data: TakBelaggningData): boolean {
  return data.belaggningar.some((p) => p.huvudtyp === "tegel");
}

function huvudtypEtikett(h: TakBelaggningHuvudtyp): string {
  switch (h) {
    case "tegel":
      return "Tegel";
    case "plat-korrigerad":
      return "Korrugerad plåt";
    case "plat-bandlagd":
      return "Bandlagd plåt";
    case "papp":
      return "Papp";
  }
}

export function materialEtikettTakBelaggningPost(
  post: TakBelaggningPost,
): string {
  const delar = [huvudtypEtikett(post.huvudtyp)];
  if (post.huvudtyp === "tegel") {
    const typ =
      tegelTyper.find((t) => t.id === post.tegelTyp)?.etikett ?? "Tegel";
    delar.push(typ);
    if (post.tegelKulor?.trim()) delar.push(`kulör ${post.tegelKulor.trim()}`);
  }
  if (post.huvudtyp === "plat-korrigerad") {
    delar.push(
      post.korrigeradInfastning === "skruv" ? "skruv" : "spik",
    );
    delar.push("bärläkt/ströläkt");
  }
  if (post.huvudtyp === "plat-bandlagd") {
    const mat =
      bandlagdMaterial.find((m) => m.id === post.bandlagdMaterial)?.etikett ??
      "Plåt";
    delar.push(mat);
    if (post.bandlagdMaterial === "stalplat") {
      const kulor = etikettForLackadPlatKulor(post.bandlagdKulor);
      if (kulor) delar.push(`kulör ${kulor}`);
    }
    delar.push("dold infästning på underlag");
  }
  if (postKanMalas(post)) delar.push("målning möjlig");
  else delar.push("rengöring");
  return delar.join(" · ");
}

export function formateraTakBelaggningPost(post: TakBelaggningPost): string {
  const material = materialEtikettTakBelaggningPost(post);
  const namn = post.namn?.trim();
  const enhet = normaliseraMangdEnhet(post.mangdEnhet);
  const mangd = post.mangd?.trim();
  const mangdText = mangd
    ? `${mangd} ${takBelaggningMangdEnhetEtiketter[enhet].enhet}`
    : "";
  if (namn) {
    return mangdText
      ? `${namn}: ${material} · ${mangdText}`
      : `${namn}: ${material}`;
  }
  return mangdText ? `${material} · ${mangdText}` : material;
}

export function summeraTakBelaggningKvm(data: TakBelaggningData): number {
  const mangder = data.belaggningar
    .filter((p) => normaliseraMangdEnhet(p.mangdEnhet) === "kvm")
    .map((p) => p.mangd?.trim() ?? "")
    .filter(Boolean);
  return parseNummerSumma(mangder);
}

export function formateraTakBelaggning(data: TakBelaggningData): string {
  if (data.belaggningar.length === 0) return "";
  return data.belaggningar.map(formateraTakBelaggningPost).join(" | ");
}

export function skapaTomTakBelaggningRegister(
  mall: import("@/components/underhallsplan/komponentregister").KomponentMall,
): TakBelaggningRegister {
  const reg: TakBelaggningRegister = {};
  for (const def of mall.underkomponenter) {
    if (def.detaljPanel === "takbelaggning-val") {
      reg[def.id] = skapaTomTakBelaggningData();
    }
  }
  return reg;
}
