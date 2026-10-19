import {
  lagenhetsBasSidor,
  skapaLagenhetsDokumentId,
  skapaRenoveringsMapp,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const LAGENHETSARKIV_BASE = "brf-lagenhetsarkiv-v3";

/** Äldre nycklar — migreras till v3 utan att radera originalet. */
const LEGACY_LAGENHETSARKIV_BASES = [
  "brf-lagenhetsarkiv-v2",
  "brf-lagenhetsarkiv",
] as const;

export const LAGENHETSARKIV_EVENT = "lagenhetsarkiv-uppdaterad";

export function lagenhetsarkivStorageKey(foreningId?: string): string {
  return foreningStorageKey(LAGENHETSARKIV_BASE, foreningId);
}

export type LagenhetsarkivState = {
  apartments: ApartmentFolder[];
  nextApartmentNumber: number;
};

export function skapaGrundmallDemoArkiv(): LagenhetsarkivState {
  let renovering2024 = skapaRenoveringsMapp("renovering", {
    id: 1,
    namn: "Renoveringsmapp 2024",
    ar: 2024,
  });
  // Lägg exempel-dokument i badrum-undermappen
  renovering2024 = {
    ...renovering2024,
    undermappar: renovering2024.undermappar.map((u) =>
      u.typ === "badrum"
        ? {
            ...u,
            dokument: [
              {
                id: skapaLagenhetsDokumentId(),
                filnamn: "Renoveringsanmälan.pdf",
                uppladdad: "2024-03-12",
              },
              {
                id: skapaLagenhetsDokumentId(),
                filnamn: "Intyg våtrum.pdf",
                uppladdad: "2024-06-01",
              },
            ],
          }
        : u,
    ),
  };

  const apartments: ApartmentFolder[] = [
    {
      id: 1,
      lagenhetsnummer: "1001",
      basePages: [...lagenhetsBasSidor],
      folders: [renovering2024],
      adress: "Storgatan 1, lgh 1001",
      vaning: "3",
      boyta: "78",
      andelstal: "0,7842",
      antalRum: "3 rok",
      antalKok: "1",
      antalBadrum: "1",
      antalWC: "1",
      lagenhetsRum: {
        hall: {
          besiktning: { status: "normalt", senastBesiktad: "2025-03-15" },
          uppvarmning: { typ: "radiator", antal: "2" },
        },
        kok: {
          senasteRenovering: { ar: "2019", harDokumentation: true },
          lackagekydd: {
            diskmaskin: true,
            kylskap: true,
            frys: true,
            diskbanksskap: true,
          },
          besiktning: { status: "observera" },
          uppvarmning: { typ: "golvvarme-vatten", antal: "1" },
        },
        badrum: {
          senasteRenovering: {
            ar: "2024",
            harBilder: true,
            foljtBranschregler: true,
          },
          besiktning: { status: "bra" },
          kontrollpunkter: {
            tatskiktGolvbrunn: "ok",
            tappvatten: { plats: "rorschakt", lackageIndikering: true },
          },
          uppvarmning: { typ: "golvvarme-el", antal: "1" },
        },
        ovrigaRum: [],
      },
      eldstader: [
        {
          id: "eldstad-demo-1",
          godkand: true,
          eldningsforbud: false,
        },
      ],
    },
    ...["1002", "1003", "1004", "1005"].map((nr, index) => ({
      id: index + 2,
      lagenhetsnummer: nr,
      basePages: [...lagenhetsBasSidor],
      folders: [],
    })),
  ];

  return {
    apartments,
    nextApartmentNumber: 1006,
  };
}

export function skapaTomLagenhet(
  id: number,
  lagenhetsnummer: string,
  adress?: string,
): ApartmentFolder {
  return {
    id,
    lagenhetsnummer,
    basePages: [...lagenhetsBasSidor],
    folders: [],
    ...(adress?.trim() ? { adress: adress.trim() } : {}),
  };
}

export const MAX_LAGENHETER_I_REGISTER = 400;

export function skapaLagenhetsarkivMedAntal(
  antal: number,
  opts?: { adress?: string },
): LagenhetsarkivState {
  const n = Math.min(
    MAX_LAGENHETER_I_REGISTER,
    Math.max(0, Math.floor(antal)),
  );
  const apartments: ApartmentFolder[] =
    n > 0
      ? Array.from({ length: n }, (_, i) =>
          skapaTomLagenhet(i + 1, String(1001 + i), opts?.adress),
        )
      : [skapaTomLagenhet(1, "1001", opts?.adress)];
  const sista = Number.parseInt(
    apartments[apartments.length - 1]?.lagenhetsnummer ?? "1001",
    10,
  );
  return {
    apartments,
    nextApartmentNumber: (Number.isFinite(sista) ? sista : 1001) + 1,
  };
}

export function skapaTomtLagenhetsarkiv(): LagenhetsarkivState {
  return skapaLagenhetsarkivMedAntal(1);
}

function normaliseraState(raw: unknown): LagenhetsarkivState | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<LagenhetsarkivState>;
  if (!Array.isArray(data.apartments) || data.apartments.length === 0) return null;
  const nextApartmentNumber =
    typeof data.nextApartmentNumber === "number" && data.nextApartmentNumber > 0
      ? data.nextApartmentNumber
      : 1002;
  return {
    apartments: data.apartments,
    nextApartmentNumber,
  };
}

export function lasLagenhetsarkiv(
  foreningId?: string,
): LagenhetsarkivState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lagenhetsarkivStorageKey(foreningId));
    if (!raw) return null;
    return normaliseraState(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Om v3 saknas men äldre nyckel finns — kopiera till v3 (behåller legacy oförändrad).
 */
export function forsokMigreraLegacyLagenhetsarkiv(): LagenhetsarkivState | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(lagenhetsarkivStorageKey())) return null;

  for (const base of LEGACY_LAGENHETSARKIV_BASES) {
    const legacyKey = foreningStorageKey(base);
    const raw = localStorage.getItem(legacyKey);
    if (!raw) continue;
    try {
      const state = normaliseraState(JSON.parse(raw));
      if (!state) continue;
      sparaLagenhetsarkiv(state);
      return state;
    } catch {
      continue;
    }
  }
  return null;
}

export function sparaLagenhetsarkiv(
  state: LagenhetsarkivState,
  foreningId?: string,
): { ok: true } | { ok: false; error: import("@/lib/localStorage").LocalStorageSetError } {
  if (typeof window === "undefined") {
    return { ok: false, error: "unavailable" };
  }
  const result = safeSetLocalStorage(
    lagenhetsarkivStorageKey(foreningId),
    JSON.stringify(state),
  );
  if (result.ok) {
    window.dispatchEvent(new Event(LAGENHETSARKIV_EVENT));
  }
  return result;
}

/**
 * Skapar saknade tomma lägenheter upp till angivet antal.
 * Tar aldrig bort befintliga lägenheter.
 */
export function synkaLagenhetsarkivTillAntal(
  antal: number,
  opts?: { foreningId?: string; adress?: string },
): LagenhetsarkivState {
  const n = Math.min(
    MAX_LAGENHETER_I_REGISTER,
    Math.max(0, Math.floor(antal)),
  );
  const befintlig = lasLagenhetsarkiv(opts?.foreningId);
  if (!befintlig || befintlig.apartments.length === 0) {
    const skapad = skapaLagenhetsarkivMedAntal(n || 1, { adress: opts?.adress });
    sparaLagenhetsarkiv(skapad, opts?.foreningId);
    return skapad;
  }
  if (n <= befintlig.apartments.length) return befintlig;

  const maxId = Math.max(...befintlig.apartments.map((a) => a.id), 0);
  const maxNr = Math.max(
    ...befintlig.apartments.map((a) => Number.parseInt(a.lagenhetsnummer, 10) || 0),
    1000,
  );
  const saknas = n - befintlig.apartments.length;
  const tillagda = Array.from({ length: saknas }, (_, i) =>
    skapaTomLagenhet(maxId + i + 1, String(maxNr + i + 1), opts?.adress),
  );
  const nastaNr = maxNr + saknas + 1;
  const uppdaterad: LagenhetsarkivState = {
    apartments: [...befintlig.apartments, ...tillagda],
    nextApartmentNumber: Math.max(befintlig.nextApartmentNumber, nastaNr),
  };
  sparaLagenhetsarkiv(uppdaterad, opts?.foreningId);
  return uppdaterad;
}
