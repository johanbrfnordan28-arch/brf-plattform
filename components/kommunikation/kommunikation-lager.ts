import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type Medlem = {
  id: string;
  namn: string;
  epost: string;
  lagenhetNr: string;
  adress: string;
  telefon: string;
  aktiv: boolean;
};

export type UtskickTyp = "info" | "kallelse" | "pamalning" | "beslut" | "ovrigt";
export const UTSKICK_TYP_ETIKETTER: Record<UtskickTyp, string> = {
  info: "Information",
  kallelse: "Kallelse",
  pamalning: "Påminnelse",
  beslut: "Styrelsebeslut",
  ovrigt: "Övrigt",
};

export type UtgaendeMejl = {
  id: string;
  datum: string;
  typ: UtskickTyp;
  amne: string;
  meddelande: string;
  /** "alla" eller lista av member-IDs */
  mottagarIds: string[];
  mottagarNamn: string[];
  mottagarEposter: string[];
  skickatAv: string;
};

export type ArendeKategori =
  | "klagan"
  | "fraga"
  | "renovering"
  | "underhall"
  | "ovrigt";

export const ARENDE_KATEGORI_ETIKETTER: Record<ArendeKategori, string> = {
  klagan: "Klagomål",
  fraga: "Fråga",
  renovering: "Renovering",
  underhall: "Underhåll / fel",
  ovrigt: "Övrigt",
};

export type ArendeStatus = "oppet" | "pagaende" | "stangt";
export const ARENDE_STATUS_ETIKETTER: Record<ArendeStatus, string> = {
  oppet: "Öppet",
  pagaende: "Pågående",
  stangt: "Stängt",
};
export const ARENDE_STATUS_FARGER: Record<ArendeStatus, string> = {
  oppet: "bg-amber-50 text-amber-800 border-amber-200",
  pagaende: "bg-blue-50 text-blue-800 border-blue-200",
  stangt: "bg-[#eef6f0] text-primary-dark border-primary/30",
};

export type ArendePrioritet = "lag" | "normal" | "hog";
export const ARENDE_PRIORITET_ETIKETTER: Record<ArendePrioritet, string> = {
  lag: "Låg",
  normal: "Normal",
  hog: "Hög",
};
export const ARENDE_PRIORITET_FARGER: Record<ArendePrioritet, string> = {
  lag: "bg-border/30 text-muted border-border",
  normal: "bg-border/40 text-foreground border-border",
  hog: "bg-red-50 text-red-800 border-red-200",
};

export type ArendeKommentar = {
  id: string;
  datum: string;
  fran: "styrelse" | "medlem";
  text: string;
};

export type Arende = {
  id: string;
  arendeNr: string;
  skapadDatum: string;
  /** Null tills ärendet stängs */
  stangdDatum?: string;
  status: ArendeStatus;
  prioritet: ArendePrioritet;
  kategori: ArendeKategori;
  franNamn: string;
  franEpost: string;
  lagenhetNr: string;
  amne: string;
  beskrivning: string;
  kommentarer: ArendeKommentar[];
  /** Krävs vid stängning — t.ex. "Styrelsemöte 2026-06-17 § 5" */
  protokollReferens?: string;
  ansvarigLedamot?: string;
};

export type KommunikationState = {
  version: 1;
  medlemmar: Medlem[];
  utskick: UtgaendeMejl[];
  arenden: Arende[];
  /** Löpnummer för ärendena per år: { "2026": 3 } */
  arendeRaknare: Record<string, number>;
};

// ── Konstanter ────────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-kommunikation";
export const KOMMUNIKATION_EVENT = "brf-kommunikation-uppdaterad";

// ── Läsa / Spara ──────────────────────────────────────────────────────────────

export function lasKommunikationState(): KommunikationState {
  if (typeof window === "undefined") {
    return { version: 1, medlemmar: [], utskick: [], arenden: [], arendeRaknare: {} };
  }
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) {
      return { version: 1, medlemmar: [], utskick: [], arenden: [], arendeRaknare: {} };
    }
    const parsed = JSON.parse(raw) as Partial<KommunikationState>;
    return {
      version: 1,
      medlemmar: Array.isArray(parsed.medlemmar) ? parsed.medlemmar : [],
      utskick: Array.isArray(parsed.utskick) ? parsed.utskick : [],
      arenden: Array.isArray(parsed.arenden) ? parsed.arenden : [],
      arendeRaknare:
        parsed.arendeRaknare && typeof parsed.arendeRaknare === "object"
          ? parsed.arendeRaknare
          : {},
    };
  } catch {
    return { version: 1, medlemmar: [], utskick: [], arenden: [], arendeRaknare: {} };
  }
}

export function sparaKommunikationState(state: KommunikationState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(KOMMUNIKATION_EVENT));
  }
}

// ── ID + ärendenummer ─────────────────────────────────────────────────────────

export function skapaKommunikationId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function skapaArendeNr(state: KommunikationState): {
  nr: string;
  nyState: KommunikationState;
} {
  const ar = String(new Date().getFullYear());
  const lopenummer = (state.arendeRaknare[ar] ?? 0) + 1;
  const nr = `Ä-${ar}-${String(lopenummer).padStart(3, "0")}`;
  return {
    nr,
    nyState: {
      ...state,
      arendeRaknare: { ...state.arendeRaknare, [ar]: lopenummer },
    },
  };
}

export function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
