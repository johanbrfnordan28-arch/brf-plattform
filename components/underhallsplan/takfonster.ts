import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  formatSummeringTal,
  formateraSummeringRader,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

/** Underkomponent-id under Tak */
export const TAKFONSTER_UNDERKOMPONENT_ID = "takfonster";

export const TAKFONSTER_STORLEK_ANNAT = "annat";

/** Yttre karm (bredd × höjd mm) — vanliga standardmått på marknaden. */
export type TakfonsterStorlek = {
  id: string;
  etikett: string;
  breddMm: number;
  hojdMm: number;
};

/** Del 1 — ett takfönster per enhet. */
export type TakfonsterSingelPost = {
  id: string;
  namn: string;
  storlekId: string;
  breddMm: string;
  hojdMm: string;
  antal: string;
  enhetsprisKr: string;
};

/** Del 2 — flera fönster monterade i rad (en kombinationsenhet). */
export type TakfonsterKombinationPost = {
  id: string;
  namn: string;
  /** Antal fönster i rad (2–4) */
  fonsterIRad: string;
  /** Modulmått per fönster i kombinationen */
  modulStorlekId: string;
  breddMm: string;
  hojdMm: string;
  antal: string;
  enhetsprisKr: string;
};

export type TakfonsterData = {
  singel: TakfonsterSingelPost[];
  kombinationer: TakfonsterKombinationPost[];
};

export const takfonsterIRadAlternativ: { id: string; etikett: string }[] = [
  { id: "2", etikett: "2 fönster i rad" },
  { id: "3", etikett: "3 fönster i rad" },
  { id: "4", etikett: "4 fönster i rad" },
];

/**
 * Standardstorlekar för takfönster (yttre karm, mm).
 * Mått enligt branschens vanliga sortiment — inget tillverkarnamn i gränssnittet.
 */
export const takfonsterStandardStorlekar: TakfonsterStorlek[] = [
  { id: "472x550", etikett: "472 × 550 mm", breddMm: 472, hojdMm: 550 },
  { id: "550x780", etikett: "550 × 780 mm", breddMm: 550, hojdMm: 780 },
  { id: "550x980", etikett: "550 × 980 mm", breddMm: 550, hojdMm: 980 },
  { id: "660x980", etikett: "660 × 980 mm", breddMm: 660, hojdMm: 980 },
  { id: "780x980", etikett: "780 × 980 mm", breddMm: 780, hojdMm: 980 },
  { id: "942x980", etikett: "942 × 980 mm", breddMm: 942, hojdMm: 980 },
  { id: "1140x980", etikett: "1 140 × 980 mm", breddMm: 1140, hojdMm: 980 },
  { id: "1340x980", etikett: "1 340 × 980 mm", breddMm: 1340, hojdMm: 980 },
  { id: "550x1178", etikett: "550 × 1 178 mm", breddMm: 550, hojdMm: 1178 },
  { id: "660x1178", etikett: "660 × 1 178 mm", breddMm: 660, hojdMm: 1178 },
  { id: "780x1178", etikett: "780 × 1 178 mm", breddMm: 780, hojdMm: 1178 },
  { id: "942x1178", etikett: "942 × 1 178 mm", breddMm: 942, hojdMm: 1178 },
  { id: "1140x1178", etikett: "1 140 × 1 178 mm", breddMm: 1140, hojdMm: 1178 },
  { id: "1340x1178", etikett: "1 340 × 1 178 mm", breddMm: 1340, hojdMm: 1178 },
  { id: "780x1400", etikett: "780 × 1 400 mm", breddMm: 780, hojdMm: 1400 },
  { id: "942x1400", etikett: "942 × 1 400 mm", breddMm: 942, hojdMm: 1400 },
  { id: "1140x1400", etikett: "1 140 × 1 400 mm", breddMm: 1140, hojdMm: 1400 },
  { id: "780x1600", etikett: "780 × 1 600 mm", breddMm: 780, hojdMm: 1600 },
  { id: "942x1600", etikett: "942 × 1 600 mm", breddMm: 942, hojdMm: 1600 },
  { id: "1140x1600", etikett: "1 140 × 1 600 mm", breddMm: 1140, hojdMm: 1600 },
  { id: "1340x1600", etikett: "1 340 × 1 600 mm", breddMm: 1340, hojdMm: 1600 },
  { id: "1340x1800", etikett: "1 340 × 1 800 mm", breddMm: 1340, hojdMm: 1800 },
];

export type TakfonsterRegister = Record<string, TakfonsterData>;

/** @deprecated Använd TakfonsterSingelPost */
export type TakfonsterPost = TakfonsterSingelPost;

export function skapaTakfonsterPostId(): string {
  return `takfonster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomTakfonsterData(): TakfonsterData {
  return { singel: [], kombinationer: [] };
}

export function hamtaTakfonsterStorlek(
  storlekId: string,
): TakfonsterStorlek | undefined {
  return takfonsterStandardStorlekar.find((s) => s.id === storlekId);
}

export function ärKändTakfonsterStorlek(storlekId: string): boolean {
  return hamtaTakfonsterStorlek(storlekId) !== undefined;
}

export function takfonsterStorlekSelectVarde(storlekId: string): string {
  if (!storlekId.trim()) return "";
  if (ärKändTakfonsterStorlek(storlekId)) return storlekId;
  return TAKFONSTER_STORLEK_ANNAT;
}

export function skapaTomTakfonsterSingelPost(namn = ""): TakfonsterSingelPost {
  const standard = takfonsterStandardStorlekar[4];
  return {
    id: skapaTakfonsterPostId(),
    namn,
    storlekId: standard.id,
    breddMm: String(standard.breddMm),
    hojdMm: String(standard.hojdMm),
    antal: "",
    enhetsprisKr: "",
  };
}

/** @deprecated */
export const skapaTomTakfonsterPost = skapaTomTakfonsterSingelPost;

export function skapaTomTakfonsterKombinationPost(
  namn = "",
): TakfonsterKombinationPost {
  const standard = takfonsterStandardStorlekar[4];
  return {
    id: skapaTakfonsterPostId(),
    namn,
    fonsterIRad: "2",
    modulStorlekId: standard.id,
    breddMm: String(standard.breddMm * 2),
    hojdMm: String(standard.hojdMm),
    antal: "",
    enhetsprisKr: "",
  };
}

/** Bakåtkompatibilitet — tidigare sparades endast singel som array. */
export function normaliseraTakfonsterData(
  raw: TakfonsterData | TakfonsterSingelPost[] | undefined,
): TakfonsterData {
  if (!raw) return skapaTomTakfonsterData();
  if (Array.isArray(raw)) {
    return {
      singel: raw.map(normaliseraTakfonsterSingelPost),
      kombinationer: [],
    };
  }
  return {
    singel: (raw.singel ?? []).map(normaliseraTakfonsterSingelPost),
    kombinationer: (raw.kombinationer ?? []).map(
      normaliseraTakfonsterKombinationPost,
    ),
  };
}

export function normaliseraTakfonsterSingelPost(
  post: TakfonsterSingelPost,
): TakfonsterSingelPost {
  const känd = hamtaTakfonsterStorlek(post.storlekId);
  if (känd) {
    return {
      ...post,
      breddMm: String(känd.breddMm),
      hojdMm: String(känd.hojdMm),
    };
  }
  return {
    ...post,
    storlekId: TAKFONSTER_STORLEK_ANNAT,
    breddMm: post.breddMm.trim(),
    hojdMm: post.hojdMm.trim(),
  };
}

/** @deprecated */
export const normaliseraTakfonsterPost = normaliseraTakfonsterSingelPost;

function parseFonsterIRad(v: string): number {
  const n = Math.round(Number(v));
  if (n >= 2 && n <= 4) return n;
  return 2;
}

export function kombinationTotalBreddMm(
  modul: TakfonsterStorlek,
  fonsterIRad: number,
): number {
  return modul.breddMm * fonsterIRad;
}

export function normaliseraTakfonsterKombinationPost(
  post: TakfonsterKombinationPost,
): TakfonsterKombinationPost {
  const fonsterIRad = parseFonsterIRad(post.fonsterIRad);
  const känd = hamtaTakfonsterStorlek(post.modulStorlekId);

  if (känd) {
    const totalBredd = kombinationTotalBreddMm(känd, fonsterIRad);
    return {
      ...post,
      fonsterIRad: String(fonsterIRad),
      breddMm: String(totalBredd),
      hojdMm: String(känd.hojdMm),
    };
  }

  return {
    ...post,
    fonsterIRad: String(fonsterIRad),
    modulStorlekId: TAKFONSTER_STORLEK_ANNAT,
    breddMm: post.breddMm.trim(),
    hojdMm: post.hojdMm.trim(),
  };
}

export function takfonsterSingelStorlekEtikett(
  post: TakfonsterSingelPost,
): string {
  const p = normaliseraTakfonsterSingelPost(post);
  const känd = hamtaTakfonsterStorlek(p.storlekId);
  if (känd) return känd.etikett;
  const b = p.breddMm.trim();
  const h = p.hojdMm.trim();
  if (b && h) return `${b} × ${h} mm`;
  return "mått ej angivet";
}

export function takfonsterKombinationStorlekEtikett(
  post: TakfonsterKombinationPost,
): string {
  const p = normaliseraTakfonsterKombinationPost(post);
  const n = parseFonsterIRad(p.fonsterIRad);
  const modul = hamtaTakfonsterStorlek(p.modulStorlekId);
  const modulText = modul
    ? modul.etikett
    : p.breddMm.trim() && p.hojdMm.trim()
      ? `${Math.round(Number(p.breddMm) / n)} × ${p.hojdMm} mm`
      : "modul ej angivet";
  const totalB = p.breddMm.trim();
  const totalH = p.hojdMm.trim();
  const total =
    totalB && totalH
      ? `total ${totalB} × ${totalH} mm`
      : "totalyta ej angiven";
  return `${n} × ${modulText} (${total})`;
}

function parsePris(v: string): number {
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseAntal(v: string): number {
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function beraknaTakfonsterSingelSumma(
  post: TakfonsterSingelPost,
): number {
  const p = normaliseraTakfonsterSingelPost(post);
  return Math.round(parseAntal(p.antal) * parsePris(p.enhetsprisKr));
}

export function beraknaTakfonsterKombinationSumma(
  post: TakfonsterKombinationPost,
): number {
  const p = normaliseraTakfonsterKombinationPost(post);
  return Math.round(parseAntal(p.antal) * parsePris(p.enhetsprisKr));
}

export type TakfonsterPrisResultat = {
  totaltKr: number;
  antalSingelFonster: number;
  antalKombinationsenheter: number;
  antalFonsterIKombinationer: number;
};

export function beraknaTakfonsterPris(
  data: TakfonsterData | TakfonsterSingelPost[],
): TakfonsterPrisResultat {
  const d = normaliseraTakfonsterData(data);

  let totaltKr = 0;
  let antalSingelFonster = 0;
  let antalKombinationsenheter = 0;
  let antalFonsterIKombinationer = 0;

  for (const post of d.singel) {
    const p = normaliseraTakfonsterSingelPost(post);
    const antal = parseAntal(p.antal);
    totaltKr += Math.round(antal * parsePris(p.enhetsprisKr));
    antalSingelFonster += antal;
  }

  for (const post of d.kombinationer) {
    const p = normaliseraTakfonsterKombinationPost(post);
    const antal = parseAntal(p.antal);
    const iRad = parseFonsterIRad(p.fonsterIRad);
    totaltKr += Math.round(antal * parsePris(p.enhetsprisKr));
    antalKombinationsenheter += antal;
    antalFonsterIKombinationer += antal * iRad;
  }

  return {
    totaltKr,
    antalSingelFonster,
    antalKombinationsenheter,
    antalFonsterIKombinationer,
  };
}

export function formateraTakfonsterPris(totaltKr: number): string {
  if (totaltKr <= 0) return "";
  return formatKr(totaltKr);
}

export function formateraTakfonsterData(data: TakfonsterData): string {
  const d = normaliseraTakfonsterData(data);
  const delar: string[] = [];

  const singelAktiva = d.singel.filter(
    (p) => p.antal.trim() || p.storlekId.trim() || p.breddMm.trim(),
  );
  if (singelAktiva.length > 0) {
    const rader = singelAktiva
      .map((p) => {
        const antal = p.antal.trim() || "?";
        return `${antal} st ${takfonsterSingelStorlekEtikett(p)}`;
      })
      .slice(0, 3);
    const fler =
      singelAktiva.length > 3 ? ` (+${singelAktiva.length - 3} rader)` : "";
    delar.push(`singel: ${rader.join(", ")}${fler}`);
  }

  const kombAktiva = d.kombinationer.filter(
    (p) => p.antal.trim() || p.modulStorlekId.trim() || p.fonsterIRad.trim(),
  );
  if (kombAktiva.length > 0) {
    const rader = kombAktiva
      .map((p) => {
        const antal = p.antal.trim() || "?";
        return `${antal} komb. ${takfonsterKombinationStorlekEtikett(p)}`;
      })
      .slice(0, 2);
    const fler =
      kombAktiva.length > 2 ? ` (+${kombAktiva.length - 2} rader)` : "";
    delar.push(`kombinationer: ${rader.join(", ")}${fler}`);
  }

  const { totaltKr } = beraknaTakfonsterPris(d);
  const pris = formateraTakfonsterPris(totaltKr);
  if (pris) delar.push(pris);

  return delar.join(" · ");
}

/** @deprecated */
export const formateraTakfonsterPoster = formateraTakfonsterData;

export function summeraTakfonsterData(
  data: TakfonsterData,
): ListaSummeringRad[] {
  const d = normaliseraTakfonsterData(data);
  const rader: ListaSummeringRad[] = [];

  const {
    totaltKr,
    antalSingelFonster,
    antalKombinationsenheter,
    antalFonsterIKombinationer,
  } = beraknaTakfonsterPris(d);

  if (d.singel.some((p) => p.antal.trim() || p.storlekId.trim())) {
    rader.push({
      etikett: "Singel — antal rader",
      varde: `${d.singel.filter((p) => p.antal.trim() || p.storlekId).length} st`,
    });
    if (antalSingelFonster > 0) {
      rader.push({
        etikett: "Singelfönster totalt",
        varde: `${formatSummeringTal(antalSingelFonster)} st`,
      });
    }
  }

  if (d.kombinationer.some((p) => p.antal.trim() || p.modulStorlekId.trim())) {
    rader.push({
      etikett: "Kombinationer — antal rader",
      varde: `${d.kombinationer.filter((p) => p.antal.trim() || p.modulStorlekId).length} st`,
    });
    if (antalKombinationsenheter > 0) {
      rader.push({
        etikett: "Kombinationsenheter totalt",
        varde: `${formatSummeringTal(antalKombinationsenheter)} st`,
      });
    }
    if (antalFonsterIKombinationer > 0) {
      rader.push({
        etikett: "Fönster i kombinationer",
        varde: `${formatSummeringTal(antalFonsterIKombinationer)} st`,
      });
    }
  }

  if (totaltKr > 0) {
    rader.push({
      etikett: "Prissatt totalt",
      varde: formatKr(totaltKr),
    });
  }

  return rader;
}

export function formateraTakfonsterSummering(data: TakfonsterData): string {
  return formateraSummeringRader(summeraTakfonsterData(data));
}
