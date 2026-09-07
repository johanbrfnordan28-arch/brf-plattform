import { domMappar } from "@/components/juridik/domar";
import { safeSetLocalStorage } from "@/lib/localStorage";

/** @deprecated Skrivning sker inte längre från förenings-UI — gemensamt bibliotek fylls centralt (juridik-centralt-bibliotek.ts). Typer behålls för kompatibilitet. */
const JURIDIK_BIBLIOTEK_KEY = "brf-juridik-bibliotek";

export const JURIDIK_BIBLIOTEK_EVENT = "juridik-bibliotek-uppdaterad";

export type JuridikUppladdatDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

export type JuridikTipsRad = {
  id: string;
  titel: string;
  text: string;
  kategori: JuridikTipsKategori;
  uppladdad: string;
  filnamn?: string;
};

export type JuridikTipsKategori =
  | "mote-medlem"
  | "juridiskt-ombud"
  | "kostnadstvist"
  | "allmant";

export type JuridikMappState = {
  dokument: JuridikUppladdatDokument[];
};

export type JuridikBibliotekState = {
  mappar: Record<string, JuridikMappState>;
  tips: JuridikTipsRad[];
};

export function skapaTomtJuridikBibliotek(): JuridikBibliotekState {
  return {
    mappar: Object.fromEntries(
      domMappar.map((mapp) => [mapp.id, { dokument: [] }]),
    ),
    tips: [],
  };
}

function normaliseraState(raw: unknown): JuridikBibliotekState {
  const tom = skapaTomtJuridikBibliotek();
  if (!raw || typeof raw !== "object") return tom;
  const data = raw as Partial<JuridikBibliotekState>;

  const mappar = { ...tom.mappar };
  if (data.mappar && typeof data.mappar === "object") {
    for (const mapp of domMappar) {
      const sparad = data.mappar[mapp.id];
      if (sparad && Array.isArray(sparad.dokument)) {
        mappar[mapp.id] = { dokument: sparad.dokument };
      }
    }
  }

  const tips = Array.isArray(data.tips)
    ? data.tips.filter(
        (t): t is JuridikTipsRad =>
          Boolean(t) &&
          typeof t === "object" &&
          typeof (t as JuridikTipsRad).id === "string" &&
          typeof (t as JuridikTipsRad).titel === "string" &&
          typeof (t as JuridikTipsRad).text === "string",
      )
    : [];

  return { mappar, tips };
}

export function lasJuridikBibliotek(): JuridikBibliotekState {
  if (typeof window === "undefined") return skapaTomtJuridikBibliotek();
  try {
    const raw = localStorage.getItem(JURIDIK_BIBLIOTEK_KEY);
    if (!raw) return skapaTomtJuridikBibliotek();
    return normaliseraState(JSON.parse(raw));
  } catch {
    return skapaTomtJuridikBibliotek();
  }
}

export function sparaJuridikBibliotek(state: JuridikBibliotekState): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(JURIDIK_BIBLIOTEK_KEY, JSON.stringify(state)).ok;
  if (ok) {
    window.dispatchEvent(new Event(JURIDIK_BIBLIOTEK_EVENT));
  }
  return ok;
}

export function skapaJuridikId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function tipsKategoriEtikett(kategori: JuridikTipsKategori): string {
  switch (kategori) {
    case "mote-medlem":
      return "Inför möte med medlem";
    case "juridiskt-ombud":
      return "Inför juridiskt ombud";
    case "kostnadstvist":
      return "Minska kostnader vid tvist";
    default:
      return "Allmänt råd";
  }
}
