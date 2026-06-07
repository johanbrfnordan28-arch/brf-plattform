import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import type { RonderingChecklistaTyp } from "@/components/rondering/checklist-mallar";
import {
  normaliseraForeningEgenskaper,
  standardForeningEgenskaper,
  type ForeningEgenskaper,
} from "@/components/rondering/forening-egenskaper";

export type { ForeningEgenskaper };

export type RonderingEgnaPunkt = {
  typ: RonderingChecklistaTyp;
  sektionId: string;
  id: string;
  text: string;
};

const RONDERING_STATE_BASE = "brf-rondering-state";

export function ronderingStateStorageKey(): string {
  return foreningStorageKey(RONDERING_STATE_BASE);
}

export type AvvikelseAllvarlighet = "lag" | "medium" | "hog";
export type AvvikelseStatus = "oppen" | "pagar" | "atgardad";

/** Koppling till rondering eller städ — för avvikelserapport och filter. */
export type AvvikelseKategori = RonderingChecklistaTyp;

export type RonderingAvvikelse = {
  id: string;
  kategori: AvvikelseKategori;
  rubrik: string;
  plats: string;
  beskrivning: string;
  allvarlighet: AvvikelseAllvarlighet;
  status: AvvikelseStatus;
  rapporteradDatum: string;
  rapporteradAv?: string;
  checklistaPunktNyckel?: string;
  atgardadDatum?: string;
  atgardKommentar?: string;
};

export type RonderingState = {
  klaraPunkter: string[];
  avvikelser: RonderingAvvikelse[];
  egenskaper: ForeningEgenskaper;
  doldaPunkter: string[];
  egnaPunkter: RonderingEgnaPunkt[];
};

export function skapaTomRonderingState(): RonderingState {
  return {
    klaraPunkter: [],
    avvikelser: [],
    egenskaper: standardForeningEgenskaper(),
    doldaPunkter: [],
    egnaPunkter: [],
  };
}

export function skapaEgenPunktId(): string {
  return `egen-${Date.now().toString(36)}`;
}

export function skapaAvvikelseId(): string {
  return `avv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normaliseraAvvikelse(raw: Partial<RonderingAvvikelse>): RonderingAvvikelse | null {
  const kategori = raw.kategori;
  if (
    kategori !== "rondering-utvandig" &&
    kategori !== "rondering-invandig" &&
    kategori !== "stadning"
  ) {
    return null;
  }
  const rubrik = raw.rubrik?.trim();
  if (!rubrik) return null;
  const allvarlighet =
    raw.allvarlighet === "hog" || raw.allvarlighet === "medium"
      ? raw.allvarlighet
      : "lag";
  const status =
    raw.status === "pagar" || raw.status === "atgardad" ? raw.status : "oppen";
  return {
    id: raw.id?.trim() || skapaAvvikelseId(),
    kategori,
    rubrik,
    plats: raw.plats?.trim() ?? "",
    beskrivning: raw.beskrivning?.trim() ?? "",
    allvarlighet,
    status,
    rapporteradDatum: raw.rapporteradDatum?.trim() || new Date().toISOString().slice(0, 10),
    rapporteradAv: raw.rapporteradAv?.trim() || undefined,
    checklistaPunktNyckel: raw.checklistaPunktNyckel?.trim() || undefined,
    atgardadDatum: raw.atgardadDatum?.trim() || undefined,
    atgardKommentar: raw.atgardKommentar?.trim() || undefined,
  };
}

export function normaliseraRonderingState(raw: unknown): RonderingState {
  if (!raw || typeof raw !== "object") return skapaTomRonderingState();
  const o = raw as Record<string, unknown>;
  const klaraPunkter = Array.isArray(o.klaraPunkter)
    ? o.klaraPunkter.filter((k): k is string => typeof k === "string")
    : [];
  const avvikelser = Array.isArray(o.avvikelser)
    ? o.avvikelser
        .map((a) => normaliseraAvvikelse(a as Partial<RonderingAvvikelse>))
        .filter((a): a is RonderingAvvikelse => a != null)
    : [];
  const giltigaTyper = new Set([
    "rondering-utvandig",
    "rondering-invandig",
    "stadning",
  ]);
  const egnaPunkter = Array.isArray(o.egnaPunkter)
    ? o.egnaPunkter
        .filter(
          (e): e is RonderingEgnaPunkt =>
            typeof e === "object" &&
            e != null &&
            giltigaTyper.has((e as RonderingEgnaPunkt).typ) &&
            typeof (e as RonderingEgnaPunkt).sektionId === "string" &&
            typeof (e as RonderingEgnaPunkt).id === "string" &&
            typeof (e as RonderingEgnaPunkt).text === "string",
        )
        .map((e) => ({
          typ: e.typ,
          sektionId: e.sektionId.trim(),
          id: e.id.trim(),
          text: e.text.trim(),
        }))
        .filter((e) => e.text.length > 0 && e.sektionId.length > 0)
    : [];
  const doldaPunkter = Array.isArray(o.doldaPunkter)
    ? o.doldaPunkter.filter((k): k is string => typeof k === "string")
    : [];
  const egenskaper = normaliseraForeningEgenskaper(
    o.egenskaper as Partial<ForeningEgenskaper> | undefined,
  );
  return { klaraPunkter, avvikelser, egenskaper, doldaPunkter, egnaPunkter };
}

export function lasRonderingState(): RonderingState {
  if (typeof window === "undefined") return skapaTomRonderingState();
  try {
    const raw = localStorage.getItem(ronderingStateStorageKey());
    return raw ? normaliseraRonderingState(JSON.parse(raw)) : skapaTomRonderingState();
  } catch {
    return skapaTomRonderingState();
  }
}

export function sparaRonderingState(state: RonderingState): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(
    ronderingStateStorageKey(),
    JSON.stringify(normaliseraRonderingState(state)),
  ).ok;
}

/** Normaliserar sparad ronderingsdata utan att ta bort avvikelser eller egna punkter. */
export function migreraRonderingStateForForening(foreningId: string): void {
  if (typeof window === "undefined") return;
  const key = foreningStorageKey(RONDERING_STATE_BASE, foreningId);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const state = normaliseraRonderingState(JSON.parse(raw));
    safeSetLocalStorage(key, JSON.stringify(state));
  } catch {
    /* behåll rådata */
  }
}

export const avvikelseAllvarlighetEtiketter: Record<AvvikelseAllvarlighet, string> = {
  lag: "Låg",
  medium: "Medel",
  hog: "Hög",
};

export const avvikelseStatusEtiketter: Record<AvvikelseStatus, string> = {
  oppen: "Öppen",
  pagar: "Pågår",
  atgardad: "Åtgärdad",
};
