import {
  formateraSummeringRader,
  type ListaSummeringRad,
} from "@/components/underhallsplan/lista-summering";
import {
  effektivEnhetspris,
  parsePrisKr,
} from "@/components/underhallsplan/riktpriser";
import { hamtaRiktprisVentilationExtraTyp } from "@/components/underhallsplan/underhall-atgard-riktpris";

export type VentilationExtraTypId =
  | "vindflakt"
  | "rokgasflakt"
  | "takflakt"
  | "trapphusflakt"
  | "garageflakt"
  | "kallarflakt"
  | "annat";

export type VentilationExtraPost = {
  id: string;
  typ: VentilationExtraTypId;
  typAnnanText: string;
  /** T.ex. «Vind hus A», «Öppen spis trapphus 2» */
  plats: string;
  antal: string;
  /** Tomt = riktpris per typ */
  enhetsprisKr: string;
};

export const VENTILATION_EXTRA_UNDERKOMPONENT_ID = "extra-flaktar";

export const ventilationExtraTyper: {
  id: VentilationExtraTypId;
  etikett: string;
  beskrivning: string;
}[] = [
  {
    id: "vindflakt",
    etikett: "Vindfläkt",
    beskrivning: "Fläkt i vind eller kattvind — separat från huvudsystemet.",
  },
  {
    id: "rokgasflakt",
    etikett: "Rökgasfläkt",
    beskrivning: "Fläkt kopplad till öppen spis eller eldstad.",
  },
  {
    id: "takflakt",
    etikett: "Takfläkt",
    beskrivning: "Avluftning direkt via tak.",
  },
  {
    id: "trapphusflakt",
    etikett: "Trapphusfläkt",
    beskrivning: "Separat fläkt i trapphus utöver centralt ventilationssystem.",
  },
  {
    id: "garageflakt",
    etikett: "Garagefläkt",
    beskrivning: "Ventilation i garage eller carport.",
  },
  {
    id: "kallarflakt",
    etikett: "Källarfläkt",
    beskrivning: "Fläkt i källare, soprum eller teknikutrymme.",
  },
  {
    id: "annat",
    etikett: "Annan fläkt…",
    beskrivning: "Övrig tillufts- eller frånluftsfläkt.",
  },
];

export function skapaVentilationExtraPostId(): string {
  return `vent-extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomVentilationExtraPost(
  typ: VentilationExtraTypId = "vindflakt",
): VentilationExtraPost {
  return {
    id: skapaVentilationExtraPostId(),
    typ,
    typAnnanText: "",
    plats: "",
    antal: "1",
    enhetsprisKr: "",
  };
}

export function ventilationExtraTypEtikett(
  typ: VentilationExtraTypId,
  typAnnanText: string,
): string {
  if (typ === "annat") {
    const text = typAnnanText.trim();
    return text || "Annan fläkt";
  }
  return ventilationExtraTyper.find((t) => t.id === typ)?.etikett ?? typ;
}

function parseAntal(antal: string): number {
  const n = Math.floor(Number(antal.replace(/\s/g, "").replace(",", ".")) || 0);
  return n > 0 ? n : 0;
}

export function normaliseraVentilationExtraPost(
  post: VentilationExtraPost,
): VentilationExtraPost {
  const antal = parseAntal(post.antal);
  return {
    ...post,
    antal: antal > 0 ? String(antal) : "1",
    plats: post.plats.trim(),
    typAnnanText: post.typ === "annat" ? post.typAnnanText.trim() : "",
    enhetsprisKr: post.enhetsprisKr.trim(),
  };
}

export function beraknaVentilationExtraPostKr(post: VentilationExtraPost): number {
  const antal = parseAntal(post.antal);
  if (antal <= 0) return 0;
  const enhetspris = effektivEnhetspris(
    post.enhetsprisKr,
    hamtaRiktprisVentilationExtraTyp(post.typ),
  );
  return Math.round(antal * enhetspris);
}

export function summeraVentilationExtraTotaltKr(
  poster: VentilationExtraPost[],
): number {
  return poster.reduce((sum, p) => sum + beraknaVentilationExtraPostKr(p), 0);
}

export function formateraVentilationExtraPost(post: VentilationExtraPost): string {
  const typ = ventilationExtraTypEtikett(post.typ, post.typAnnanText);
  const antal = parseAntal(post.antal);
  const plats = post.plats.trim();
  const antalText = antal > 1 ? `${antal} st` : "1 st";
  if (plats) return `${typ} (${plats}): ${antalText}`;
  return `${typ}: ${antalText}`;
}

export function summeraVentilationExtraPoster(
  poster: VentilationExtraPost[],
): ListaSummeringRad[] {
  if (poster.length === 0) return [];

  const totaltAntal = poster.reduce((sum, p) => sum + parseAntal(p.antal), 0);
  const rader: ListaSummeringRad[] = [
    { etikett: "Antal fläktposter", varde: `${poster.length} st` },
    { etikett: "Totalt antal fläktar", varde: `${totaltAntal} st` },
  ];
  const totaltKr = summeraVentilationExtraTotaltKr(poster);
  if (totaltKr > 0) {
    rader.push({
      etikett: "Uppskattad kostnad",
      varde: `${totaltKr.toLocaleString("sv-SE")} kr`,
    });
  }

  for (const typDef of ventilationExtraTyper) {
    const matchande = poster.filter((p) => p.typ === typDef.id);
    if (matchande.length === 0) continue;
    const antal = matchande.reduce((sum, p) => sum + parseAntal(p.antal), 0);
    rader.push({
      etikett: typDef.etikett,
      varde: `${antal} st (${matchande.length} post${matchande.length === 1 ? "" : "er"})`,
    });
  }

  return rader;
}

export function formateraVentilationExtraPoster(poster: VentilationExtraPost[]): string {
  if (poster.length === 0) return "";
  const detaljer = poster.map(formateraVentilationExtraPost).join("; ");
  const summering = formateraSummeringRader(summeraVentilationExtraPoster(poster));
  return summering ? `${detaljer} · ${summering}` : detaljer;
}
