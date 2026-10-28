import { parseNummerSumma } from "@/components/underhallsplan/lista-summering";
import type { Måttenhet } from "@/components/underhallsplan/komponentregister";

export type UnderkomponentMattParti = {
  id: string;
  /** T.ex. Nock norr, Ränndal väster, Typ 1 */
  namn: string;
  mangd: string;
};

export type UnderkomponentMattPartierRegister = Record<
  string,
  UnderkomponentMattParti[]
>;

export function skapaMattPartiId(): string {
  return `matt-${Date.now().toString(36).slice(2, 8)}`;
}

export function skapaTomMattParti(namn = ""): UnderkomponentMattParti {
  return {
    id: skapaMattPartiId(),
    namn,
    mangd: "",
  };
}

export function normaliseraMattPartier(
  raw: UnderkomponentMattParti[] | undefined,
  legacyVarde?: string,
  legacyEtikett?: string,
): UnderkomponentMattParti[] {
  const lista = Array.isArray(raw)
    ? raw.map((p, i) => ({
        id: p.id?.trim() || `matt-${i + 1}`,
        namn: p.namn?.trim() ?? "",
        mangd: p.mangd?.trim() ?? "",
      }))
    : [];

  if (lista.length === 0 && legacyVarde?.trim()) {
    return [
      {
        id: "matt-legacy",
        namn: legacyEtikett?.trim() ?? "",
        mangd: legacyVarde.trim(),
      },
    ];
  }

  if (lista.length === 0) {
    return [skapaTomMattParti("")];
  }

  return lista;
}

export function summeraMattPartier(
  partier: UnderkomponentMattParti[],
): number {
  return parseNummerSumma(partier.map((p) => p.mangd));
}

export function formateraMattPartier(
  partier: UnderkomponentMattParti[],
  enhet: string,
): string {
  const rader = partier
    .filter((p) => p.mangd.trim() || p.namn.trim())
    .map((p) => {
      const mangd = p.mangd.trim();
      const namn = p.namn.trim();
      if (namn && mangd) return `${namn}: ${mangd} ${enhet}`;
      if (mangd) return `${mangd} ${enhet}`;
      if (namn) return namn;
      return "";
    })
    .filter(Boolean);
  return rader.join(" · ");
}

export function vardeFranMattPartier(
  partier: UnderkomponentMattParti[],
): string {
  const summa = summeraMattPartier(partier);
  if (summa <= 0) return "";
  return String(Math.round(summa * 10) / 10);
}

export function mattPartiPlaceholder(index: number): string {
  return index === 0 ? "t.ex. Nock norr" : `Parti ${index + 1}`;
}
