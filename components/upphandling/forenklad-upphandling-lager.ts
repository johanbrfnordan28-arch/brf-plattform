import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type ArendeStatus = "ej-planerad" | "planerad" | "pagaende" | "klar";

export const ARENDE_STATUS_ETIKETTER: Record<ArendeStatus, string> = {
  "ej-planerad": "Ej planerad",
  planerad: "Planerad",
  pagaende: "Pågående",
  klar: "Klar",
};

export const ARENDE_STATUS_FARGER: Record<
  ArendeStatus,
  { bg: string; text: string; border: string }
> = {
  "ej-planerad": {
    bg: "bg-border/30",
    text: "text-muted",
    border: "border-border",
  },
  planerad: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  pagaende: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  klar: {
    bg: "bg-[#eef6f0]",
    text: "text-primary-dark",
    border: "border-primary/30",
  },
};

/** Fält gemensamma för alla ärendetyper. */
export type ArendeGemensamt = {
  status: ArendeStatus;
  leverantor: string;
  offertKr: string;
  bestallningsDatum: string;
  utfortDatum: string;
  notering: string;
};

/** OVK — Obligatorisk Ventilationskontroll */
export type OvkData = ArendeGemensamt & {
  nastaDatum: string;
  senastGodkantDatum: string;
  besiktningsforetag: string;
};

/** Energideklaration */
export type EnergiDeklarationData = ArendeGemensamt & {
  giltigTom: string;
  energiklass: string;
  registreradHos: string;
};

/** Radonmätning */
export type RadonMatningData = ArendeGemensamt & {
  matFranDatum: string;
  matTomDatum: string;
  resultatBqm3: string;
  atgardskrav: boolean; // >200 Bq/m³ kräver åtgärd
};

/** Eget ärende – döpt av styrelsen */
export type EgetArende = ArendeGemensamt & {
  id: string;
  rubrik: string;
  beskrivning: string;
};

export type ForenkladUpphandlingState = {
  version: 1;
  ovk: OvkData;
  energideklaration: EnergiDeklarationData;
  radon: RadonMatningData;
  egna: EgetArende[];
};

// ── Standardvärden ────────────────────────────────────────────────────────────

function tomGemensamt(): ArendeGemensamt {
  return {
    status: "ej-planerad",
    leverantor: "",
    offertKr: "",
    bestallningsDatum: "",
    utfortDatum: "",
    notering: "",
  };
}

export function tomOvk(): OvkData {
  return {
    ...tomGemensamt(),
    nastaDatum: "",
    senastGodkantDatum: "",
    besiktningsforetag: "",
  };
}

export function tomEnergiDeklaration(): EnergiDeklarationData {
  return {
    ...tomGemensamt(),
    giltigTom: "",
    energiklass: "",
    registreradHos: "Boverket",
  };
}

export function tomRadonMatning(): RadonMatningData {
  return {
    ...tomGemensamt(),
    matFranDatum: "",
    matTomDatum: "",
    resultatBqm3: "",
    atgardskrav: false,
  };
}

export function tomForenkladUpphandlingState(): ForenkladUpphandlingState {
  return {
    version: 1,
    ovk: tomOvk(),
    energideklaration: tomEnergiDeklaration(),
    radon: tomRadonMatning(),
    egna: [],
  };
}

// ── Konstanter ────────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-forenklad-upphandling";
export const FORENKLAD_EVENT = "brf-forenklad-upphandling-uppdaterad";

export const ENERGIKLASSER = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type Energiklass = (typeof ENERGIKLASSER)[number];

// ── Läsa / Spara ──────────────────────────────────────────────────────────────

export function lasForenkladUpphandling(): ForenkladUpphandlingState {
  if (typeof window === "undefined") return tomForenkladUpphandlingState();
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return tomForenkladUpphandlingState();
    const parsed = JSON.parse(raw) as Partial<ForenkladUpphandlingState>;
    const tom = tomForenkladUpphandlingState();
    return {
      version: 1,
      ovk: { ...tom.ovk, ...parsed.ovk },
      energideklaration: {
        ...tom.energideklaration,
        ...parsed.energideklaration,
      },
      radon: { ...tom.radon, ...parsed.radon },
      egna: Array.isArray(parsed.egna) ? parsed.egna : [],
    };
  } catch {
    return tomForenkladUpphandlingState();
  }
}

export function sparaForenkladUpphandling(
  state: ForenkladUpphandlingState,
): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FORENKLAD_EVENT));
  }
}

// ── Hjälp ─────────────────────────────────────────────────────────────────────

export function skapaEgetArendeId(): string {
  return `forenk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Radon >200 Bq/m³ kräver åtgärd per Strålsäkerhetsmyndigheten. */
export function radonKraverAtgard(resultatBqm3: string): boolean {
  const v = parseFloat(resultatBqm3.replace(",", "."));
  return Number.isFinite(v) && v > 200;
}

/** OVK-intervall baserat på ventilationssystemet (Boverkets föreskrifter). */
export function ovkIntervallAr(ventilationssystem: string): number {
  const v = ventilationssystem.toLowerCase();
  if (v.includes("ftx") || v.includes("ft-")) return 3;
  if (v.includes("ft") && !v.includes("fx")) return 3;
  if (v.includes("fläkt") || v.includes("mekanisk")) return 3;
  if (v.includes("s ") || v === "s" || v.includes("självdrag")) return 6;
  if (v.includes("f ") || v === "f" || v.startsWith("f,")) return 6;
  return 3; // konservativt default
}
