/** Takbeläggning — materialvägar och underhållsregler (tegel, plåt, papp). */

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
  huvudtyp: TakBelaggningHuvudtyp;
  tegelTyp?: TegelTyp;
  /** Kulör på tegelpannor, t.ex. röd, svart glaserad. */
  tegelKulor?: string;
  bandlagdMaterial?: BandlagdPlatMaterial;
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
    etikett: "Plåt (målad stålplåt)",
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

export function skapaTomTakBelaggningPost(): TakBelaggningPost {
  return {
    id: `tak-${Date.now().toString(36)}`,
    huvudtyp: "tegel",
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
    huvudtyp,
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

export function formateraTakBelaggningPost(post: TakBelaggningPost): string {
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
    delar.push("dold infästning på underlag");
  }
  if (postKanMalas(post)) delar.push("målning möjlig");
  else delar.push("rengöring");
  return delar.join(" · ");
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
