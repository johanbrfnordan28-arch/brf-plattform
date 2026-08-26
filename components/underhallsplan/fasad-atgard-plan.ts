import {
  fasadAtgardEtikett,
  harFasadAtgardPlan,
  normaliseraFasadAtgardData,
  type FasadAtgardData,
  type FasadAtgardTillfalle,
} from "@/components/underhallsplan/fasad-atgard";
import {
  beraknaFasadAtgardPrisRad,
  beraknaFasadAtgardPrisSumma,
  type FasadAtgardPrisRegister,
} from "@/components/underhallsplan/fasad-atgard-pris";
import { arDirektkostnadUnderhall } from "@/components/underhallsplan/komponent-avskrivning";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import {
  forstaAtgardArIPlan,
  type UnderhallKostnadPerArRad,
} from "@/components/underhallsplan/underhall-plan-ar";
import { summeraUnderhallPerAr } from "@/components/underhallsplan/underhall-plan-ar";
import type { UnderhallAtgard } from "@/components/underhallsplan/underhall-budget";

function parseAr(text: string | undefined): number {
  const n = Number.parseInt(text?.trim() ?? "", 10);
  return Number.isFinite(n) ? n : 0;
}

export function beraknaTillfalleSummaKr(
  tillfalle: FasadAtgardTillfalle,
  priser: FasadAtgardPrisRegister,
): number {
  return beraknaFasadAtgardPrisSumma(tillfalle.atgarder, priser);
}

/** Summa kostnad per planerat tillfälle (ett cykelsteg, inte utspritt per år). */
export function summeraFasadTillfallenEngangsKr(
  fasadData: FasadAtgardData,
  priser: FasadAtgardPrisRegister,
): number {
  const data = normaliseraFasadAtgardData(fasadData);
  return data.tillfallen.reduce(
    (sum, t) => sum + beraknaTillfalleSummaKr(t, priser),
    0,
  );
}

/** År → summa för ett tillfälle (alla åtgärder det året adderas). */
export function expanderaTillfallePerAr(
  tillfalle: FasadAtgardTillfalle,
  priser: FasadAtgardPrisRegister,
  planStartAr: number,
  planLangdAr: number,
): UnderhallKostnadPerArRad[] {
  const intervall = parseAr(tillfalle.intervallAr);
  if (intervall < 1 || tillfalle.atgarder.length === 0) return [];

  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  let ar = forstaAtgardArIPlan(
    parseAr(tillfalle.nastaAr) || planStartAr,
    intervall,
    planStartAr,
  );
  const rader: UnderhallKostnadPerArRad[] = [];
  while (ar <= planSlutAr) {
    let summaKr = 0;
    for (const atgardId of tillfalle.atgarder) {
      const prisRad = priser[atgardId];
      if (prisRad) summaKr += beraknaFasadAtgardPrisRad(prisRad);
    }
    if (summaKr > 0) {
      rader.push({ ar, summaKr });
    }
    ar += intervall;
  }
  return rader;
}

export function beraknaFasadKostnadPerAr(
  fasadData: FasadAtgardData,
  priser: FasadAtgardPrisRegister,
  planStartAr: number,
  planLangdAr: number,
): UnderhallKostnadPerArRad[] {
  const data = normaliseraFasadAtgardData(fasadData);
  const alla = data.tillfallen.flatMap((t) =>
    expanderaTillfallePerAr(t, priser, planStartAr, planLangdAr),
  );
  return summeraUnderhallPerAr(alla);
}

export function samlaFasadAtgardBudgetPoster(
  fasadData: FasadAtgardData,
  priser: FasadAtgardPrisRegister,
  planStartAr: number,
  planLangdAr: number,
): UnderhallAtgard[] {
  const data = normaliseraFasadAtgardData(fasadData);
  const atgarder: UnderhallAtgard[] = [];
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);

  for (const tillfalle of data.tillfallen) {
    const intervall = parseAr(tillfalle.intervallAr);
    if (intervall < 1 || tillfalle.atgarder.length === 0) continue;

    let ar = forstaAtgardArIPlan(
      parseAr(tillfalle.nastaAr) || planStartAr,
      intervall,
      planStartAr,
    );

    const tillfalleTitel = tillfalle.titel.trim();

    while (ar <= planSlutAr) {
      for (const atgardId of tillfalle.atgarder) {
        const prisRad = priser[atgardId];
        if (!prisRad) continue;
        const kostnadKr = beraknaFasadAtgardPrisRad(prisRad);
        if (kostnadKr <= 0) continue;

        const del = tillfalleTitel
          ? `${tillfalleTitel}: ${fasadAtgardEtikett(atgardId)}`
          : fasadAtgardEtikett(atgardId);

        atgarder.push({
          komponent: "Fasad",
          del,
          ar,
          kostnadKr,
          intervallAr: intervall,
          kalla: "register",
          underkomponentId: "fasadmaterial",
          direktkostnad: arDirektkostnadUnderhall(
            "Fasad",
            "fasadmaterial",
            atgardId,
          ),
        });
      }
      ar += intervall;
    }
  }

  return atgarder;
}

export function fasadmaterialPlaneratViaTillfallen(
  komponent: string,
  underId: string,
  data: KomponentDetaljData | undefined,
): boolean {
  if (komponent !== "Fasad" || underId !== "fasadmaterial" || !data) return false;
  const fasad = data.fasadAtgardRegister?.[underId];
  return harFasadAtgardPlan(normaliseraFasadAtgardData(fasad));
}
