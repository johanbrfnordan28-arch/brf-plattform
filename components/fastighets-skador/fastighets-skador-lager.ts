import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

export type FastighetsSkadaStatus =
  | "rapporterad"
  | "under_atgard"
  | "atgardad"
  | "arkiverad";

export type FastighetsSkadaAllvar = "lag" | "medel" | "hog";

export type FastighetsSkadaOrsak =
  | "okand"
  | "forslitning_underhall"
  | "entreprenor"
  | "medlem"
  | "annat";

export type FastighetsSkadaHistorikPost = {
  tidpunkt: string;
  text: string;
};

export type FastighetsSkada = {
  id: string;
  titel: string;
  plats: string;
  beskrivning: string;
  upptacktDatum: string;
  status: FastighetsSkadaStatus;
  allvar: FastighetsSkadaAllvar;
  orsak: FastighetsSkadaOrsak;
  ansvarig: string;
  anteckning: string;
  /** Checklista — id:n på avklarade punkter. */
  checklistaKlar: string[];
  /** Spårbar historik (samma princip som övriga portalen). */
  historik: FastighetsSkadaHistorikPost[];
  skapad: string;
};

export type FastighetsSkadorState = {
  version: 1;
  skador: FastighetsSkada[];
};

const STORAGE_KEY_BASE = "brf-fastighets-skador";
export const FASTIGHETS_SKADOR_EVENT = "brf-fastighets-skador-uppdaterad";

export const statusEtiketter: Record<FastighetsSkadaStatus, string> = {
  rapporterad: "Rapporterad",
  under_atgard: "Under åtgärd",
  atgardad: "Åtgärdad",
  arkiverad: "Arkiverad",
};

export const allvarEtiketter: Record<FastighetsSkadaAllvar, string> = {
  lag: "Låg",
  medel: "Medel",
  hog: "Hög",
};

export const orsakEtiketter: Record<FastighetsSkadaOrsak, string> = {
  okand: "Okänd / utreds",
  forslitning_underhall: "Förslitning / bristande underhåll",
  entreprenor: "Entreprenör",
  medlem: "Medlem / boende",
  annat: "Annat",
};

/** Checklista som styrelsen går igenom vid skada. */
export const SKADE_CHECKLISTA: { id: string; text: string }[] = [
  {
    id: "dokumentera",
    text: "Dokumentera skadan — foto, plats, tidpunkt och omfattning.",
  },
  {
    id: "begransa",
    text: "Begränsa följdskador (stäng av vatten, skydda ytor, varna boende).",
  },
  {
    id: "berorda",
    text: "Identifiera berörda lägenheter — t.ex. vid badrumsskada på plan 4 ofta lägenheter under.",
  },
  {
    id: "jav",
    text: "Kontrollera jäv — drabbade styrelsemedlemmar deltar inte i beslut som gynnar dem.",
  },
  {
    id: "medlem-forsakring",
    text: "Informera berörda medlemmar att anmäla till sitt eget försäkringsbolag.",
  },
  {
    id: "forening-forsakring",
    text: "Anmäl till föreningens fastighetsförsäkring när föreningens ansvar kan beröras.",
  },
  {
    id: "extern-hjalp",
    text: "Bedöm om extern hjälp behövs — besiktningsman och/eller skadeutredare.",
  },
  {
    id: "orsak",
    text: "Bedöm orsak: förslitning/underhåll, entreprenör, medlem eller annat — dokumentera.",
  },
  {
    id: "entreprenor",
    text: "Om entreprenör kan vara orsak: notera köpare, garanti (ofta 2 år) och ansvarstid (ofta 10 år).",
  },
  {
    id: "policy-stamma",
    text: "Vid kniviga fall: överväg arbetsgrupp eller låt stämman besluta enligt föreningens policy.",
  },
  {
    id: "historik",
    text: "Spara allt i skaderegistret — historik och spårbarhet behövs för framtiden.",
  },
];

export function lasFastighetsSkadorState(): FastighetsSkadorState {
  if (typeof window === "undefined") {
    return { version: 1, skador: [] };
  }
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return { version: 1, skador: [] };
    const parsed = JSON.parse(raw) as Partial<FastighetsSkadorState>;
    const skador = Array.isArray(parsed.skador)
      ? parsed.skador.map(normaliseraSkada)
      : [];
    return { version: 1, skador };
  } catch {
    return { version: 1, skador: [] };
  }
}

export function normaliseraSkada(raw: Partial<FastighetsSkada>): FastighetsSkada {
  return {
    id: raw.id ?? skapaSkadaId(),
    titel: raw.titel?.trim() ?? "Utan titel",
    plats: raw.plats?.trim() ?? "",
    beskrivning: raw.beskrivning?.trim() ?? "",
    upptacktDatum: raw.upptacktDatum ?? "",
    status: raw.status ?? "rapporterad",
    allvar: raw.allvar ?? "medel",
    orsak: raw.orsak ?? "okand",
    ansvarig: raw.ansvarig?.trim() ?? "",
    anteckning: raw.anteckning?.trim() ?? "",
    checklistaKlar: Array.isArray(raw.checklistaKlar) ? raw.checklistaKlar : [],
    historik: Array.isArray(raw.historik) ? raw.historik : [],
    skapad: raw.skapad ?? new Date().toISOString(),
  };
}

export function sparaFastighetsSkadorState(state: FastighetsSkadorState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FASTIGHETS_SKADOR_EVENT));
  }
}

export function skapaSkadaId(): string {
  return `skada-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function laggTillHistorik(
  skada: FastighetsSkada,
  text: string,
): FastighetsSkada {
  return {
    ...skada,
    historik: [
      { tidpunkt: new Date().toISOString(), text },
      ...skada.historik,
    ],
  };
}

export function formatHistorikTid(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
