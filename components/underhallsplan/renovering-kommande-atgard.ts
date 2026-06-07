import {
  hamtaUnderhallAtgardKatalog,
  hamtaUnderhallTillfallenPlanNyckel,
  type UnderhallAtgardKatalogPost,
} from "@/components/underhallsplan/underhall-atgard-katalog";
import type { KommandeAtgardOverride } from "@/components/underhallsplan/renoveringar";
import {
  beraknaPlaneradKostnad,
  type PlaneradAtgardPreview,
} from "@/components/underhallsplan/renovering-planering";
import type { RenoveringAtgardTyp } from "@/components/underhallsplan/renovering-klassificering";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import type { UnderhallTillfallenData } from "@/components/underhallsplan/underhall-tillfallen";
import type {
  FasadAtgardPrisRad,
  FasadAtgardPrisRegister,
} from "@/components/underhallsplan/fasad-atgard-pris";
import { skapaTomFasadAtgardPrisRad } from "@/components/underhallsplan/fasad-atgard-pris";

export type { KommandeAtgardOverride };

const forvaldAvvikande: Partial<
  Record<
    RenoveringAtgardTyp,
    { atgardId: string; intervallAr: number; kostnadAndel: number; offsetAr: number }
  >
> = {
  fonster: {
    atgardId: "fonster-malning",
    intervallAr: 12,
    kostnadAndel: 0.18,
    offsetAr: 12,
  },
  tak: {
    atgardId: "takmalning",
    intervallAr: 10,
    kostnadAndel: 0.15,
    offsetAr: 10,
  },
  fasad: {
    atgardId: "typ-fasad-lopande",
    intervallAr: 10,
    kostnadAndel: 0.2,
    offsetAr: 10,
  },
  balkonger: {
    atgardId: "typ-balkonger-lopande",
    intervallAr: 8,
    kostnadAndel: 0.2,
    offsetAr: 8,
  },
  trapphus: {
    atgardId: "typ-trapphus-lopande",
    intervallAr: 8,
    kostnadAndel: 0.15,
    offsetAr: 8,
  },
  stambyte: {
    atgardId: "typ-stambyte-lopande",
    intervallAr: 5,
    kostnadAndel: 0.1,
    offsetAr: 5,
  },
};

const forvaldStorAtgard: Partial<Record<RenoveringAtgardTyp, string>> = {
  fonster: "fonster-byte",
  tak: "takomlaggning",
  fasad: "typ-fasad-stor",
  balkonger: "typ-balkonger-stor",
  trapphus: "typ-trapphus-stor",
  stambyte: "typ-stambyte-stor",
};

export function planNyckelTillAtgardTyp(planNyckel: string): RenoveringAtgardTyp {
  if (planNyckel === "fonster") return "fonster";
  if (planNyckel === "tak-takyta") return "tak";
  if (planNyckel.startsWith("typ-")) {
    return planNyckel.replace("typ-", "") as RenoveringAtgardTyp;
  }
  return "ovrigt";
}

export function hamtaForvaldAvvikandeAtgard(
  typ: RenoveringAtgardTyp,
  katalog: UnderhallAtgardKatalogPost[],
): UnderhallAtgardKatalogPost | undefined {
  const id = forvaldAvvikande[typ]?.atgardId;
  if (id) return katalog.find((a) => a.id === id);
  return katalog.find(
    (a) => a.id.includes("lopande") || a.id.includes("malning") || a.id.includes("tatning"),
  );
}

export function hamtaForvaldStorAtgardId(
  typ: RenoveringAtgardTyp,
  katalog: UnderhallAtgardKatalogPost[],
): string | undefined {
  const id = forvaldStorAtgard[typ];
  if (id && katalog.some((a) => a.id === id)) return id;
  return katalog.find(
    (a) =>
      a.id.includes("stor") ||
      a.id.includes("byte") ||
      a.id.includes("oml") ||
      a.id.includes("renovering"),
  )?.id;
}

export function beraknaKommandeKostnad(
  preview: PlaneradAtgardPreview,
  override: KommandeAtgardOverride | undefined,
  planKostnader?: PlanKostnaderNormaliserade,
): number {
  const typ = preview.atgardTyp;
  const planAr =
    override?.nastaAr ??
    (override?.läge === "avvikande" && forvaldAvvikande[typ]
      ? preview.utförtAr + forvaldAvvikande[typ]!.offsetAr
      : preview.nastaAr);

  const bas = beraknaPlaneradKostnad(
    preview.basKostnadKr,
    preview.utförtAr,
    planAr,
    typ,
    planKostnader,
  );

  if (override?.kostnadKr != null && override.kostnadKr > 0) {
    return Math.round(override.kostnadKr);
  }

  if (override?.läge === "avvikande") {
    const andel =
      override.kostnadAndel ??
      forvaldAvvikande[typ]?.kostnadAndel ??
      0.2;
    return Math.round(bas.kostnadKr * andel);
  }

  return bas.kostnadKr;
}

function sattTotalPris(
  priser: FasadAtgardPrisRegister,
  atgardId: string,
  kostnadKr: number,
) {
  (priser as Record<string, FasadAtgardPrisRad>)[atgardId] = {
    ...skapaTomFasadAtgardPrisRad(),
    prisEnhet: "total",
    totalKr: String(Math.round(kostnadKr)),
    enhetsprisKr: String(Math.round(kostnadKr)),
  };
}

export function byggTillfallenFranHistorik(args: {
  komponentNamn: string;
  underkomponentId: string;
  utförtAr: number;
  titel: string;
  nastaStorAr: number;
  storIntervallAr: number;
  storKostnadKr: number;
  override?: KommandeAtgardOverride;
  planStartAr: number;
  inkluderaAvvikande?: boolean;
  inkluderadeUnderkomponenter?: string[];
}): { tillfallen: UnderhallTillfallenData; priser: FasadAtgardPrisRegister } | null {
  const planNyckel = hamtaUnderhallTillfallenPlanNyckel(
    args.komponentNamn,
    args.underkomponentId,
  );
  if (!planNyckel) return null;

  const katalog = hamtaUnderhallAtgardKatalog(planNyckel);
  const previewTyp = planNyckelTillAtgardTyp(planNyckel);
  const priser: FasadAtgardPrisRegister = {};
  const tillfallen: UnderhallTillfallenData["tillfallen"] = [];

  const skaHaAvvikande =
    args.override?.läge === "avvikande" ||
    (args.inkluderaAvvikande !== false && args.override?.läge !== "standard");

  if (skaHaAvvikande) {
    const avvikandeId =
      args.override?.atgardId ??
      hamtaForvaldAvvikandeAtgard(previewTyp, katalog)?.id;
    if (avvikandeId) {
      const intervall =
        args.override?.intervallAr ??
        forvaldAvvikande[previewTyp]?.intervallAr ??
        10;
      const nasta =
        args.override?.nastaAr ??
        Math.max(
          args.planStartAr,
          args.utförtAr + (forvaldAvvikande[previewTyp]?.offsetAr ?? 10),
        );
      const andel =
        args.override?.kostnadAndel ??
        forvaldAvvikande[previewTyp]?.kostnadAndel ??
        0.2;
      const kostnad =
        args.override?.kostnadKr ?? Math.round(args.storKostnadKr * andel);
      tillfallen.push({
        id: "historik-avvikande",
        titel:
          katalog.find((a) => a.id === avvikandeId)?.etikett ?? "Avvikande åtgärd",
        nastaAr: String(nasta),
        intervallAr: String(intervall),
        atgarder: [avvikandeId],
      });
      sattTotalPris(priser, avvikandeId, kostnad);
    }
  }

  const inkluderade = (args.inkluderadeUnderkomponenter ?? []).filter(Boolean);

  const storId = hamtaForvaldStorAtgardId(previewTyp, katalog);
  if (storId) {
    tillfallen.push({
      id: "historik-stor",
      titel: args.titel.trim() || "Större åtgärd",
      nastaAr: String(args.nastaStorAr),
      intervallAr: String(args.storIntervallAr),
      atgarder: [storId],
      inkluderadeUnderkomponenter: inkluderade,
    });
    sattTotalPris(priser, storId, args.storKostnadKr);
  }

  if (tillfallen.length === 0) return null;
  return { tillfallen: { tillfallen }, priser };
}

export function tomKommandeAtgardOverride(
  preview: PlaneradAtgardPreview,
  underkomponentId?: string,
): KommandeAtgardOverride {
  const planNyckel =
    hamtaUnderhallTillfallenPlanNyckel(
      preview.komponent,
      underkomponentId ?? preview.atgardTyp,
    ) ?? "typ-ovrigt";
  const katalog = hamtaUnderhallAtgardKatalog(planNyckel);
  const avvikande = hamtaForvaldAvvikandeAtgard(preview.atgardTyp, katalog);
  const def = forvaldAvvikande[preview.atgardTyp];
  return {
    läge: "avvikande",
    atgardId: avvikande?.id,
    intervallAr: def?.intervallAr ?? 10,
    nastaAr: preview.utförtAr + (def?.offsetAr ?? 10),
    kostnadAndel: def?.kostnadAndel ?? 0.2,
  };
}
