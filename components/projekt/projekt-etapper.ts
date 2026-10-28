export type ProjektEtapp = {
  id: string;
  namn: string;
};

export function skapaEtappId(): string {
  return `etapp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function normaliseraProjektEtapper(raw: unknown): ProjektEtapp[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e && typeof e === "object")
    .map((e) => {
      const x = e as Partial<ProjektEtapp>;
      const namn = (x.namn ?? "").trim();
      if (!namn) return null;
      return {
        id: x.id?.trim() || skapaEtappId(),
        namn,
      };
    })
    .filter((e): e is ProjektEtapp => e !== null);
}

/** En etapp per rad — anges när projektet skapas. */
export function etapperFranText(text: string): ProjektEtapp[] {
  return text
    .split(/\n/)
    .map((rad) => rad.trim())
    .filter(Boolean)
    .map((namn) => ({ id: skapaEtappId(), namn }));
}

export function etapperTillText(etapper: ProjektEtapp[]): string {
  return etapper.map((e) => e.namn).join("\n");
}

/** Förhandsval i egenkontroll när projektet saknar egna etapper. */
export const EGENKONTROLL_ETAPP_FORHANDSVAL: ProjektEtapp[] = [
  { id: "forhands-etapp-1", namn: "Etapp 1" },
  { id: "forhands-etapp-2", namn: "Etapp 2" },
  { id: "forhands-etapp-3", namn: "Etapp 3" },
  { id: "forhands-etapp-4", namn: "Etapp 4" },
  { id: "forhands-etapp-hela", namn: "Hela projektet" },
];

export function etappAlternativForEgenkontroll(
  projektEtapper: ProjektEtapp[],
): ProjektEtapp[] {
  return projektEtapper.length > 0
    ? projektEtapper
    : EGENKONTROLL_ETAPP_FORHANDSVAL;
}

export function matchaEtappILista(
  etappId: string,
  etappNamn: string,
  alternativ: ProjektEtapp[],
): string {
  if (etappId && alternativ.some((e) => e.id === etappId)) return etappId;
  const namn = etappNamn.trim();
  if (!namn) return "";
  return alternativ.find((e) => e.namn === namn)?.id ?? "";
}
