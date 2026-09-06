import { safeSetLocalStorage } from "@/lib/localStorage";
import { normaliseraEpost } from "@/lib/auth/epost";

const STORAGE_KEY = "brf-styrelsemassa-leads-v1";
export const STYRELSEMASSA_LEAD_EVENT = "styrelsemassa-lead-uppdaterad";

export type StyrelsemassaLeadLokal = {
  id: string;
  foreningsNamn: string;
  epost: string;
  kontaktperson: string;
  telefon: string;
  status: "lank_skickad" | "skapade_test";
  foreningId: string | null;
  skapad: string;
  testSkapad: string | null;
};

function skapaId(): string {
  return `massa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function las(): StyrelsemassaLeadLokal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StyrelsemassaLeadLokal[]) : [];
  } catch {
    return [];
  }
}

function spara(lista: StyrelsemassaLeadLokal[]): void {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(STORAGE_KEY, JSON.stringify(lista));
  window.dispatchEvent(new Event(STYRELSEMASSA_LEAD_EVENT));
}

export function sparaStyrelsemassaLeadLokal(input: {
  foreningsNamn: string;
  epost: string;
  kontaktperson?: string;
  telefon?: string;
}): StyrelsemassaLeadLokal {
  const epost = normaliseraEpost(input.epost);
  const befintlig = las().find(
    (l) => l.epost === epost && l.status === "lank_skickad",
  );

  if (befintlig) {
    const uppdaterad: StyrelsemassaLeadLokal = {
      ...befintlig,
      foreningsNamn: input.foreningsNamn.trim(),
      kontaktperson: (input.kontaktperson ?? "").trim(),
      telefon: (input.telefon ?? "").trim(),
    };
    spara(las().map((l) => (l.id === befintlig.id ? uppdaterad : l)));
    return uppdaterad;
  }

  const rad: StyrelsemassaLeadLokal = {
    id: skapaId(),
    foreningsNamn: input.foreningsNamn.trim(),
    epost,
    kontaktperson: (input.kontaktperson ?? "").trim(),
    telefon: (input.telefon ?? "").trim(),
    status: "lank_skickad",
    foreningId: null,
    skapad: new Date().toISOString(),
    testSkapad: null,
  };
  spara([rad, ...las()]);
  return rad;
}

export function markeraStyrelsemassaLeadLokalSomSkapadeTest(opts: {
  epost: string;
  foreningId?: string;
}): void {
  const epost = normaliseraEpost(opts.epost);
  const nu = new Date().toISOString();
  spara(
    las().map((l) =>
      l.epost === epost
        ? {
            ...l,
            status: "skapade_test" as const,
            foreningId: opts.foreningId ?? l.foreningId,
            testSkapad: nu,
          }
        : l,
    ),
  );
}

export function listaStyrelsemassaLeadsLokal(): StyrelsemassaLeadLokal[] {
  return las().sort((a, b) => b.skapad.localeCompare(a.skapad));
}

export function sammanfattaStyrelsemassaLeadsLokal(
  leads: StyrelsemassaLeadLokal[],
): {
  totalt: number;
  lankSkickad: number;
  skapadeTest: number;
} {
  return {
    totalt: leads.length,
    lankSkickad: leads.filter((l) => l.status === "lank_skickad").length,
    skapadeTest: leads.filter((l) => l.status === "skapade_test").length,
  };
}
