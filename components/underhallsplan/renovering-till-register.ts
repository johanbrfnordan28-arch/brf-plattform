import {
  hamtaKomponentMall,
  type KomponentDetaljData,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import { fordelRenovering } from "@/components/underhallsplan/renovering-fordelning";
import {
  hamtaIntervallForTyp,
  type RenoveringAtgardTyp,
} from "@/components/underhallsplan/renovering-klassificering";
import { synkaTillfallenFranHistorikPaRegister } from "@/components/underhallsplan/underhall-tillfallen-register";
import { hamtaUnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import { harUnderhallTillfallenPlan } from "@/components/underhallsplan/underhall-tillfallen";
import { hamtaUnderhallTillfallenData } from "@/components/underhallsplan/underhall-tillfallen-register";
import {
  beraknaPlaneradKostnad,
  hamtaNastaPlanArForDel,
} from "@/components/underhallsplan/renovering-planering";
import {
  hamtaHuvudUnderkomponentIdForRenovering,
  sammanstallInkluderadeUnderkomponenter,
} from "@/components/underhallsplan/renovering-inkludering";
import {
  normaliseraRenoveringKomponent,
  type UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";

const TYP_TILL_UNDERKOMPONENT: Partial<
  Record<RenoveringAtgardTyp, string>
> = {
  stambyte: "stambyte",
  stamspolning: "spolning-avlopp",
  tak: "takyta",
  fonster: "fonster",
  fasad: "puts",
  balkonger: "balkonger",
  hiss: "hiss",
  tvattstuga: "tvattstuga",
  ventilation: "ventilation",
  trapphus: "vaggar-malning",
};

function hittaUnderkomponentId(
  komponent: string,
  delEtikett: string,
  atgardTyp: RenoveringAtgardTyp,
  underkomponentId?: string,
): string | null {
  const mall = hamtaKomponentMall(komponent);
  if (!mall) return null;

  if (underkomponentId) {
    const exakt = mall.underkomponenter.find((u) => u.id === underkomponentId);
    if (exakt) return underkomponentId;
  }

  const delNorm = delEtikett.toLowerCase().trim();
  for (const u of mall.underkomponenter) {
    const etikett = u.etikett.toLowerCase();
    if (etikett === delNorm || delNorm.includes(etikett) || etikett.includes(delNorm)) {
      return u.id;
    }
  }

  const fallback = TYP_TILL_UNDERKOMPONENT[atgardTyp];
  if (fallback && mall.underkomponenter.some((u) => u.id === fallback)) {
    return fallback;
  }

  return null;
}

function oppnaAllaUnderkomponenter(data: KomponentDetaljData): KomponentDetaljData {
  return {
    ...data,
    underkomponenter: data.underkomponenter.map((r) => ({ ...r, aktiv: true })),
  };
}

function uppdateraInkluderadUnderkomponentRad(
  rad: UnderkomponentRad,
  renovering: UtfördRenovering,
): UnderkomponentRad {
  return {
    ...rad,
    aktiv: true,
    underhallUtförtAr: String(renovering.ar),
    underhallEntreprenor:
      renovering.entreprenor?.trim() || rad.underhallEntreprenor || "",
    underhallBesiktning:
      renovering.underhallBesiktning ?? rad.underhallBesiktning ?? "",
    underhallGarantiAr:
      renovering.garantiAr != null
        ? String(renovering.garantiAr)
        : rad.underhallGarantiAr?.trim() || "2",
    underhallAnsvarAr:
      renovering.ansvarAr != null
        ? String(renovering.ansvarAr)
        : rad.underhallAnsvarAr?.trim() || "10",
    underhallNastaAr: "",
    underhallIntervallAr: "",
    underhallKostnadKr: "",
    underhallFranHistorik: true,
    underhallHistorikAr: renovering.ar,
    underhallHistorikTitel: renovering.titel,
  };
}

function uppdateraUnderkomponentRad(
  rad: UnderkomponentRad,
  patch: {
    nastaAr: number;
    intervallAr: number;
    kostnadKr: number;
    utförtAr: number;
    titel: string;
    entreprenor?: string;
    underhallBesiktning?: UnderkomponentRad["underhallBesiktning"];
    garantiAr?: number;
    ansvarAr?: number;
  },
): UnderkomponentRad {
  return {
    ...rad,
    aktiv: true,
    underhallUtförtAr: String(patch.utförtAr),
    underhallEntreprenor:
      patch.entreprenor?.trim() || rad.underhallEntreprenor || "",
    underhallBesiktning:
      patch.underhallBesiktning ?? rad.underhallBesiktning ?? "",
    underhallGarantiAr: patch.garantiAr != null
      ? String(patch.garantiAr)
      : rad.underhallGarantiAr?.trim() || "2",
    underhallAnsvarAr: patch.ansvarAr != null
      ? String(patch.ansvarAr)
      : rad.underhallAnsvarAr?.trim() || "10",
    underhallNastaAr: String(patch.nastaAr),
    underhallIntervallAr: String(patch.intervallAr),
    underhallKostnadKr: String(Math.round(patch.kostnadKr)),
    underhallFranHistorik: true,
    underhallHistorikAr: patch.utförtAr,
    underhallHistorikTitel: patch.titel,
  };
}

/** Alla underkomponenter öppna; poster från historik får nästa år och indexuppräknad kostnad. */
export function appliceraRenoveringarPaKomponentregister(
  renoveringar: UtfördRenovering[],
  register: Record<string, KomponentDetaljData>,
  planStartAr: number,
  planKostnader?: PlanKostnaderNormaliserade,
): Record<string, KomponentDetaljData> {
  const next: Record<string, KomponentDetaljData> = {};

  for (const [namn, data] of Object.entries(register)) {
    next[namn] = oppnaAllaUnderkomponenter(data);
  }

  for (const renovering of renoveringar) {
    const utdelning = fordelRenovering(renovering, { komponentDetaljer: next });

    for (const del of utdelning) {
      if (del.basKostnadKr <= 0) continue;

      const komponent = del.komponent;
      const data = next[komponent];
      if (!data) continue;

      const underId =
        renovering.underkomponentId &&
        data.underkomponenter.some((r) => r.id === renovering.underkomponentId)
          ? renovering.underkomponentId
          : hittaUnderkomponentId(
              komponent,
              del.del,
              del.atgardTyp,
              del.underkomponentId,
            );
      if (!underId) continue;

      const intervallAr = hamtaIntervallForTyp(komponent, del.atgardTyp);
      const nastaAr = hamtaNastaPlanArForDel(del, renovering, planStartAr);
      const beraknat = beraknaPlaneradKostnad(
        del.basKostnadKr,
        del.utförtAr,
        nastaAr,
        del.atgardTyp,
        planKostnader,
      );

      let komponentData = {
        ...data,
        underkomponenter: data.underkomponenter.map((rad) =>
          rad.id === underId
            ? uppdateraUnderkomponentRad(rad, {
                nastaAr,
                intervallAr,
                kostnadKr: beraknat.kostnadKr,
                utförtAr: del.utförtAr,
                titel: renovering.titel,
                entreprenor: renovering.entreprenor,
                underhallBesiktning: renovering.underhallBesiktning,
                garantiAr: renovering.garantiAr,
                ansvarAr: renovering.ansvarAr,
              })
            : rad,
        ),
      };

      const huvudUk = hamtaHuvudUnderkomponentIdForRenovering(
        renovering.komponent,
        renovering.underkomponentId,
      );
      const inkluderadeUk =
        huvudUk && underId === huvudUk
          ? sammanstallInkluderadeUnderkomponenter(renovering, huvudUk)
          : [];

      komponentData = synkaTillfallenFranHistorikPaRegister(
        komponentData,
        komponent,
        underId,
        {
          utförtAr: del.utförtAr,
          titel: renovering.titel,
          nastaStorAr: nastaAr,
          storIntervallAr: intervallAr,
          storKostnadKr: beraknat.kostnadKr,
          override: renovering.kommandeAtgardOverrides?.[del.renoveringId],
          planStartAr,
          inkluderadeUnderkomponenter: inkluderadeUk,
        },
      );

      if (inkluderadeUk.length > 0) {
        komponentData = {
          ...komponentData,
          underkomponenter: komponentData.underkomponenter.map((rad) =>
            inkluderadeUk.includes(rad.id)
              ? uppdateraInkluderadUnderkomponentRad(rad, renovering)
              : rad,
          ),
        };
      }

      const planNyckel = hamtaUnderhallTillfallenPlanNyckel(komponent, underId);
      if (
        planNyckel &&
        harUnderhallTillfallenPlan(
          hamtaUnderhallTillfallenData(komponentData, underId, planNyckel),
        )
      ) {
        komponentData = {
          ...komponentData,
          underkomponenter: komponentData.underkomponenter.map((rad) =>
            rad.id === underId
              ? {
                  ...rad,
                  underhallNastaAr: "",
                  underhallIntervallAr: "",
                  underhallKostnadKr: "",
                }
              : rad,
          ),
        };
      }

      next[komponent] = komponentData;
    }
  }

  return next;
}

export function komponenterFranRenoveringar(
  renoveringar: UtfördRenovering[],
): string[] {
  const set = new Set<string>();
  for (const r of renoveringar) {
    set.add(normaliseraRenoveringKomponent(r.komponent));
  }
  return [...set];
}
