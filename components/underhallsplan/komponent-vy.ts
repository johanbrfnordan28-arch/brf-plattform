import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

/** Komponenter med tydlig huvudyta (klumpsumma-vy). */
export function harHuvudYtaUnderkomponent(komponentNamn: string): boolean {
  return komponentNamn === "Fasad" || komponentNamn === "Tak";
}

export function hamtaHuvudYtaUnderkomponentId(
  komponentNamn: string,
): string | null {
  if (komponentNamn === "Fasad") return "fasadmaterial";
  if (komponentNamn === "Tak") return "takyta";
  return null;
}

export function skaVisaUnderkomponentLista(data: KomponentDetaljData): boolean {
  if (data.visaUnderkomponenterLista === true) return true;
  if (data.enkelKlumpsummaLage === true) return false;
  return true;
}

export function arEnkelKlumpsummaLage(data: KomponentDetaljData): boolean {
  return Boolean(data.enkelKlumpsummaLage);
}
