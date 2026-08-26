import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

// ── Typer ────────────────────────────────────────────────────────────────────

export type AtgardTyp = "byte" | "service" | "besiktning" | "reparation" | "ovrig";

export const ATGARD_TYP_ETIKETTER: Record<AtgardTyp, string> = {
  byte: "Byte / renovering",
  service: "Service / underhåll",
  besiktning: "Besiktning",
  reparation: "Reparation",
  ovrig: "Övrigt",
};

export type UnderhallsAtgard = {
  id: string;
  komponent: string;
  beskrivning: string;
  typ: AtgardTyp;
  intervallAr: string;
  senastUtfortAr: string;
  nastaAr: string;
  uppskattadKostnadKr: string;
  prislistaId: string;
  notering: string;
};

export type PlanPost = {
  version: 1;
  id: string;
  namn: string;
  notering: string;
  arGrundmall: boolean;
  skapadTidpunkt: string;
  uppdateradTidpunkt: string;
  komponenter: string[];
  atgarder: UnderhallsAtgard[];
};

type PlanRegistry = {
  version: 1;
  planIds: string[];
};

// ── Konstanter ───────────────────────────────────────────────────────────────

export const GRUNDMALL_PLAN_ID = "grundmall";
const REGISTRY_KEY_BASE = "brf-plan-registry";
const PLAN_KEY_PREFIX = "brf-plan-";
export const PLAN_STATE_EVENT = "brf-plan-state-uppdaterad";

// ── Interna hjälpfunktioner ──────────────────────────────────────────────────

function registryKey(): string {
  return foreningStorageKey(REGISTRY_KEY_BASE);
}

function planKey(planId: string): string {
  return foreningStorageKey(`${PLAN_KEY_PREFIX}${planId}`);
}

function sparaRegistry(registry: PlanRegistry): void {
  safeSetLocalStorage(registryKey(), JSON.stringify(registry));
}

function skapaGrundmallDefault(): PlanPost {
  const nu = new Date().toISOString();
  return {
    version: 1,
    id: GRUNDMALL_PLAN_ID,
    namn: "Grundmall",
    notering:
      "Föreningens grundmall — används som utgångspunkt när nya underhållsplaner skapas.",
    arGrundmall: true,
    skapadTidpunkt: nu,
    uppdateradTidpunkt: nu,
    komponenter: [],
    atgarder: [],
  };
}

// ── Läsa ────────────────────────────────────────────────────────────────────

export function lasPlanRegistry(): PlanRegistry {
  if (typeof window === "undefined") return { version: 1, planIds: [] };
  try {
    const raw = localStorage.getItem(registryKey());
    if (!raw) return { version: 1, planIds: [] };
    const parsed = JSON.parse(raw) as Partial<PlanRegistry>;
    return {
      version: 1,
      planIds: Array.isArray(parsed.planIds) ? parsed.planIds : [],
    };
  } catch {
    return { version: 1, planIds: [] };
  }
}

export function lasPlan(planId: string): PlanPost | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(planKey(planId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanPost>;
    return {
      version: 1,
      id: parsed.id ?? planId,
      namn: parsed.namn ?? "",
      notering: parsed.notering ?? "",
      arGrundmall: parsed.arGrundmall ?? false,
      skapadTidpunkt: parsed.skapadTidpunkt ?? new Date().toISOString(),
      uppdateradTidpunkt: parsed.uppdateradTidpunkt ?? new Date().toISOString(),
      komponenter: Array.isArray(parsed.komponenter) ? parsed.komponenter : [],
      atgarder: Array.isArray(parsed.atgarder) ? parsed.atgarder : [],
    };
  } catch {
    return null;
  }
}

export function lasGrundmall(): PlanPost {
  return lasPlan(GRUNDMALL_PLAN_ID) ?? skapaGrundmallDefault();
}

export function lasAllaPlanIds(): string[] {
  return lasPlanRegistry().planIds;
}

// ── Spara / uppdatera ────────────────────────────────────────────────────────

export function sparaPlan(plan: PlanPost): void {
  const uppdaterad: PlanPost = {
    ...plan,
    uppdateradTidpunkt: new Date().toISOString(),
  };
  safeSetLocalStorage(planKey(plan.id), JSON.stringify(uppdaterad));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PLAN_STATE_EVENT));
  }
}

export function sparaGrundmall(plan: Omit<PlanPost, "id" | "arGrundmall">): void {
  sparaPlan({ ...plan, id: GRUNDMALL_PLAN_ID, arGrundmall: true });
}

// ── Skapa ────────────────────────────────────────────────────────────────────

export function skapaNyPlan(namn: string, kopieraFranGrundmall = true): PlanPost {
  const nu = new Date().toISOString();
  const id = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const kalla = kopieraFranGrundmall ? lasGrundmall() : null;

  const plan: PlanPost = {
    version: 1,
    id,
    namn: namn.trim() || "Ny underhållsplan",
    notering: "",
    arGrundmall: false,
    skapadTidpunkt: nu,
    uppdateradTidpunkt: nu,
    komponenter: kalla?.komponenter ?? [],
    atgarder:
      kalla?.atgarder.map((a) => ({
        ...a,
        id: `atg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })) ?? [],
  };

  safeSetLocalStorage(planKey(id), JSON.stringify(plan));

  const registry = lasPlanRegistry();
  sparaRegistry({ ...registry, planIds: [...registry.planIds, id] });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PLAN_STATE_EVENT));
  }
  return plan;
}

// ── Ta bort ─────────────────────────────────────────────────────────────────

export function taBortPlan(planId: string): void {
  if (planId === GRUNDMALL_PLAN_ID) return;
  if (typeof window === "undefined") return;
  localStorage.removeItem(planKey(planId));
  const registry = lasPlanRegistry();
  sparaRegistry({
    ...registry,
    planIds: registry.planIds.filter((id) => id !== planId),
  });
  window.dispatchEvent(new CustomEvent(PLAN_STATE_EVENT));
}

// ── ID-hjälp ─────────────────────────────────────────────────────────────────

export function skapaUnikAtgardId(): string {
  return `atg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
