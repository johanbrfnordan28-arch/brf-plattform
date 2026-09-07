import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const LAGER_NYCKEL = "brf-projektutvardering";

export type ProjektutvarderingEkonomi = {
  vattenKrPerAr: number;
  elKrPerAr: number;
  varmeKrPerAr: number;
  forsakringPremieKrPerAr: number;
  forsakringsskadorKrPerAr: number;
  underhallDriftKrPerAr: number;
};

export type ProjektutvarderingState = {
  projektNamn: string;
  slutbesiktningDatum: string;
  baslinjeAr: number;
  fore: ProjektutvarderingEkonomi;
  efter: ProjektutvarderingEkonomi;
  investeringskostnadKr: number;
  tillaggsarbetenKr: number;
  avskrivningAr: number;
  uppskattadForseningAr: number;
  uppskattadForseningskostnadKr: number;
  egenRiskOchLuckorKr: number;
  likvidaMedelFinns: boolean;
  avsattningArFore: number;
  sakerhetsanteckningar: string;
  forsakringsrisker: string;
  checklista: Record<string, boolean>;
};

export function tomProjektutvardering(): ProjektutvarderingState {
  const noll: ProjektutvarderingEkonomi = {
    vattenKrPerAr: 0,
    elKrPerAr: 0,
    varmeKrPerAr: 0,
    forsakringPremieKrPerAr: 0,
    forsakringsskadorKrPerAr: 0,
    underhallDriftKrPerAr: 0,
  };
  return {
    projektNamn: "",
    slutbesiktningDatum: "",
    baslinjeAr: 3,
    fore: { ...noll },
    efter: { ...noll },
    investeringskostnadKr: 0,
    tillaggsarbetenKr: 0,
    avskrivningAr: 20,
    uppskattadForseningAr: 3,
    uppskattadForseningskostnadKr: 0,
    egenRiskOchLuckorKr: 0,
    likvidaMedelFinns: true,
    avsattningArFore: 2,
    sakerhetsanteckningar: "",
    forsakringsrisker: "",
    checklista: {},
  };
}

function storageKey(): string {
  return foreningStorageKey(LAGER_NYCKEL);
}

function normaliseraEkonomi(raw: unknown): ProjektutvarderingEkonomi {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    vattenKrPerAr: Number(d.vattenKrPerAr) || 0,
    elKrPerAr: Number(d.elKrPerAr) || 0,
    varmeKrPerAr: Number(d.varmeKrPerAr) || 0,
    forsakringPremieKrPerAr: Number(d.forsakringPremieKrPerAr) || 0,
    forsakringsskadorKrPerAr: Number(d.forsakringsskadorKrPerAr) || 0,
    underhallDriftKrPerAr: Number(d.underhallDriftKrPerAr) || 0,
  };
}

export function normaliseraProjektutvardering(raw: unknown): ProjektutvarderingState {
  const tom = tomProjektutvardering();
  if (!raw || typeof raw !== "object") return tom;
  const d = raw as Partial<ProjektutvarderingState>;
  return {
    projektNamn: String(d.projektNamn ?? ""),
    slutbesiktningDatum: String(d.slutbesiktningDatum ?? ""),
    baslinjeAr: Math.min(5, Math.max(2, Number(d.baslinjeAr) || 3)),
    fore: normaliseraEkonomi(d.fore),
    efter: normaliseraEkonomi(d.efter),
    investeringskostnadKr: Number(d.investeringskostnadKr) || 0,
    tillaggsarbetenKr: Number(d.tillaggsarbetenKr) || 0,
    avskrivningAr: Math.max(1, Number(d.avskrivningAr) || 20),
    uppskattadForseningAr: Math.max(0, Number(d.uppskattadForseningAr) || 0),
    uppskattadForseningskostnadKr: Number(d.uppskattadForseningskostnadKr) || 0,
    egenRiskOchLuckorKr: Number(d.egenRiskOchLuckorKr) || 0,
    likvidaMedelFinns: d.likvidaMedelFinns !== false,
    avsattningArFore: Math.max(0, Number(d.avsattningArFore) || 2),
    sakerhetsanteckningar: String(d.sakerhetsanteckningar ?? ""),
    forsakringsrisker: String(d.forsakringsrisker ?? ""),
    checklista:
      d.checklista && typeof d.checklista === "object"
        ? Object.fromEntries(
            Object.entries(d.checklista).map(([k, v]) => [k, Boolean(v)]),
          )
        : {},
  };
}

export function lasProjektutvardering(): ProjektutvarderingState {
  if (typeof window === "undefined") return tomProjektutvardering();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return tomProjektutvardering();
    return normaliseraProjektutvardering(JSON.parse(raw));
  } catch {
    return tomProjektutvardering();
  }
}

export function sparaProjektutvardering(state: ProjektutvarderingState): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(storageKey(), JSON.stringify(state)).ok;
}

export function summaEkonomi(e: ProjektutvarderingEkonomi): number {
  return (
    e.vattenKrPerAr +
    e.elKrPerAr +
    e.varmeKrPerAr +
    e.forsakringPremieKrPerAr +
    e.forsakringsskadorKrPerAr +
    e.underhallDriftKrPerAr
  );
}

export type ProjektutvarderingResultat = {
  foreTotaltKr: number;
  efterTotaltKr: number;
  arligBesparingKr: number;
  nettoInvesteringKr: number;
  paybackAr: number | null;
  kassaPlusKr: number;
  kassaPlusAr: number;
  ansvarstidSlutAr: number | null;
};

export function beraknaProjektutvardering(
  state: ProjektutvarderingState,
): ProjektutvarderingResultat {
  const foreTotaltKr = summaEkonomi(state.fore);
  const efterTotaltKr = summaEkonomi(state.efter);
  const arligBesparingKr = foreTotaltKr - efterTotaltKr;
  const nettoInvesteringKr =
    state.investeringskostnadKr + state.tillaggsarbetenKr;

  const paybackAr =
    arligBesparingKr > 0 && nettoInvesteringKr > 0
      ? nettoInvesteringKr / arligBesparingKr
      : null;

  const kassaPlusAr =
    paybackAr !== null && state.avskrivningAr > paybackAr
      ? state.avskrivningAr - paybackAr
      : 0;

  const kassaPlusKr =
    paybackAr !== null && kassaPlusAr > 0
      ? arligBesparingKr * kassaPlusAr
      : 0;

  let ansvarstidSlutAr: number | null = null;
  if (state.slutbesiktningDatum) {
    const ar = Number(state.slutbesiktningDatum.slice(0, 4));
    if (!Number.isNaN(ar) && ar > 1900) ansvarstidSlutAr = ar + 10;
  }

  return {
    foreTotaltKr,
    efterTotaltKr,
    arligBesparingKr,
    nettoInvesteringKr,
    paybackAr,
    kassaPlusKr,
    kassaPlusAr,
    ansvarstidSlutAr,
  };
}

export function formatKr(value: number): string {
  return `${Math.round(value).toLocaleString("sv-SE")} kr`;
}

export function formatAr(value: number, decimaler = 1): string {
  return value.toLocaleString("sv-SE", {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  });
}
