import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { arTakKomponent } from "@/components/underhallsplan/tak-enheter";

/** Komponenter med tydlig huvudyta (klumpsumma-vy). */
export function harHuvudYtaUnderkomponent(komponentNamn: string): boolean {
  return komponentNamn === "Fasad" || arTakKomponent(komponentNamn);
}

export function hamtaHuvudYtaUnderkomponentId(
  komponentNamn: string,
): string | null {
  if (komponentNamn === "Fasad") return "fasadmaterial";
  if (arTakKomponent(komponentNamn)) return "takyta";
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
