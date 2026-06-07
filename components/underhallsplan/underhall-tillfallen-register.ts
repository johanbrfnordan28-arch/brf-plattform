import { hamtaUnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import { byggTillfallenFranHistorik } from "@/components/underhallsplan/renovering-kommande-atgard";
import type { KommandeAtgardOverride } from "@/components/underhallsplan/renoveringar";
import { harUnderhallTillfallenPlan } from "@/components/underhallsplan/underhall-tillfallen";
import {
  normaliseraUnderhallTillfallenData,
  type TillfallenKoppling,
  type UnderhallTillfallenData,
} from "@/components/underhallsplan/underhall-tillfallen";
import {
  normaliseraFasadAtgardPrisRegister,
  type FasadAtgardPrisRegisterMap,
} from "@/components/underhallsplan/fasad-atgard-pris";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import type { KomponentDetaljData, KomponentMall } from "@/components/underhallsplan/komponentregister";
import { underhallAtgardEtikett } from "@/components/underhallsplan/underhall-atgard-katalog";

export type UnderhallTillfallenRegister = Record<string, UnderhallTillfallenData>;

export { hamtaUnderhallTillfallenPlanNyckel };

export function hamtaUnderhallTillfallenData(
  data: KomponentDetaljData,
  underId: string,
  planNyckel: string,
): UnderhallTillfallenData {
  return normaliseraUnderhallTillfallenData(
    planNyckel,
    data.underhallTillfallenRegister?.[underId],
  );
}

export function uppdateraUnderhallTillfallenData(
  data: KomponentDetaljData,
  underId: string,
  tillfallen: UnderhallTillfallenData,
  planNyckel: string,
): KomponentDetaljData {
  return {
    ...data,
    underhallTillfallenRegister: {
      ...data.underhallTillfallenRegister,
      [underId]: normaliseraUnderhallTillfallenData(planNyckel, tillfallen),
    },
  };
}

export function hamtaUnderhallTillfallenPriser(
  data: KomponentDetaljData,
  underId: string,
  defaultKvm?: string,
): FasadAtgardPrisRegister {
  return normaliseraFasadAtgardPrisRegister(
    data.underhallTillfallenPrisRegister?.[underId],
    defaultKvm,
  );
}

export function uppdateraUnderhallTillfallenPriser(
  data: KomponentDetaljData,
  underId: string,
  priser: FasadAtgardPrisRegister,
): KomponentDetaljData {
  return {
    ...data,
    underhallTillfallenPrisRegister: {
      ...data.underhallTillfallenPrisRegister,
      [underId]: priser,
    },
  };
}

export function hamtaTillfallenKopplingForUnderkomponent(
  data: KomponentDetaljData,
  mall: KomponentMall,
  underkomponentId: string,
): TillfallenKoppling | null {
  const register = data.underhallTillfallenRegister;
  if (!register) return null;

  for (const [huvudId, raw] of Object.entries(register)) {
    const planNyckel = hamtaUnderhallTillfallenPlanNyckel(mall.namn, huvudId);
    if (!planNyckel) continue;
    const norm = normaliseraUnderhallTillfallenData(planNyckel, raw);
    for (const t of norm.tillfallen) {
      if (!(t.inkluderadeUnderkomponenter ?? []).includes(underkomponentId)) {
        continue;
      }
      const huvudDef = mall.underkomponenter.find((d) => d.id === huvudId);
      return {
        huvudUnderkomponentId: huvudId,
        huvudEtikett: huvudDef?.etikett ?? huvudId,
        tillfalleTitel: t.titel.trim() || "Planerat tillfälle",
        nastaAr: t.nastaAr,
        atgardEtiketter: t.atgarder.map((id) =>
          underhallAtgardEtikett(planNyckel, id),
        ),
      };
    }
  }
  return null;
}

export function skapaForslagTakTillfallen(
  utförtAr: number,
  planStartAr: number,
): UnderhallTillfallenData {
  const omlaggningAr = utförtAr + 25;
  const malningAr = Math.max(planStartAr, utförtAr + 10);
  return {
    tillfallen: [
      {
        id: "forslag-malning",
        titel: "Takmålning / ytaunderhåll",
        nastaAr: String(malningAr),
        intervallAr: "10",
        atgarder: ["takmalning"],
        inkluderadeUnderkomponenter: [],
      },
      {
        id: "forslag-omlaggning",
        titel: "Takomläggning",
        nastaAr: String(omlaggningAr),
        intervallAr: "25",
        atgarder: ["takomlaggning", "plat-underhall"],
        inkluderadeUnderkomponenter: ["skorsten"],
      },
    ],
  };
}

export function synkaTillfallenFranHistorikPaRegister(
  data: KomponentDetaljData,
  komponentNamn: string,
  underId: string,
  args: {
    utförtAr: number;
    titel: string;
    nastaStorAr: number;
    storIntervallAr: number;
    storKostnadKr: number;
    override?: KommandeAtgardOverride;
    planStartAr: number;
    inkluderadeUnderkomponenter?: string[];
  },
): KomponentDetaljData {
  const planNyckel = hamtaUnderhallTillfallenPlanNyckel(komponentNamn, underId);
  if (!planNyckel) return data;

  const befintlig = hamtaUnderhallTillfallenData(data, underId, planNyckel);
  if (harUnderhallTillfallenPlan(befintlig)) return data;

  const built = byggTillfallenFranHistorik({
    komponentNamn,
    underkomponentId: underId,
    utförtAr: args.utförtAr,
    titel: args.titel,
    nastaStorAr: args.nastaStorAr,
    storIntervallAr: args.storIntervallAr,
    storKostnadKr: args.storKostnadKr,
    override: args.override,
    planStartAr: args.planStartAr,
    inkluderaAvvikande: args.override?.läge === "avvikande",
    inkluderadeUnderkomponenter: args.inkluderadeUnderkomponenter,
  });
  if (!built) return data;

  return uppdateraUnderhallTillfallenPriser(
    uppdateraUnderhallTillfallenData(data, underId, built.tillfallen, planNyckel),
    underId,
    built.priser,
  );
}

export function skapaForslagFonsterTillfallen(
  utförtAr: number,
  planStartAr: number,
): UnderhallTillfallenData {
  const byteAr = utförtAr + 40;
  const malningAr = Math.max(planStartAr, utförtAr + 12);
  return {
    tillfallen: [
      {
        id: "forslag-fonster-malning",
        titel: "Målning fönster",
        nastaAr: String(malningAr),
        intervallAr: "12",
        atgarder: ["fonster-malning"],
        inkluderadeUnderkomponenter: [],
      },
      {
        id: "forslag-fonster-byte",
        titel: "Fönsterbyte",
        nastaAr: String(byteAr),
        intervallAr: "40",
        atgarder: ["fonster-byte"],
        inkluderadeUnderkomponenter: [],
      },
    ],
  };
}
