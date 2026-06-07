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
  balkongTyp: BalkongTypId;
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

export function balkongHarPlatta(typ: BalkongTypId): boolean {
  return typ !== "fransk-balkong";
}

export function balkongVisarKonstruktion(typ: BalkongTypId): boolean {
  return balkongHarPlatta(typ);
}

export function hamtaBalkongDelar(typ: BalkongTypId): BalkongDelDef[] {
  if (!balkongHarPlatta(typ)) return [];
  return balkongDelarMall;
}

export function hamtaBalkongGolvAlternativ(
  typ: BalkongTypId,
): BalkongGolvAlternativ[] {
  return balkongGolvPerTyp[typ] ?? balkongGolvPerTyp["utvandig-balkong"];
}

export function standardBalkongGolv(typ: BalkongTypId): BalkongGolvMaterialId {
  return hamtaBalkongGolvAlternativ(typ)[0]?.id ?? "betong";
}

export function standardBalkongKonstruktion(
  typ: BalkongTypId,
  atgard: BalkongAtgardId = "renovering",
): BalkongKonstruktionId {
  if (atgard !== "renovering" && balkongHarPlatta(typ)) return "tillbyggd";
  if (typ === "altan") return "tillbyggd";
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

export function skapaTomBalkongDelar(typ: BalkongTypId): BalkongDelRad[] {
  return hamtaBalkongDelar(typ).map((d) => ({
    delId: d.id,
    aktiv: false,
    mangd: "",
  }));
}

function slåIhopBalkongDelar(
  typ: BalkongTypId,
  befintliga?: BalkongDelRad[],
): BalkongDelRad[] {
  const mall = skapaTomBalkongDelar(typ);
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

export function normaliseraBalkongPost(post: BalkongPost): BalkongPost {
  const atgard = normaliseraBalkongAtgard(post.atgard);
  const alternativ = hamtaBalkongGolvAlternativ(post.balkongTyp);
  const golvMaterial = alternativ.some((a) => a.id === post.golvMaterial)
    ? post.golvMaterial
    : standardBalkongGolv(post.balkongTyp);
  const konstruktion = balkongKonstruktioner.some(
    (k) => k.id === post.konstruktion,
  )
    ? post.konstruktion
    : standardBalkongKonstruktion(post.balkongTyp, atgard);

  return {
    ...post,
    atgard,
    konstruktion: balkongVisarKonstruktion(post.balkongTyp)
      ? konstruktion
      : standardBalkongKonstruktion(post.balkongTyp, atgard),
    golvMaterial,
    golvAnnanText: golvMaterial === "annat" ? post.golvAnnanText : "",
    delar: slåIhopBalkongDelar(post.balkongTyp, post.delar),
    priser: post.priser,
    rakeLopmeter:
      post.rakeLopmeter.trim() ||
      (post as BalkongPost & { rakeAntal?: string }).rakeAntal?.trim() ||
      "",
  };
}

export function skapaTomBalkongPost(
  namn = "",
  balkongTyp: BalkongTypId = "fransk-balkong",
  atgard: BalkongAtgardId = "renovering",
): BalkongPost {
  return {
    id: skapaBalkongPostId(),
    namn,
    atgard,
    balkongTyp,
    konstruktion: standardBalkongKonstruktion(balkongTyp, atgard),
    rakeMaterial: "pulverlackad-smidesjarn",
    rakeLopmeter: "",
    golvMaterial: standardBalkongGolv(balkongTyp),
    golvAnnanText: "",
    golvKvm: "",
    delar: skapaTomBalkongDelar(balkongTyp),
    priser: undefined,
  };
}

export function balkongTypEtikett(id: BalkongTypId): string {
  return balkongTyper.find((t) => t.id === id)?.etikett ?? id;
}

function konstruktionEtikett(id: BalkongKonstruktionId): string {
  return balkongKonstruktioner.find((k) => k.id === id)?.etikett ?? id;
}

function rakeMaterialEtikett(id: BalkongRakeMaterialId): string {
  return balkongRakeMaterial.find((m) => m.id === id)?.etikett ?? id;
}

function golvMaterialEtikett(
  typ: BalkongTypId,
  id: BalkongGolvMaterialId,
  annanText: string,
): string {
  if (id === "annat") {
    const text = annanText.trim();
    return text || "Annat ytskikt";
  }
  return (
    hamtaBalkongGolvAlternativ(typ).find((g) => g.id === id)?.etikett ?? id
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

export function formateraBalkongPost(post: BalkongPost): string {
  const p = normaliseraBalkongPost(post);
  const rubrik = p.namn.trim() || balkongTypEtikett(p.balkongTyp);
  const delar: string[] = [
    balkongAtgardEtikett(p.atgard),
    balkongTypEtikett(p.balkongTyp),
  ];

  if (balkongVisarKonstruktion(p.balkongTyp)) {
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

export function summeraBalkongPoster(poster: BalkongPost[]): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal balkongrader", varde: `${poster.length} st` },
  ];

  for (const atgard of balkongAtgardAlternativ) {
    const antal = poster.filter(
      (p) => normaliseraBalkongPost(p).atgard === atgard.id,
    ).length;
    if (antal > 0) {
      rader.push({ etikett: atgard.etikett, varde: `${antal} st` });
    }
  }

  const investeringar = poster.filter((p) =>
    balkongArInvestering(normaliseraBalkongPost(p).atgard),
  ).length;
  if (investeringar > 0) {
    rader.push({
      etikett: "Investeringar (nytt)",
      varde: `${investeringar} st`,
    });
  }

  for (const typ of balkongTyper) {
    const antal = poster.filter((p) => p.balkongTyp === typ.id).length;
    if (antal > 0) {
      rader.push({ etikett: typ.etikett, varde: `${antal} st` });
    }
  }

  for (const konstr of balkongKonstruktioner) {
    const antal = poster.filter(
      (p) =>
        balkongVisarKonstruktion(p.balkongTyp) &&
        normaliseraBalkongPost(p).konstruktion === konstr.id,
    ).length;
    if (antal > 0) {
      rader.push({ etikett: konstr.etikett, varde: `${antal} st` });
    }
  }

  const rakeLm = parseNummerSumma(
    poster.map((p) => normaliseraBalkongPost(p).rakeLopmeter),
  );
  if (rakeLm > 0) {
    rader.push({
      etikett: "Balkongräcke totalt",
      varde: `${formatSummeringTal(rakeLm)} m`,
    });
  }

  const golvKvm = parseNummerSumma(
    poster
      .map(normaliseraBalkongPost)
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
      .map(normaliseraBalkongPost)
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

export function formateraBalkongSummering(poster: BalkongPost[]): string {
  return formateraSummeringRader(summeraBalkongPoster(poster));
}

export function formateraBalkongPoster(poster: BalkongPost[]): string {
  return formateraBalkongSummering(poster);
}
