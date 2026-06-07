import {
  formateraSummeringRader,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";

export type HissTypId = "motvikt" | "hydraul";

export type HissPost = {
  id: string;
  /** T.ex. Hiss 1, Hiss hus B */
  namn: string;
  /** Fördefinierat id, eget märke-id eller "annat" */
  marke: string;
  markeAnnanText: string;
  hissTyp: HissTypId;
  /** Uppskattad kostnad modernisering/byte — tom = riktpris */
  uppskattadModerniseringKr?: string;
};

export type HissMarkeDefinition = {
  id: string;
  etikett: string;
};

export const vanligaHissMarken: HissMarkeDefinition[] = [
  { id: "kone", etikett: "KONE" },
  { id: "otis", etikett: "Otis" },
  { id: "schindler", etikett: "Schindler" },
  { id: "tk-elevator", etikett: "TK Elevator" },
  { id: "fujitec", etikett: "Fujitec" },
  { id: "orona", etikett: "Orona" },
  { id: "aritco", etikett: "Aritco" },
  { id: "annat", etikett: "Annat märke…" },
];

export const hissTyper: { id: HissTypId; etikett: string }[] = [
  { id: "motvikt", etikett: "Motvikts hiss" },
  { id: "hydraul", etikett: "Hydraulhiss" },
];

/** Underkomponent-id under Trapphus */
export const HISS_UNDERKOMPONENT_ID = "hiss";

export function skapaHissPostId(): string {
  return `hiss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaHissMarkeId(): string {
  return `hiss-marke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomHissPost(namn = ""): HissPost {
  return {
    id: skapaHissPostId(),
    namn,
    marke: "kone",
    markeAnnanText: "",
    hissTyp: "motvikt",
    uppskattadModerniseringKr: "",
  };
}

export function allaHissMarken(
  egnaMarken: HissMarkeDefinition[] = [],
): HissMarkeDefinition[] {
  return [...vanligaHissMarken, ...egnaMarken];
}

export function hissMarkeEtikett(
  markeId: string,
  markeAnnanText: string,
  egnaMarken: HissMarkeDefinition[] = [],
): string {
  if (markeId === "annat") {
    const text = markeAnnanText.trim();
    return text || "Annat märke";
  }
  return (
    allaHissMarken(egnaMarken).find((m) => m.id === markeId)?.etikett ?? markeId
  );
}

function hissTypEtikett(id: HissTypId): string {
  return hissTyper.find((t) => t.id === id)?.etikett ?? id;
}

export function formateraHissPost(
  post: HissPost,
  egnaMarken: HissMarkeDefinition[] = [],
): string {
  const rubrik = post.namn.trim() || "Hiss";
  const marke = hissMarkeEtikett(post.marke, post.markeAnnanText, egnaMarken);
  return `${rubrik}: ${marke}, ${hissTypEtikett(post.hissTyp)}`;
}

export function summeraHissPoster(
  poster: HissPost[],
): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const rader: ListaSummeringRad[] = [
    { etikett: "Antal hissar", varde: `${poster.length} st` },
  ];

  for (const typ of hissTyper) {
    const antal = poster.filter((p) => p.hissTyp === typ.id).length;
    if (antal > 0) {
      rader.push({ etikett: typ.etikett, varde: `${antal} st` });
    }
  }

  return rader;
}

export function formateraHissSummering(
  poster: HissPost[],
  _egnaMarken: HissMarkeDefinition[] = [],
): string {
  return formateraSummeringRader(summeraHissPoster(poster));
}

export function formateraHissPoster(
  poster: HissPost[],
  egnaMarken: HissMarkeDefinition[] = [],
): string {
  return formateraHissSummering(poster, egnaMarken);
}
