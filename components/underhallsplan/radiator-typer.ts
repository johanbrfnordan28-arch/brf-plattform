/**
 * Radiatortyper i fastigheten — registreras i grunduppgifter.
 *
 * Enligt Purmo / Thermopanel / Radson anges panelradiatorer som:
 * - Typ 11 / 21 / 22 / 33 (antal paneler + konvektorer → djup/«tjocklek»)
 * - Höjd (mm)
 * - Längd (mm)
 * Djup väljs inte separat — det följer av typen.
 */

export type RadiatorPanelTypId =
  | "11"
  | "21"
  | "22"
  | "33"
  | "sektion"
  | "annat";

export type RadiatorTypPost = {
  id: string;
  /** Paneltyp — styr djup. */
  panelTyp: RadiatorPanelTypId;
  panelTypAnnan: string;
  /** Höjd i mm, t.ex. 600. */
  hojdMm: string;
  /** Längd i mm, t.ex. 1000. */
  langdMm: string;
  /** Valfritt fabrikat, t.ex. Purmo Compact. */
  fabrikat: string;
  /** Valfritt eget namn, t.ex. «Vardagsrum standard». */
  namn: string;
};

export const radiatorPanelTyper: {
  id: RadiatorPanelTypId;
  etikett: string;
  beskrivning: string;
  ungefardjupMm: string;
}[] = [
  {
    id: "11",
    etikett: "Typ 11",
    beskrivning: "En panel med konvektor — smalast.",
    ungefardjupMm: "ca 60 mm",
  },
  {
    id: "21",
    etikett: "Typ 21",
    beskrivning: "Två paneler, en konvektor.",
    ungefardjupMm: "ca 70–80 mm",
  },
  {
    id: "22",
    etikett: "Typ 22",
    beskrivning: "Två paneler med konvektorer — vanligast i flerbostadshus.",
    ungefardjupMm: "ca 100 mm",
  },
  {
    id: "33",
    etikett: "Typ 33",
    beskrivning: "Tre paneler med konvektorer — djupast / högst effekt.",
    ungefardjupMm: "ca 150 mm",
  },
  {
    id: "sektion",
    etikett: "Sektionsradiator",
    beskrivning: "Äldre sektions-/gjutjärnsradiator — ange höjd och längd.",
    ungefardjupMm: "varierar",
  },
  {
    id: "annat",
    etikett: "Annan typ…",
    beskrivning: "Ange egen typbeteckning.",
    ungefardjupMm: "",
  },
];

/** Vanliga höjder hos Purmo / Thermopanel / Radson (mm). */
export const radiatorHojdAlternativMm = [
  "300",
  "400",
  "450",
  "500",
  "550",
  "600",
  "750",
  "900",
] as const;

/** Vanliga längder (mm). */
export const radiatorLangdAlternativMm = [
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
  "1100",
  "1200",
  "1400",
  "1600",
  "1800",
  "2000",
] as const;

export function skapaRadiatorTypId(): string {
  return `radiator-typ-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomRadiatorTypPost(): RadiatorTypPost {
  return {
    id: skapaRadiatorTypId(),
    panelTyp: "22",
    panelTypAnnan: "",
    hojdMm: "600",
    langdMm: "1000",
    fabrikat: "",
    namn: "",
  };
}

function arPanelTyp(v: unknown): v is RadiatorPanelTypId {
  return radiatorPanelTyper.some((t) => t.id === v);
}

export function normaliseraRadiatorTypPost(
  raw: Partial<RadiatorTypPost> & { id?: string },
  index = 0,
): RadiatorTypPost {
  const panelTyp = arPanelTyp(raw.panelTyp) ? raw.panelTyp : "22";
  return {
    id: raw.id?.trim() || `radiator-typ-${index + 1}`,
    panelTyp,
    panelTypAnnan: panelTyp === "annat" ? raw.panelTypAnnan?.trim() ?? "" : "",
    hojdMm: raw.hojdMm?.trim() ?? "",
    langdMm: raw.langdMm?.trim() ?? "",
    fabrikat: raw.fabrikat?.trim() ?? "",
    namn: raw.namn?.trim() ?? "",
  };
}

export function normaliseraRadiatorTypPoster(raw: unknown): RadiatorTypPost[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => Boolean(p) && typeof p === "object")
    .map((p, i) =>
      normaliseraRadiatorTypPost(p as Partial<RadiatorTypPost>, i),
    );
}

export function radiatorPanelTypEtikett(
  id: RadiatorPanelTypId,
  annan = "",
): string {
  if (id === "annat") return annan.trim() || "Annan typ";
  return radiatorPanelTyper.find((t) => t.id === id)?.etikett ?? id;
}

/** Visningsnamn: «Typ 22 · 600×1000 mm» eller eget namn. */
export function formateraRadiatorTypPost(post: RadiatorTypPost): string {
  const p = normaliseraRadiatorTypPost(post);
  if (p.namn) return p.namn;
  const typ = radiatorPanelTypEtikett(p.panelTyp, p.panelTypAnnan);
  const matt =
    p.hojdMm && p.langdMm
      ? `${p.hojdMm}×${p.langdMm} mm`
      : p.hojdMm
        ? `höjd ${p.hojdMm} mm`
        : p.langdMm
          ? `längd ${p.langdMm} mm`
          : "";
  const fabrikat = p.fabrikat ? `${p.fabrikat} ` : "";
  return matt ? `${fabrikat}${typ} · ${matt}` : `${fabrikat}${typ}`;
}

export function formateraRadiatorTypPoster(poster: RadiatorTypPost[]): string {
  return poster.map(formateraRadiatorTypPost).filter(Boolean).join(" · ");
}

export function hamtaRadiatorTypPost(
  poster: RadiatorTypPost[],
  id: string,
): RadiatorTypPost | undefined {
  return poster.find((p) => p.id === id);
}
