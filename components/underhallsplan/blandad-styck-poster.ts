import { parseKrText, parseMangd } from "@/components/underhallsplan/underhall-kostnad";

export type BlandadStyckPost = {
  id: string;
  etikett: string;
  antal: string;
  enhetsprisKr: string;
};

export function skapaStyckPostId(): string {
  return `styck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaTomStyckPost(etikett = ""): BlandadStyckPost {
  return {
    id: skapaStyckPostId(),
    etikett,
    antal: "",
    enhetsprisKr: "",
  };
}

export function normaliseraStyckPoster(
  raw?: BlandadStyckPost[] | null,
  legacy?: { antal?: string; enhetsprisKr?: string; etikett?: string },
): BlandadStyckPost[] {
  const lista = Array.isArray(raw) ? raw : [];
  const poster = lista.map((p, i) => ({
    id: p.id?.trim() || `styck-${i + 1}`,
    etikett: p.etikett?.trim() ?? "",
    antal: p.antal?.trim() ?? "",
    enhetsprisKr: p.enhetsprisKr?.trim() ?? "",
  }));

  const harData = poster.some(
    (p) => parseMangd(p.antal) > 0 || parseKrText(p.enhetsprisKr) > 0,
  );
  if (!harData && legacy) {
    const antal = legacy.antal?.trim() ?? "";
    const pris = legacy.enhetsprisKr?.trim() ?? "";
    if (antal || pris) {
      return [
        {
          id: "styck-legacy",
          etikett: legacy.etikett?.trim() || "Styck",
          antal,
          enhetsprisKr: pris,
        },
      ];
    }
  }

  if (poster.length === 0) {
    return [skapaTomStyckPost()];
  }

  return poster;
}

export function summeraStyckPosterKr(poster: BlandadStyckPost[]): number {
  return poster.reduce((sum, p) => {
    const antal = parseMangd(p.antal);
    const pris = parseKrText(p.enhetsprisKr);
    if (antal <= 0 || pris <= 0) return sum;
    return sum + Math.round(antal * pris);
  }, 0);
}

export function summeraStyckPosterAntal(poster: BlandadStyckPost[]): number {
  return poster.reduce((sum, p) => sum + parseMangd(p.antal), 0);
}

/** Fördela styck-budget jämnt per styck över alla rader med antal. */
export function fordelaStyckBudgetPaPoster(
  poster: BlandadStyckPost[],
  budgetKr: number,
): BlandadStyckPost[] {
  const totalAntal = summeraStyckPosterAntal(poster);
  if (totalAntal <= 0 || budgetKr <= 0) return poster;
  const krPerSt = Math.round(budgetKr / totalAntal);
  return poster.map((p) =>
    parseMangd(p.antal) > 0
      ? { ...p, enhetsprisKr: String(krPerSt) }
      : p,
  );
}
