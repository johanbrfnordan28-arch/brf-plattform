import {
  underhallAtgardEtikett,
  type UnderhallTillfallenPlanNyckel,
} from "@/components/underhallsplan/underhall-atgard-katalog";
import {
  harUnderhallTillfallenPlan,
  normaliseraUnderhallTillfallenData,
  type UnderhallTillfallenData,
  type UnderhallTillfalle,
} from "@/components/underhallsplan/underhall-tillfallen";
import {
  beraknaFasadAtgardPrisRad,
  type FasadAtgardPrisRegister,
} from "@/components/underhallsplan/fasad-atgard-pris";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import type { UnderhallKostnadPerArRad } from "@/components/underhallsplan/underhall-plan-ar";
import { summeraUnderhallPerAr } from "@/components/underhallsplan/underhall-plan-ar";
import { arDirektkostnadUnderhall } from "@/components/underhallsplan/komponent-avskrivning";
import type { UnderhallAtgard } from "@/components/underhallsplan/underhall-budget";
import { hamtaUnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import { hamtaUnderhallTillfallenData } from "@/components/underhallsplan/underhall-tillfallen-register";

function parseAr(text: string | undefined): number {
  const n = Number.parseInt(text?.trim() ?? "", 10);
  return Number.isFinite(n) ? n : 0;
}

function beraknaTillfalleSummaKr(
  tillfalle: UnderhallTillfalle,
  priser: Record<string, import("@/components/underhallsplan/fasad-atgard-pris").FasadAtgardPrisRad>,
): number {
  return tillfalle.atgarder.reduce((sum, id) => {
    const rad = priser[id];
    if (!rad) return sum;
    return sum + beraknaFasadAtgardPrisRad(rad);
  }, 0);
}

export function expanderaUnderhallTillfallePerAr(
  planNyckel: UnderhallTillfallenPlanNyckel,
  tillfalle: UnderhallTillfalle,
  priser: Record<string, import("@/components/underhallsplan/fasad-atgard-pris").FasadAtgardPrisRad>,
  planStartAr: number,
  planLangdAr: number,
): UnderhallKostnadPerArRad[] {
  const intervall = parseAr(tillfalle.intervallAr);
  if (intervall < 1 || tillfalle.atgarder.length === 0) return [];

  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  let ar = parseAr(tillfalle.nastaAr) || planStartAr;
  if (ar < planStartAr) ar = planStartAr;

  const rader: UnderhallKostnadPerArRad[] = [];
  while (ar <= planSlutAr) {
    const summaKr = beraknaTillfalleSummaKr(tillfalle, priser);
    if (summaKr > 0) rader.push({ ar, summaKr });
    ar += intervall;
  }
  return rader;
}

export function beraknaUnderhallTillfallenKostnadPerAr(
  planNyckel: UnderhallTillfallenPlanNyckel,
  data: UnderhallTillfallenData,
  priser: Record<string, import("@/components/underhallsplan/fasad-atgard-pris").FasadAtgardPrisRad>,
  planStartAr: number,
  planLangdAr: number,
): UnderhallKostnadPerArRad[] {
  const norm = normaliseraUnderhallTillfallenData(planNyckel, data);
  const alla = norm.tillfallen.flatMap((t) =>
    expanderaUnderhallTillfallePerAr(
      planNyckel,
      t,
      priser,
      planStartAr,
      planLangdAr,
    ),
  );
  return summeraUnderhallPerAr(alla);
}

export function samlaUnderhallTillfallenBudgetPoster(
  komponent: string,
  planNyckel: UnderhallTillfallenPlanNyckel,
  data: UnderhallTillfallenData,
  priser: Record<string, import("@/components/underhallsplan/fasad-atgard-pris").FasadAtgardPrisRad>,
  planStartAr: number,
  planLangdAr: number,
  underkomponentId?: string,
): UnderhallAtgard[] {
  const norm = normaliseraUnderhallTillfallenData(planNyckel, data);
  const atgarder: UnderhallAtgard[] = [];
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);

  for (const tillfalle of norm.tillfallen) {
    const intervall = parseAr(tillfalle.intervallAr);
    if (intervall < 1 || tillfalle.atgarder.length === 0) continue;

    let ar = parseAr(tillfalle.nastaAr) || planStartAr;
    if (ar < planStartAr) ar = planStartAr;

    const tillfalleTitel = tillfalle.titel.trim();
    const inkl = (tillfalle.inkluderadeUnderkomponenter ?? []).filter(Boolean);

    while (ar <= planSlutAr) {
      for (const atgardId of tillfalle.atgarder) {
        const prisRad = priser[atgardId];
        if (!prisRad) continue;
        const kostnadKr = beraknaFasadAtgardPrisRad(prisRad);
        if (kostnadKr <= 0) continue;

        let del = tillfalleTitel
          ? `${tillfalleTitel}: ${underhallAtgardEtikett(planNyckel, atgardId)}`
          : underhallAtgardEtikett(planNyckel, atgardId);
        if (inkl.length > 0) {
          del += ` (inkl. ${inkl.join(", ")})`;
        }

        atgarder.push({
          komponent,
          del,
          ar,
          kostnadKr,
          intervallAr: intervall,
          kalla: "register",
          underkomponentId,
          direktkostnad: arDirektkostnadUnderhall(
            komponent,
            underkomponentId,
            atgardId,
          ),
        });
      }
      ar += intervall;
    }
  }

  return atgarder;
}

export function planeratViaUnderhallTillfallen(
  komponentNamn: string,
  underId: string,
  data: KomponentDetaljData | undefined,
): boolean {
  const planNyckel = hamtaUnderhallTillfallenPlanNyckel(komponentNamn, underId);
  if (!planNyckel || !data) return false;
  const tillfallen = hamtaUnderhallTillfallenData(data, underId, planNyckel);
  return harUnderhallTillfallenPlan(tillfallen);
}
