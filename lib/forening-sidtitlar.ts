import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { hamtaAktivForeningsNamn } from "@/lib/forening-registry";

/** Modulnamn per föreningssökväg — används i flikrubrik efter föreningens namn. */
export const FORENING_MODUL_TITLAR: Record<string, string> = {
  "/forening/uppgifter": "Föreningsuppgifter",
  "/forening/underhallsplan": "Underhåll",
  "/forening/juridik": "Juridik",
  "/forening/foreningsinformation": "Föreningsinformation",
  "/forening/arshjul": "Årshjul",
  "/forening/projekt": "Projekt",
  "/forening/medlemmar": "Medlemmar",
  "/forening/energi": "Energi & drift",
  "/forening/upphandling": "Upphandling",
  "/forening/entreprenorer": "Entreprenörer",
  "/forening/fastighets-skador": "Fastighetsskador",
  "/forening/rondering": "Rondering & avvikelser",
  "/forening/guider": "Tips och råd",
};

export function normaliseraForeningSokvag(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function hamtaForeningModulTitel(pathname: string): string | null {
  return FORENING_MODUL_TITLAR[normaliseraForeningSokvag(pathname)] ?? null;
}

/** Förstasidan = Styrelseflow. Övriga föreningssidor = «Föreningsnamn — Modul». */
export function uppdateraForeningSidtitel(pathname: string): void {
  if (typeof document === "undefined") return;

  const path = normaliseraForeningSokvag(pathname);
  if (path === "/forening") {
    document.title = STYRELSEFLOW_NAMN;
    return;
  }

  const modul = hamtaForeningModulTitel(path);
  if (!modul) return;

  document.title = `${hamtaAktivForeningsNamn()} — ${modul}`;
}
