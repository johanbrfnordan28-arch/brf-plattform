import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type BalkongTypId =
  | "fransk-balkong"
  | "utvandig-balkong"
  | "ytterhornsbalkong"
  | "innerhornsbalkong"
  | "ingaende-balkong"
  | "altan"
  | "loggia";

/** Renovering av befintlig balkong, eller ny inskaffning / helt ny investering */
export type BalkongAtgardId =
  | "renovering"
  | "ny-inskaffning"
  | "ny-investering";

/** Hur balkongen är uppbyggd i fastigheten */
export type BalkongKonstruktionId = "helgjuten" | "konsol" | "tillbyggd";

export type BalkongRakeMaterialId =
  | "pulverlackad-smidesjarn"
  | "stal"
  | "aluminium";

export type BalkongGolvMaterialId = string;

export type BalkongGolvAlternativ = {
  id: BalkongGolvMaterialId;
  etikett: string;
};

export type BalkongDelId =
  | "balkongplatta"
  | "tatskikt"
  | "fallspackel"
  | "sockel"
  | "droppnasa-kantbleck"
  | "avvattning";

export type BalkongDelEnhet = "m2" | "m" | "st";

export type BalkongDelDef = {
  id: BalkongDelId;
  etikett: string;
  enhet: BalkongDelEnhet;
  beskrivning: string;
};

export type BalkongDelRad = {
  delId: BalkongDelId;
  aktiv: boolean;
  mangd: string;
};

export type BalkongPost = {
  id: string;
  /** T.ex. Fransk balkong väster */
  namn: string;
  /** Renovering, ny modul eller helt ny balkong i fastigheten */
  atgard: BalkongAtgardId;
  /** Fördefinierad eller egen typ-id (egen-…). */
  balkongTyp: string;
  /** Gäller balkonger med platta — helgjuten, konsol eller tillbyggd modul */
  konstruktion: BalkongKonstruktionId;
  rakeMaterial: BalkongRakeMaterialId;
  /** Balkongräcke — löpmeter */
  rakeLopmeter: string;
  golvMaterial: BalkongGolvMaterialId;
  golvAnnanText: string;
  /** Ytskikt / golvyta (valfritt) */
  golvKvm: string;
  /** Underhållsdelar: tätskikt, fall, sockel m.m. */
  delar: BalkongDelRad[];
  /** Egna enhetspriser — tomma fält använder riktpris */
  priser?: BalkongPriser;
};

export type BalkongPriser = {
  balkongplatta: string;
  tatskikt: string;
  fallspackel: string;
  sockel: string;
  "droppnasa-kantbleck": string;
  avvattning: string;
  rake: string;
  golv: string;
  tillbyggdFast: string;
};

export const balkongAtgardAlternativ: {
  id: BalkongAtgardId;
  etikett: string;
  beskrivning: string;
  investering: boolean;
}[] = [
  {
    id: "renovering",
    etikett: "Renovering",
    beskrivning:
      "Underhåll eller renovering av befintlig balkong — ingår i underhållsplanen.",
    investering: false,
  },
  {
    id: "ny-inskaffning",
    etikett: "Ny inskaffning",
    beskrivning:
      "Byte eller tillbyggnad av balkongmodul på befintlig fasad — investering.",
    investering: true,
  },
  {
    id: "ny-investering",
    etikett: "Ny investering",
    beskrivning:
      "Helt ny balkong som inte funnits tidigare — kapitalinvestering.",
    investering: true,
  },
];

export const balkongTyper: {
  id: BalkongTypId;
  etikett: string;
  beskrivning?: string;
}[] = [
  {
    id: "fransk-balkong",
    etikett: "Fransk balkong",
    beskrivning: "Fönsterdörr med räcke utanför — ingen gåbar platta.",
  },
  {
    id: "utvandig-balkong",
    etikett: "Utvändig balkong",
    beskrivning: "Gåbar platta utanför fasaden.",
  },
  {
    id: "ytterhornsbalkong",
    etikett: "Ytterhörnsbalkong",
    beskrivning: "Vinklad balkong som sträcker sig runt byggnadshörnet.",
  },
  {
    id: "innerhornsbalkong",
    etikett: "Innerhörnsbalkong",
    beskrivning: "Balkong i innergårdshörn — vinklad mot gård eller gång.",
  },
  {
    id: "ingaende-balkong",
    etikett: "Ingående balkong",
    beskrivning: "Platta inbyggd i fasadlivet.",
  },
  { id: "altan", etikett: "Altan", beskrivning: "Öppen uteplats på mark eller bjälklag." },
  {
    id: "loggia",
    etikett: "Loggia (inglasad)",
    beskrivning: "Inglasad balkong eller uteplats.",
  },
];

/** Föreningsspecifik balkongtyp — mallTyp styr delar och golvval. */
export type EgnaBalkongTypDef = {
  id: string;
  etikett: string;
  beskrivning?: string;
  mallTyp: BalkongTypId;
};

export function skapaEgnaBalkongTypId(): string {
  return `egen-${Date.now().toString(36).slice(2, 8)}`;
}

export function normaliseraEgnaBalkongTyper(
  raw: EgnaBalkongTypDef[] | undefined,
): EgnaBalkongTypDef[] {
  if (!raw?.length) return [];
  return raw.map((t, i) => ({
    id:
      t.id?.trim().startsWith("egen-") && t.id.trim()
        ? t.id.trim()
        : skapaEgnaBalkongTypId(),
    etikett: t.etikett?.trim() || `Egen balkongtyp ${i + 1}`,
    beskrivning: t.beskrivning?.trim() ?? "",
    mallTyp: balkongTyper.some((b) => b.id === t.mallTyp)
      ? t.mallTyp
      : "utvandig-balkong",
  }));
}

export type BalkongTypVal = {
  id: string;
  etikett: string;
  beskrivning?: string;
  ärEgen?: boolean;
};

export function hamtaBalkongTypVal(
  egna: EgnaBalkongTypDef[] = [],
): BalkongTypVal[] {
  return [
    ...balkongTyper.map((t) => ({ ...t, ärEgen: false as const })),
    ...normaliseraEgnaBalkongTyper(egna).map((t) => ({
      id: t.id,
      etikett: t.etikett,
      beskrivning: t.beskrivning,
      ärEgen: true as const,
    })),
  ];
}

export function losBalkongMallTyp(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): BalkongTypId {
  const egen = normaliseraEgnaBalkongTyper(egna).find((e) => e.id === typ);
  if (egen) return egen.mallTyp;
  if (balkongTyper.some((t) => t.id === typ)) return typ as BalkongTypId;
  return "utvandig-balkong";
}

export const balkongKonstruktioner: {
  id: BalkongKonstruktionId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "helgjuten",
    etikett: "Helgjuten balkongplatta",
    beskrivning: "Platsgjuten och fast i fastighetens stomme.",
  },
  {
    id: "konsol",
    etikett: "Konsolbalkong",
    beskrivning: "Utkragande platta — ofta gjuten i fasaden.",
  },
  {
    id: "tillbyggd",
    etikett: "Tillbyggd balkong",
    beskrivning:
      "Eftermonterad modul (prefabricerad). Branschen säger tillbyggd eller prefab — inte «kassettbalkong».",
  },
];

export const balkongRakeMaterial: {
  id: BalkongRakeMaterialId;
  etikett: string;
}[] = [
  { id: "pulverlackad-smidesjarn", etikett: "Pulverlackad smidesjärn" },
  { id: "stal", etikett: "Stål" },
  { id: "aluminium", etikett: "Aluminium" },
];

export const balkongDelarMall: BalkongDelDef[] = [
  {
    id: "balkongplatta",
    etikett: "Balkongplatta",
    enhet: "m2",
    beskrivning: "Bärande betong — lagning, omgjutning eller byte.",
  },
  {
    id: "tatskikt",
    etikett: "Tätskikt",
    enhet: "m2",
    beskrivning: "Membran eller duk med uppvik mot vägg och tröskel.",
  },
  {
    id: "fallspackel",
    etikett: "Fall / fallspackel",
    enhet: "m2",
    beskrivning: "Lutning mot spygatt — ofta ca 1:60–1:80.",
  },
  {
    id: "sockel",
    etikett: "Sockel / kantbalk",
    enhet: "m",
    beskrivning: "Kant mot fasad och dörrtröskel — ofta med dropp.",
  },
  {
    id: "droppnasa-kantbleck",
    etikett: "Droppnäsa / kantbleck",
    enhet: "m",
    beskrivning: "Plåt som leder bort vatten från plattans kant.",
  },
  {
    id: "avvattning",
    etikett: "Spygatt / avvattning",
    enhet: "st",
    beskrivning: "Avvattningshål och rännor på plattan.",
  },
];

const golvMedPlatta: BalkongGolvAlternativ[] = [
  { id: "betong", etikett: "Betong / slät platta" },
  { id: "klinker", etikett: "Klinker / keramik" },
  { id: "tra-composit", etikett: "Trädäck / komposit" },
  { id: "plat", etikett: "Plåtbeläggning" },
  { id: "sten", etikett: "Natursten / betongplattor" },
  { id: "annat", etikett: "Annat" },
];

const balkongGolvPerTyp: Record<BalkongTypId, BalkongGolvAlternativ[]> = {
  "fransk-balkong": [
    { id: "ingen-platta", etikett: "Ingen golvyta (endast räcke)" },
    { id: "konsol-sten", etikett: "Stenkonsol / platta under fönster" },
    { id: "annat", etikett: "Annat" },
  ],
  "utvandig-balkong": golvMedPlatta,
  "ytterhornsbalkong": golvMedPlatta,
  innerhornsbalkong: golvMedPlatta,
  "ingaende-balkong": [
    { id: "betong", etikett: "Betong" },
    { id: "klinker", etikett: "Klinker / keramik" },
    { id: "tra-composit", etikett: "Trädäck / komposit" },
    { id: "annat", etikett: "Annat" },
  ],
  altan: [
    { id: "tra-composit", etikett: "Trädäck / komposit" },
    { id: "betong", etikett: "Betongplatta" },
    { id: "sten", etikett: "Natursten / plattor" },
    { id: "klinker", etikett: "Klinker (ovanligt)" },
    { id: "annat", etikett: "Annat" },
  ],
  loggia: [
    { id: "klinker", etikett: "Klinker / keramik" },
    { id: "betong", etikett: "Betong" },
    { id: "tra-composit", etikett: "Trädäck / komposit" },
    { id: "annat", etikett: "Annat" },
  ],
};

/** Underkomponent-id under Fasad */
export const BALKONGER_UNDERKOMPONENT_ID = "balkonger";

/** Tidigare underkomponent — migreras till balkonger */
export const LEGACY_BALKONGANSLUTNING_ID = "balkonganslutning";

export function skapaBalkongPostId(): string {
  return `balkong-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function balkongHarPlatta(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): boolean {
  return losBalkongMallTyp(typ, egna) !== "fransk-balkong";
}

export function balkongVisarKonstruktion(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): boolean {
  return balkongHarPlatta(typ, egna);
}

export function hamtaBalkongDelar(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): BalkongDelDef[] {
  const mall = losBalkongMallTyp(typ, egna);
  if (!balkongHarPlatta(mall)) return [];
  return balkongDelarMall;
}

export function hamtaBalkongGolvAlternativ(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): BalkongGolvAlternativ[] {
  const mall = losBalkongMallTyp(typ, egna);
  return balkongGolvPerTyp[mall] ?? balkongGolvPerTyp["utvandig-balkong"];
}

export function standardBalkongGolv(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): BalkongGolvMaterialId {
  return hamtaBalkongGolvAlternativ(typ, egna)[0]?.id ?? "betong";
}

export function standardBalkongKonstruktion(
  typ: string,
  atgard: BalkongAtgardId = "renovering",
  egna: EgnaBalkongTypDef[] = [],
): BalkongKonstruktionId {
  const mall = losBalkongMallTyp(typ, egna);
  if (atgard !== "renovering" && balkongHarPlatta(mall)) return "tillbyggd";
  if (mall === "altan") return "tillbyggd";
  return "helgjuten";
}

export function balkongArInvestering(atgard: BalkongAtgardId): boolean {
  return balkongAtgardAlternativ.find((a) => a.id === atgard)?.investering ?? false;
}

export function balkongAtgardEtikett(id: BalkongAtgardId): string {
  return balkongAtgardAlternativ.find((a) => a.id === id)?.etikett ?? id;
}

function delEnhetEtikett(enhet: BalkongDelEnhet): string {
  if (enhet === "m2") return "m²";
  if (enhet === "m") return "m";
  return "st";
}

export function skapaTomBalkongDelar(
  typ: string,
  egna: EgnaBalkongTypDef[] = [],
): BalkongDelRad[] {
  return hamtaBalkongDelar(typ, egna).map((d) => ({
    delId: d.id,
    aktiv: false,
    mangd: "",
  }));
}

function slåIhopBalkongDelar(
  typ: string,
  befintliga: BalkongDelRad[] | undefined,
  egna: EgnaBalkongTypDef[],
): BalkongDelRad[] {
  const mall = skapaTomBalkongDelar(typ, egna);
  if (!befintliga?.length) return mall;
  return mall.map((m) => {
    const rad = befintliga.find((r) => r.delId === m.delId);
    return rad ? { ...m, aktiv: rad.aktiv, mangd: rad.mangd } : m;
  });
}

function normaliseraBalkongAtgard(
  raw: BalkongPost["atgard"] | undefined,
): BalkongAtgardId {
  if (raw && balkongAtgardAlternativ.some((a) => a.id === raw)) return raw;
  return "renovering";
}

export function normaliseraBalkongPost(
  post: BalkongPost,
  egna: EgnaBalkongTypDef[] = [],
): BalkongPost {
  const atgard = normaliseraBalkongAtgard(post.atgard);
  const alternativ = hamtaBalkongGolvAlternativ(post.balkongTyp, egna);
  const golvMaterial = alternativ.some((a) => a.id === post.golvMaterial)
    ? post.golvMaterial
    : standardBalkongGolv(post.balkongTyp, egna);
  const konstruktion = balkongKonstruktioner.some(
    (k) => k.id === post.konstruktion,
  )
    ? post.konstruktion
    : standardBalkongKonstruktion(post.balkongTyp, atgard, egna);

  return {
    ...post,
    atgard,
    konstruktion: balkongVisarKonstruktion(post.balkongTyp, egna)
      ? konstruktion
      : standardBalkongKonstruktion(post.balkongTyp, atgard, egna),
    golvMaterial,
    golvAnnanText: golvMaterial === "annat" ? post.golvAnnanText : "",
    delar: slåIhopBalkongDelar(post.balkongTyp, post.delar, egna),
    priser: post.priser,
    rakeLopmeter:
      post.rakeLopmeter.trim() ||
      (post as BalkongPost & { rakeAntal?: string }).rakeAntal?.trim() ||
      "",
  };
}

export function skapaTomBalkongPost(
  namn = "",
  balkongTyp: string = "utvandig-balkong",
  atgard: BalkongAtgardId = "renovering",
  egna: EgnaBalkongTypDef[] = [],
): BalkongPost {
  return {
    id: skapaBalkongPostId(),
    namn,
    atgard,
    balkongTyp,
    konstruktion: standardBalkongKonstruktion(balkongTyp, atgard, egna),
    rakeMaterial: "pulverlackad-smidesjarn",
    rakeLopmeter: "",
    golvMaterial: standardBalkongGolv(balkongTyp, egna),
    golvAnnanText: "",
    golvKvm: "",
    delar: skapaTomBalkongDelar(balkongTyp, egna),
    priser: undefined,
  };
}

export function balkongTypEtikett(
  id: string,
  egna: EgnaBalkongTypDef[] = [],
): string {
  const egen = normaliseraEgnaBalkongTyper(egna).find((e) => e.id === id);
  if (egen) return egen.etikett;
  return balkongTyper.find((t) => t.id === id)?.etikett ?? id;
}

function konstruktionEtikett(id: BalkongKonstruktionId): string {
  return balkongKonstruktioner.find((k) => k.id === id)?.etikett ?? id;
}

function rakeMaterialEtikett(id: BalkongRakeMaterialId): string {
  return balkongRakeMaterial.find((m) => m.id === id)?.etikett ?? id;
}

function golvMaterialEtikett(
  typ: string,
  id: BalkongGolvMaterialId,
  annanText: string,
  egna: EgnaBalkongTypDef[] = [],
): string {
  if (id === "annat") {
    const text = annanText.trim();
    return text || "Annat ytskikt";
  }
  return (
    hamtaBalkongGolvAlternativ(typ, egna).find((g) => g.id === id)?.etikett ??
    id
  );
}

function balkongDelEtikett(delId: BalkongDelId): string {
  return balkongDelarMall.find((d) => d.id === delId)?.etikett ?? delId;
}

function formateraBalkongDelar(p: BalkongPost): string[] {
  const delar: string[] = [];
  for (const rad of p.delar.filter((r) => r.aktiv)) {
    const def = balkongDelarMall.find((d) => d.id === rad.delId);
    const enhet = def ? delEnhetEtikett(def.enhet) : "";
    const mangd = rad.mangd.trim();
    if (mangd) {
      const n = parseNummerSumma([mangd]);
      delar.push(
        `${balkongDelEtikett(rad.delId)} ${
          n > 0 ? `${formatSummeringTal(n)} ${enhet}` : `${mangd} ${enhet}`
        }`,
      );
    } else {
      delar.push(balkongDelEtikett(rad.delId));
    }
  }
  return delar;
}

export function formateraBalkongPost(
  post: BalkongPost,
  egna: EgnaBalkongTypDef[] = [],
): string {
  const p = normaliseraBalkongPost(post, egna);
  const rubrik = p.namn.trim() || balkongTypEtikett(p.balkongTyp, egna);
  const delar: string[] = [
    balkongAtgardEtikett(p.atgard),
    balkongTypEtikett(p.balkongTyp, egna),
  ];

  if (balkongVisarKonstruktion(p.balkongTyp, egna)) {
    delar.push(konstruktionEtikett(p.konstruktion));
  }

  const rakeLm = p.rakeLopmeter.trim();
  delar.push(
    rakeLm
      ? `räcke ${rakeLm} m (${rakeMaterialEtikett(p.rakeMaterial)})`
      : `räcke ${rakeMaterialEtikett(p.rakeMaterial)}`,
  );

  if (p.golvMaterial !== "ingen-platta") {
    const ytskikt = golvMaterialEtikett(
      p.balkongTyp,
      p.golvMaterial,
      p.golvAnnanText,
      egna,
    );
    delar.push(
      p.golvKvm.trim()
        ? `ytskikt ${ytskikt} ${p.golvKvm.trim()} m²`
        : `ytskikt ${ytskikt}`,
    );
  }

  delar.push(...formateraBalkongDelar(p));

  return `${rubrik}: ${delar.join(", ")}`;
}

export function summeraBalkongPoster(
  poster: BalkongPost[],
  egna: EgnaBalkongTypDef[] = [],
): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal balkongrader", varde: `${poster.length} st` },
  ];

  for (const atgard of balkongAtgardAlternativ) {
    const antal = poster.filter(
      (p) => normaliseraBalkongPost(p, egna).atgard === atgard.id,
    ).length;
    if (antal > 0) {
      rader.push({ etikett: atgard.etikett, varde: `${antal} st` });
    }
  }

  const investeringar = poster.filter((p) =>
    balkongArInvestering(normaliseraBalkongPost(p, egna).atgard),
  ).length;
  if (investeringar > 0) {
    rader.push({
      etikett: "Investeringar (nytt)",
      varde: `${investeringar} st`,
    });
  }

  for (const typ of hamtaBalkongTypVal(egna)) {
    const antal = poster.filter((p) => p.balkongTyp === typ.id).length;
    if (antal > 0) {
      rader.push({ etikett: typ.etikett, varde: `${antal} st` });
    }
  }

  for (const konstr of balkongKonstruktioner) {
    const antal = poster.filter(
      (p) =>
        balkongVisarKonstruktion(p.balkongTyp, egna) &&
        normaliseraBalkongPost(p, egna).konstruktion === konstr.id,
    ).length;
    if (antal > 0) {
      rader.push({ etikett: konstr.etikett, varde: `${antal} st` });
    }
  }

  const rakeLm = parseNummerSumma(
    poster.map((p) => normaliseraBalkongPost(p, egna).rakeLopmeter),
  );
  if (rakeLm > 0) {
    rader.push({
      etikett: "Balkongräcke totalt",
      varde: `${formatSummeringTal(rakeLm)} m`,
    });
  }

  const golvKvm = parseNummerSumma(
    poster
      .map((p) => normaliseraBalkongPost(p, egna))
      .filter((p) => p.golvMaterial !== "ingen-platta")
      .map((p) => p.golvKvm),
  );
  if (golvKvm > 0) {
    rader.push({
      etikett: "Ytskikt golv totalt",
      varde: `${formatSummeringTal(golvKvm)} m²`,
    });
  }

  for (const def of balkongDelarMall) {
    const mangder = poster
      .map((p) => normaliseraBalkongPost(p, egna))
      .flatMap((p) => p.delar)
      .filter((r) => r.aktiv && r.delId === def.id && r.mangd.trim())
      .map((r) => r.mangd);
    const summa = parseNummerSumma(mangder);
    if (summa > 0) {
      rader.push({
        etikett: `${def.etikett} totalt`,
        varde: `${formatSummeringTal(summa)} ${delEnhetEtikett(def.enhet)}`,
      });
    }
  }

  return rader;
}

export function formateraBalkongSummering(
  poster: BalkongPost[],
  egna: EgnaBalkongTypDef[] = [],
): string {
  return formateraSummeringRader(summeraBalkongPoster(poster, egna));
}

export function formateraBalkongPoster(
  poster: BalkongPost[],
  egna: EgnaBalkongTypDef[] = [],
): string {
  return formateraBalkongSummering(poster, egna);
}
