import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const PROJEKT_BASE = "brf-medlemmar-renovering";

export const RENOVERINGS_PROJEKT_EVENT = "renoverings-projekt-uppdaterad";
export const MEDLEMMAR_RENOVERING_EVENT = "medlemmar-renovering-uppdaterad";

/** @deprecated Behålls för äldre anrop — motsvarar aktivt projekt. */
export type RenoveringsAnmalanState = {
  valdaTyper: string[];
  klaraPunkter: string[];
  sparad: boolean;
};

export type RenoveringsProjektStatus =
  | "utkast"
  | "checklist_pagar"
  | "klar_for_avtal"
  | "avtal_skickat"
  | "avtal_signerat";

export type RenoveringsProjekt = {
  id: string;
  apartmentId: number;
  lagenhetsnummer: string;
  valdaTyper: string[];
  klaraPunkter: string[];
  sparad: boolean;
  skapad: string;
  uppdaterad: string;
  planeratStart?: string;
  planeratSlut?: string;
  /** Renoveringsmappar i lägenhetsarkivet som hör till projektet. */
  koppladeMappIds: number[];
  status: RenoveringsProjektStatus;
};

export type RenoveringsProjektLager = {
  version: 2;
  aktivProjektId?: string;
  projekt: RenoveringsProjekt[];
};

export function medlemmarRenoveringStorageKey(): string {
  return foreningStorageKey(PROJEKT_BASE);
}

export function skapaTomRenoveringsAnmalan(): RenoveringsAnmalanState {
  return { valdaTyper: [], klaraPunkter: [], sparad: false };
}

export function skapaRenoveringsProjektId(): string {
  return `ren-proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function skapaTomLager(): RenoveringsProjektLager {
  return { version: 2, projekt: [] };
}

function normaliseraProjekt(raw: unknown): RenoveringsProjekt | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<RenoveringsProjekt>;
  if (typeof p.apartmentId !== "number" || !p.lagenhetsnummer?.trim()) {
    return null;
  }
  const nu = new Date().toISOString();
  return {
    id: String(p.id ?? skapaRenoveringsProjektId()),
    apartmentId: p.apartmentId,
    lagenhetsnummer: String(p.lagenhetsnummer).trim(),
    valdaTyper: Array.isArray(p.valdaTyper) ? p.valdaTyper.map(String) : [],
    klaraPunkter: Array.isArray(p.klaraPunkter)
      ? p.klaraPunkter.map(String)
      : [],
    sparad: Boolean(p.sparad),
    skapad: typeof p.skapad === "string" ? p.skapad : nu,
    uppdaterad: typeof p.uppdaterad === "string" ? p.uppdaterad : nu,
    planeratStart:
      typeof p.planeratStart === "string" ? p.planeratStart : undefined,
    planeratSlut: typeof p.planeratSlut === "string" ? p.planeratSlut : undefined,
    koppladeMappIds: Array.isArray(p.koppladeMappIds)
      ? p.koppladeMappIds.filter((id) => typeof id === "number")
      : [],
    status:
      p.status === "checklist_pagar" ||
      p.status === "klar_for_avtal" ||
      p.status === "avtal_skickat" ||
      p.status === "avtal_signerat"
        ? p.status
        : "utkast",
  };
}

function migreraFranV1(raw: unknown): RenoveringsProjektLager {
  if (!raw || typeof raw !== "object") return skapaTomLager();
  const data = raw as Record<string, unknown>;
  if (data.version === 2) {
    const lager = data as Partial<RenoveringsProjektLager>;
    const projekt = Array.isArray(lager.projekt)
      ? lager.projekt
          .map(normaliseraProjekt)
          .filter((p): p is RenoveringsProjekt => Boolean(p))
      : [];
    return {
      version: 2,
      aktivProjektId:
        typeof lager.aktivProjektId === "string"
          ? lager.aktivProjektId
          : projekt[0]?.id,
      projekt,
    };
  }
  const legacy = raw as Partial<RenoveringsAnmalanState>;
  if (
    !Array.isArray(legacy.valdaTyper) &&
    !Array.isArray(legacy.klaraPunkter)
  ) {
    return skapaTomLager();
  }
  return skapaTomLager();
}

export function lasRenoveringsProjektLager(): RenoveringsProjektLager {
  if (typeof window === "undefined") return skapaTomLager();
  try {
    const raw = localStorage.getItem(medlemmarRenoveringStorageKey());
    if (!raw) return skapaTomLager();
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as RenoveringsProjektLager).version === 2
    ) {
      return migreraFranV1(parsed);
    }
    return migreraFranV1(parsed);
  } catch {
    return skapaTomLager();
  }
}

function sparaLager(lager: RenoveringsProjektLager): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    medlemmarRenoveringStorageKey(),
    JSON.stringify(lager),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(RENOVERINGS_PROJEKT_EVENT));
    window.dispatchEvent(new Event("medlemmar-renovering-uppdaterad"));
  }
  return ok;
}

export function hamtaAktivtRenoveringsProjekt(): RenoveringsProjekt | null {
  const lager = lasRenoveringsProjektLager();
  if (lager.aktivProjektId) {
    return lager.projekt.find((p) => p.id === lager.aktivProjektId) ?? null;
  }
  return lager.projekt[0] ?? null;
}

export function lasRenoveringsAnmalan(): RenoveringsAnmalanState | null {
  const aktiv = hamtaAktivtRenoveringsProjekt();
  if (!aktiv) return null;
  return {
    valdaTyper: aktiv.valdaTyper,
    klaraPunkter: aktiv.klaraPunkter,
    sparad: aktiv.sparad,
  };
}

export function sparaRenoveringsAnmalan(state: RenoveringsAnmalanState): boolean {
  const aktiv = hamtaAktivtRenoveringsProjekt();
  if (!aktiv) return false;
  return uppdateraRenoveringsProjekt(aktiv.id, {
    valdaTyper: state.valdaTyper,
    klaraPunkter: state.klaraPunkter,
    sparad: state.sparad,
    status:
      state.valdaTyper.length > 0 ? "checklist_pagar" : aktiv.status,
  });
}

export function uppdateraRenoveringsProjekt(
  projektId: string,
  patch: Partial<RenoveringsProjekt>,
): boolean {
  const lager = lasRenoveringsProjektLager();
  const index = lager.projekt.findIndex((p) => p.id === projektId);
  if (index < 0) return false;
  const nu = new Date().toISOString();
  lager.projekt[index] = {
    ...lager.projekt[index],
    ...patch,
    id: projektId,
    uppdaterad: nu,
  };
  return sparaLager(lager);
}

export function valjEllerSkapaRenoveringsProjekt(input: {
  apartmentId: number;
  lagenhetsnummer: string;
}): RenoveringsProjekt {
  const lager = lasRenoveringsProjektLager();
  const befintlig = lager.projekt.find(
    (p) =>
      p.apartmentId === input.apartmentId &&
      p.status !== "avtal_signerat",
  );
  if (befintlig) {
    lager.aktivProjektId = befintlig.id;
    sparaLager(lager);
    return befintlig;
  }
  const nu = new Date().toISOString();
  const nytt: RenoveringsProjekt = {
    id: skapaRenoveringsProjektId(),
    apartmentId: input.apartmentId,
    lagenhetsnummer: input.lagenhetsnummer.trim(),
    valdaTyper: [],
    klaraPunkter: [],
    sparad: false,
    skapad: nu,
    uppdaterad: nu,
    koppladeMappIds: [],
    status: "utkast",
  };
  lager.projekt = [nytt, ...lager.projekt].slice(0, 50);
  lager.aktivProjektId = nytt.id;
  sparaLager(lager);
  return nytt;
}

export function sparaRenoveringsProjekt(projekt: RenoveringsProjekt): boolean {
  const lager = lasRenoveringsProjektLager();
  const index = lager.projekt.findIndex((p) => p.id === projekt.id);
  const nu = new Date().toISOString();
  const next = { ...projekt, uppdaterad: nu };
  if (index >= 0) lager.projekt[index] = next;
  else lager.projekt = [next, ...lager.projekt];
  lager.aktivProjektId = next.id;
  return sparaLager(lager);
}
