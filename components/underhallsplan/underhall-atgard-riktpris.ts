import type { UnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import type { VentilationExtraTypId } from "@/components/underhallsplan/ventilation-extra";
import {
  effektivEnhetspris,
  parsePrisKr,
  RIKT_VENTILATION_EXTRA_TYP_KR,
  RIKT_VENTILATION_UNDERKOMPONENT_KR,
  type RiktprisSpec,
} from "@/components/underhallsplan/riktpriser";
import type { FasadAtgardPrisRad } from "@/components/underhallsplan/fasad-atgard-pris";
import { skapaTomFasadAtgardPrisRad } from "@/components/underhallsplan/fasad-atgard-pris";

const RIKT_TAK_ATGARD: Record<string, RiktprisSpec> = {
  takomlaggning: { enhet: "kvm", prisKr: 850 },
  takmalning: { enhet: "kvm", prisKr: 120 },
  "plat-underhall": { enhet: "kvm", prisKr: 45 },
  "tak-kontroll": { enhet: "total", prisKr: 15_000 },
};

const RIKT_FONSTER_ATGARD: Record<string, RiktprisSpec> = {
  "fonster-malning": { enhet: "styck", prisKr: 4_500 },
  "fonster-delrenovering": { enhet: "styck", prisKr: 16_000 },
  "fonster-byte": { enhet: "styck", prisKr: 28_000 },
  "fonster-kontroll": { enhet: "total", prisKr: 12_000 },
};

export function hamtaRiktprisForAtgard(
  planNyckel: UnderhallTillfallenPlanNyckel,
  atgardId: string,
): RiktprisSpec | null {
  if (planNyckel === "tak-takyta") {
    return RIKT_TAK_ATGARD[atgardId] ?? null;
  }
  if (planNyckel === "fonster") {
    return RIKT_FONSTER_ATGARD[atgardId] ?? null;
  }
  return null;
}

export function hamtaRiktprisForUnderkomponent(
  komponentNamn: string,
  underkomponentId: string,
): RiktprisSpec | null {
  if (komponentNamn === "Ventilation") {
    return RIKT_VENTILATION_UNDERKOMPONENT_KR[underkomponentId] ?? null;
  }
  if (komponentNamn === "Tak") {
    if (underkomponentId === "ventilationshuv") {
      return { enhet: "styck", prisKr: 18_000 };
    }
    if (underkomponentId === "skorsten") {
      return { enhet: "styck", prisKr: 35_000 };
    }
    if (underkomponentId === "takkupa") {
      return { enhet: "styck", prisKr: 85_000 };
    }
  }
  return null;
}

export function hamtaRiktprisVentilationExtraTyp(
  typ: VentilationExtraTypId,
): number {
  return RIKT_VENTILATION_EXTRA_TYP_KR[typ] ?? RIKT_VENTILATION_EXTRA_TYP_KR.annat;
}

export function skapaAtgardPrisRadMedRikt(
  planNyckel: UnderhallTillfallenPlanNyckel,
  atgardId: string,
  defaultKvm?: string,
  defaultAntal?: string,
): FasadAtgardPrisRad {
  const rikt = hamtaRiktprisForAtgard(planNyckel, atgardId);
  const tom = skapaTomFasadAtgardPrisRad(defaultKvm);
  if (!rikt) return tom;

  if (rikt.enhet === "total") {
    return {
      ...tom,
      prisEnhet: "total",
      totalKr: String(rikt.prisKr),
      enhetsprisKr: String(rikt.prisKr),
    };
  }
  if (rikt.enhet === "styck") {
    return {
      ...tom,
      prisEnhet: "styck",
      enhetsprisKr: String(rikt.prisKr),
      mangdStyck: defaultAntal?.trim() || "1",
      mangd: defaultAntal?.trim() || "1",
    };
  }
  return {
    ...tom,
    prisEnhet: "kvm",
    enhetsprisKr: String(rikt.prisKr),
    mangd: defaultKvm?.trim() ?? "",
  };
}

export function normaliseraAtgardPrisRegisterMedRikt(
  planNyckel: UnderhallTillfallenPlanNyckel,
  raw: Record<string, FasadAtgardPrisRad> | undefined,
  valdaAtgarder: string[],
  defaultKvm?: string,
  defaultAntal?: string,
): Record<string, FasadAtgardPrisRad> {
  const out: Record<string, FasadAtgardPrisRad> = { ...(raw ?? {}) };
  for (const id of valdaAtgarder) {
    const befintlig = out[id];
    const harPris =
      befintlig &&
      (parsePrisKr(befintlig.enhetsprisKr) > 0 ||
        parsePrisKr(befintlig.totalKr) > 0);
    if (!harPris) {
      out[id] = skapaAtgardPrisRadMedRikt(
        planNyckel,
        id,
        defaultKvm,
        defaultAntal,
      );
    } else if (befintlig && defaultKvm?.trim() && !befintlig.mangd?.trim()) {
      out[id] = { ...befintlig, mangd: defaultKvm.trim() };
    }
  }
  return out;
}

export function effektivRiktEnhetspris(
  anvandarVarde: string | undefined,
  rikt: RiktprisSpec | null,
): number {
  if (!rikt) return parsePrisKr(anvandarVarde);
  return effektivEnhetspris(anvandarVarde, rikt.prisKr);
}
