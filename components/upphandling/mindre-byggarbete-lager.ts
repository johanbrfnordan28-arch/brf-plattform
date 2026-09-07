import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type ByggarbetePrioritet = "lag" | "normal" | "akut";
export type ByggarbeteStatus =
  | "ny"
  | "offert-skickad"
  | "offert-mottagen"
  | "pagaende"
  | "klar";

export const PRIORITET_ETIKETTER: Record<ByggarbetePrioritet, string> = {
  lag: "Låg prioritet",
  normal: "Normal",
  akut: "Akut",
};

export const PRIORITET_FARGER: Record<ByggarbetePrioritet, string> = {
  lag: "bg-border/30 text-muted border-border",
  normal: "bg-blue-50 text-blue-800 border-blue-200",
  akut: "bg-red-50 text-red-800 border-red-200",
};

export const STATUS_ETIKETTER: Record<ByggarbeteStatus, string> = {
  ny: "Ny",
  "offert-skickad": "Offert skickad",
  "offert-mottagen": "Offert mottagen",
  pagaende: "Pågående",
  klar: "Klar",
};

export const STATUS_FARGER: Record<ByggarbeteStatus, string> = {
  ny: "bg-border/30 text-muted border-border",
  "offert-skickad": "bg-amber-50 text-amber-800 border-amber-200",
  "offert-mottagen": "bg-sky-50 text-sky-800 border-sky-200",
  pagaende: "bg-blue-50 text-blue-800 border-blue-200",
  klar: "bg-[#eef6f0] text-primary-dark border-primary/30",
};

export const STATUS_IKONER: Record<ByggarbeteStatus, string> = {
  ny: "🆕",
  "offert-skickad": "📤",
  "offert-mottagen": "📥",
  pagaende: "🔨",
  klar: "✅",
};

export type MindreByggarbete = {
  id: string;
  arbetstyp: string;
  beskrivning: string;
  plats: string;
  prioritet: ByggarbetePrioritet;
  status: ByggarbeteStatus;
  skapadDatum: string;
  offertMottagarEpost: string;
  notering: string;
};

export type MindreByggarbeteState = {
  version: 1;
  arbeten: MindreByggarbete[];
};

// ── Snabbval ──────────────────────────────────────────────────────────────────

export const ARBETSTYP_SNABBVAL: { etikett: string; ikon: string }[] = [
  { etikett: "Målning", ikon: "🎨" },
  { etikett: "Golvbyte", ikon: "🪵" },
  { etikett: "Kakel / plattsättning", ikon: "🟫" },
  { etikett: "Snickeriarbete", ikon: "🪚" },
  { etikett: "Elarbete", ikon: "⚡" },
  { etikett: "Rörbyte / VVS", ikon: "🔧" },
  { etikett: "Fönsterbyte", ikon: "🪟" },
  { etikett: "Dörrbyte", ikon: "🚪" },
  { etikett: "Takarbete", ikon: "🏠" },
  { etikett: "Markarbete", ikon: "⛏️" },
  { etikett: "Glasarbete", ikon: "🪞" },
  { etikett: "Plåtarbete", ikon: "🔩" },
  { etikett: "Låsarbete / säkerhet", ikon: "🔐" },
  { etikett: "Städning / sanering", ikon: "🧹" },
  { etikett: "Övrigt", ikon: "📦" },
];

// ── Konstanter ────────────────────────────────────────────────────────────────

const STORAGE_KEY_BASE = "brf-mindre-byggarbeten";
export const BYGGARBETE_EVENT = "brf-mindre-byggarbete-uppdaterat";

// ── Läsa / Spara ──────────────────────────────────────────────────────────────

export function lasMindreByggarbeten(): MindreByggarbeteState {
  if (typeof window === "undefined") return { version: 1, arbeten: [] };
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return { version: 1, arbeten: [] };
    const parsed = JSON.parse(raw) as Partial<MindreByggarbeteState>;
    return {
      version: 1,
      arbeten: Array.isArray(parsed.arbeten) ? parsed.arbeten : [],
    };
  } catch {
    return { version: 1, arbeten: [] };
  }
}

export function sparaMindreByggarbeten(state: MindreByggarbeteState): void {
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(state),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BYGGARBETE_EVENT));
  }
}

export function skapaByggarbeteId(): string {
  return `bygg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
