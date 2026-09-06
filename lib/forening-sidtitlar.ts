import { hamtaHubbNamn } from "@/lib/hubb-namn";
import { hamtaAktivForeningsNamn } from "@/lib/forening-registry";

/** Modulnamn per föreningssökväg — används i flikrubrik efter föreningens namn. */
export const FORENING_MODUL_TITLAR: Record<string, string> = {
  "/forening/uppgifter": "Föreningsuppgifter",
  "/forening/underhallsplan": "Underhåll",
  "/forening/juridik": "Juridik",
  "/forening/foreningsinformation": "Styrning och Dokument",
  "/forening/arshjul": "Årshjul",
  "/forening/projekt": "Projekt",
  "/forening/medlemmar": "Medlemmar",
  "/forening/konto": "Konto",
  "/forening/energi": "Energi & drift",
  "/forening/upphandling": "Upphandling",
  "/forening/entreprenorer": "Entreprenörer",
  "/forening/rondering": "Rondering & avvikelser",
  "/forening/guider": "Guider & tips",
};

export function normaliseraForeningSokvag(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function hamtaForeningModulTitel(pathname: string): string | null {
  return FORENING_MODUL_TITLAR[normaliseraForeningSokvag(pathname)] ?? null;
}

/** Förstasidan = föreningens namn. Övriga = «Föreningsnamn — Modul». */
export function uppdateraForeningSidtitel(pathname: string): void {
  if (typeof document === "undefined") return;

  const path = normaliseraForeningSokvag(pathname);
  if (path === "/forening") {
    document.title = hamtaHubbNamn();
    return;
  }

  const modul = hamtaForeningModulTitel(path);
  if (!modul) return;

  document.title = `${hamtaAktivForeningsNamn()} — ${modul}`;
}
