import {
  hamtaYtskiktAlternativ,
  standardYtskikt,
  ytskiktEtikett,
  type YtskiktGruppId,
} from "@/components/underhallsplan/komponentregister";
import {
  formatSummeringTal,
  formateraSummeringRader,
  parseNummerSumma,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type TvattstugaUtformningId = "gemensam" | "torkrum" | "i-lagenhet";

export type TvattstugaPriser = {
  tvattmaskin: string;
  torktumlare: string;
  torkskap: string;
  mangel: string;
  belysning: string;
  golv: string;
  vaggar: string;
};

export type TvattstugaPost = {
  id: string;
  /** T.ex. Tvättstuga källare, Hus B */
  namn: string;
  utformning: TvattstugaUtformningId;
  tvattmaskin: string;
  torktumlare: string;
  torkskap: string;
  mangel: string;
  belysning: string;
  golvYtskikt: string;
  golvKvm: string;
  vaggarYtskikt: string;
  vaggarKvm: string;
  priser?: TvattstugaPriser;
};

export const tvattstugaUtformningar: {
  id: TvattstugaUtformningId;
  etikett: string;
}[] = [
  { id: "gemensam", etikett: "Gemensam tvättstuga" },
  { id: "torkrum", etikett: "Separat torkrum" },
  { id: "i-lagenhet", etikett: "Tvätt i lägenhet (ingen gemensam)" },
];

/** Underkomponent-id under Källare */
export const TVATTSTUGA_UNDERKOMPONENT_ID = "tvattstuga";

export function skapaTvattstugaPostId(): string {
  return `tvatt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Kopierar allt innehåll utom id; nytt namn om inget anges. */
export function kopieraTvattstugaPost(
  kalla: TvattstugaPost,
  namn?: string,
): TvattstugaPost {
  const basnamn = kalla.namn.trim();
  return {
    ...kalla,
    id: skapaTvattstugaPostId(),
    namn: namn ?? (basnamn ? `${basnamn} (kopia)` : ""),
  };
}

export function skapaTomTvattstugaPost(namn = ""): TvattstugaPost {
  return {
    id: skapaTvattstugaPostId(),
    namn,
    utformning: "gemensam",
    tvattmaskin: "",
    torktumlare: "",
    torkskap: "",
    mangel: "",
    belysning: "",
    golvYtskikt: standardYtskikt("tvattstuga-golv"),
    golvKvm: "",
    vaggarYtskikt: standardYtskikt("tvattstuga-vagg"),
    vaggarKvm: "",
  };
}

function utformningEtikett(id: TvattstugaUtformningId): string {
  return tvattstugaUtformningar.find((u) => u.id === id)?.etikett ?? id;
}

function ytaText(ytskikt: string, kvm: string, grupp: YtskiktGruppId): string {
  const etikett = ytskiktEtikett(grupp, ytskikt);
  return kvm.trim() ? `${etikett} ${kvm.trim()} m²` : etikett;
}

export function formateraTvattstugaPost(post: TvattstugaPost): string {
  const rubrik = post.namn.trim() || "Tvättstuga";
  const maskiner: string[] = [];
  if (post.tvattmaskin.trim())
    maskiner.push(`${post.tvattmaskin.trim()} tvättmaskiner`);
  if (post.torktumlare.trim())
    maskiner.push(`${post.torktumlare.trim()} torktumlare`);
  if (post.torkskap.trim()) maskiner.push(`${post.torkskap.trim()} torkskåp`);
  if (post.mangel.trim()) maskiner.push(`${post.mangel.trim()} mangel`);
  if (post.belysning.trim())
    maskiner.push(`${post.belysning.trim()} armaturer`);

  const delar = [
    utformningEtikett(post.utformning),
    ...maskiner,
    ytaText(post.golvYtskikt, post.golvKvm, "tvattstuga-golv"),
    ytaText(post.vaggarYtskikt, post.vaggarKvm, "tvattstuga-vagg"),
  ];
  return `${rubrik}: ${delar.join(", ")}`;
}

export function summeraTvattstugaPoster(
  poster: TvattstugaPost[],
): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal tvättstugor", varde: `${poster.length} st` },
  ];

  const falt: { etikett: string; hamta: (p: TvattstugaPost) => string }[] = [
    { etikett: "Tvättmaskiner", hamta: (p) => p.tvattmaskin },
    { etikett: "Torktumlare", hamta: (p) => p.torktumlare },
    { etikett: "Torkskåp", hamta: (p) => p.torkskap },
    { etikett: "Mangel", hamta: (p) => p.mangel },
    { etikett: "Belysning (armaturer)", hamta: (p) => p.belysning },
  ];

  for (const { etikett, hamta } of falt) {
    const summa = parseNummerSumma(poster.map(hamta));
    if (summa > 0) {
      rader.push({ etikett, varde: `${formatSummeringTal(summa, 0)} st` });
    }
  }

  const golvKvm = parseNummerSumma(poster.map((p) => p.golvKvm));
  if (golvKvm > 0) {
    rader.push({
      etikett: "Golv totalt",
      varde: `${formatSummeringTal(golvKvm)} m²`,
    });
  }

  const vaggarKvm = parseNummerSumma(poster.map((p) => p.vaggarKvm));
  if (vaggarKvm > 0) {
    rader.push({
      etikett: "Väggar totalt",
      varde: `${formatSummeringTal(vaggarKvm)} m²`,
    });
  }

  return rader;
}

export function formateraTvattstugaSummering(poster: TvattstugaPost[]): string {
  return formateraSummeringRader(summeraTvattstugaPoster(poster));
}

export function formateraTvattstugaPoster(poster: TvattstugaPost[]): string {
  return formateraTvattstugaSummering(poster);
}

export function hamtaTvattstugaGolvAlternativ() {
  return hamtaYtskiktAlternativ("tvattstuga-golv");
}

export function hamtaTvattstugaVaggAlternativ() {
  return hamtaYtskiktAlternativ("tvattstuga-vagg");
}
