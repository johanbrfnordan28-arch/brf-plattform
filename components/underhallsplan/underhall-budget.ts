import { formatKr } from "@/components/underhallsplan/besiktningar";
import { arUnderhallFlyttad } from "@/components/underhallsplan/kommande-projekt";
import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { normaliseraFasadAtgardData } from "@/components/underhallsplan/fasad-atgard";
import { hamtaFasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import {
  fasadmaterialPlaneratViaTillfallen,
  samlaFasadAtgardBudgetPoster,
} from "@/components/underhallsplan/fasad-atgard-plan";
import { hamtaUnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import {
  planeratViaUnderhallTillfallen,
  samlaUnderhallTillfallenBudgetPoster,
} from "@/components/underhallsplan/underhall-tillfallen-plan";
import {
  hamtaUnderhallTillfallenData,
  hamtaUnderhallTillfallenPriser,
} from "@/components/underhallsplan/underhall-tillfallen-register";
import { arDirektkostnadUnderhall } from "@/components/underhallsplan/komponent-avskrivning";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import type { RenoveringFordelningKontext } from "@/components/underhallsplan/renovering-fordelning";
import {
  genereraAtgarderFranHistorik,
  historikTackerAtgardTyp,
  type RenoveringAtgardTyp,
} from "@/components/underhallsplan/renovering-planering";
import { RENOVERING_ATGARD_TILL_UNDERKOMPONENT } from "@/components/underhallsplan/underhall-atgard-katalog";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";

export type UnderhallAtgardKalla = "register" | "historik";

export type UnderhallAtgard = {
  komponent: string;
  del: string;
  ar: number;
  kostnadKr: number;
  intervallAr: number;
  kalla?: UnderhallAtgardKalla;
  kallaRenoveringId?: string;
  kallaRenoveringAr?: number;
  kallaRenoveringTitel?: string;
  kostnadForklaring?: string;
  atgardTyp?: RenoveringAtgardTyp;
  /** Underkomponent-id i registret (för klassning K3 vs direktkostnad). */
  underkomponentId?: string;
  /**
   * true = kostnadsförs i resultaträkningen det år den utförs (ej aktiveras).
   * false/undefined = planerad investering som kan aktiveras/skrivas av.
   */
  direktkostnad?: boolean;
};

/** Avgör om en åtgärd ska särredovisas som kostnadsfört underhåll. */
export function arAtgardDirektkostnad(a: UnderhallAtgard): boolean {
  if (a.direktkostnad === true) return true;
  if (a.direktkostnad === false) return false;
  const underId =
    a.underkomponentId ??
    (a.atgardTyp
      ? RENOVERING_ATGARD_TILL_UNDERKOMPONENT[a.atgardTyp]
      : undefined);
  return arDirektkostnadUnderhall(a.komponent, underId);
}

function parseAr(text: string): number {
  const n = Number.parseInt(text.trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Schemalägger kostnader för aktiva underkomponenter med intervall och kostnad. */
export function samlaUnderhallAtgarder(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData | { underkomponenter: UnderkomponentRad[] }>,
  planStartAr: number,
  planLangdAr: number,
): UnderhallAtgard[] {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const atgarder: UnderhallAtgard[] = [];

  for (const komponent of activeComponents) {
    const data = komponentDetaljer[komponent];
    if (!data) continue;

    if (komponent === "Fasad" && "fasadAtgardRegister" in data) {
      const fasadDetalj = data as KomponentDetaljData;
      const fasadRad = fasadDetalj.underkomponenter.find((r) => r.id === "fasadmaterial");
      if (fasadRad?.aktiv && !arUnderhallFlyttad(fasadRad)) {
        const fasadData = normaliseraFasadAtgardData(
          fasadDetalj.fasadAtgardRegister?.fasadmaterial,
        );
        const priser = hamtaFasadAtgardPrisRegister(
          fasadDetalj,
          "fasadmaterial",
          fasadRad.värde,
        );
        atgarder.push(
          ...samlaFasadAtgardBudgetPoster(
            fasadData,
            priser,
            planStartAr,
            planLangdAr,
          ),
        );
      }
    }

    const detalj = data as KomponentDetaljData;

    for (const rad of data.underkomponenter) {
      if (!rad.aktiv || arUnderhallFlyttad(rad)) continue;
      if (fasadmaterialPlaneratViaTillfallen(komponent, rad.id, detalj)) {
        continue;
      }
      const planNyckel = hamtaUnderhallTillfallenPlanNyckel(komponent, rad.id);
      if (
        planNyckel &&
        planeratViaUnderhallTillfallen(komponent, rad.id, detalj)
      ) {
        const tillfallen = hamtaUnderhallTillfallenData(detalj, rad.id, planNyckel);
        const priser = hamtaUnderhallTillfallenPriser(detalj, rad.id, rad.värde);
        atgarder.push(
          ...samlaUnderhallTillfallenBudgetPoster(
            komponent,
            planNyckel,
            tillfallen,
            priser,
            planStartAr,
            planLangdAr,
            rad.id,
          ),
        );
        continue;
      }
      const kostnad = effektivUnderhallKostnadKr(rad);
      const intervall = parseAr(rad.underhallIntervallAr ?? "");
      if (kostnad <= 0 || intervall < 1) continue;

      let ar = parseAr(rad.underhallNastaAr ?? "") || planStartAr;
      if (ar < planStartAr) ar = planStartAr;
      const direktkostnad = arDirektkostnadUnderhall(komponent, rad.id);

      while (ar <= planSlutAr) {
        atgarder.push({
          komponent,
          del: rad.etikett,
          ar,
          kostnadKr: kostnad,
          intervallAr: intervall,
          kalla: "register",
          underkomponentId: rad.id,
          direktkostnad,
        });
        ar += intervall;
      }
    }
  }

  return atgarder.sort((a, b) => a.ar - b.ar || a.komponent.localeCompare(b.komponent));
}

function normaliseraDelNyckel(del: string): string {
  return del.toLowerCase().replace(/\s+/g, " ").trim();
}

function registerSkallFiltreras(
  rad: UnderkomponentRad,
  komponent: string,
  renoveringar: UtfördRenovering[],
  kontext?: RenoveringFordelningKontext,
): boolean {
  const del = rad.etikett.toLowerCase();
  if (del.includes("stambyte") && historikTackerAtgardTyp(renoveringar, "stambyte", kontext)) {
    return true;
  }
  if (
    (del.includes("fönster") || rad.id === "fonster") &&
    historikTackerAtgardTyp(renoveringar, "fonster", kontext)
  ) {
    return true;
  }
  if (
    (del.includes("tak") || rad.id === "takfonster" || rad.id === "takterrass") &&
    historikTackerAtgardTyp(renoveringar, "tak", kontext)
  ) {
    return true;
  }
  if (rad.id === "hiss" && historikTackerAtgardTyp(renoveringar, "hiss", kontext)) {
    return true;
  }
  if (rad.id === "tvattstuga" && historikTackerAtgardTyp(renoveringar, "tvattstuga", kontext)) {
    return true;
  }
  return false;
}

/** Register + cykliska åtgärder från renoveringshistorik (index och branschregler). */
export function samlaAllaUnderhallAtgarder(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  renoveringar: UtfördRenovering[],
  planStartAr: number,
  planLangdAr: number,
  planKostnader?: PlanKostnaderNormaliserade,
): UnderhallAtgard[] {
  const fordelningKontext: RenoveringFordelningKontext = { komponentDetaljer };
  const franHistorik = genereraAtgarderFranHistorik(
    renoveringar,
    planStartAr,
    planLangdAr,
    planKostnader,
    fordelningKontext,
  );

  let franRegister = samlaUnderhallAtgarder(
    activeComponents,
    komponentDetaljer,
    planStartAr,
    planLangdAr,
  );

  if (franHistorik.length > 0) {
    franRegister = franRegister.filter((a) => {
      const data = komponentDetaljer[a.komponent];
      const rad = data?.underkomponenter.find((r) => r.etikett === a.del);
      if (!rad) return true;
      return !registerSkallFiltreras(rad, a.komponent, renoveringar, fordelningKontext);
    });
  }

  const map = new Map<string, UnderhallAtgard>();
  for (const a of franHistorik) {
    map.set(`${a.komponent}|${a.ar}|${normaliseraDelNyckel(a.del)}`, a);
  }
  for (const a of franRegister) {
    const key = `${a.komponent}|${a.ar}|${normaliseraDelNyckel(a.del)}`;
    if (!map.has(key)) map.set(key, a);
  }

  return [...map.values()].sort(
    (a, b) => a.ar - b.ar || a.komponent.localeCompare(b.komponent),
  );
}

export function underhallKostnadPerAr(
  atgarder: UnderhallAtgard[],
  planStartAr: number,
  planLangdAr: number,
): Record<number, number> {
  const perAr: Record<number, number> = {};
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);

  for (const a of atgarder) {
    if (a.ar < planStartAr || a.ar > planSlutAr) continue;
    perAr[a.ar] = (perAr[a.ar] ?? 0) + a.kostnadKr;
  }

  return perAr;
}

export function formateraUnderhallAtgard(a: UnderhallAtgard): string {
  const kalla =
    a.kalla === "historik" && a.kallaRenoveringAr
      ? `, från ${a.kallaRenoveringAr}`
      : "";
  return `${a.komponent} — ${a.del}: ${formatKr(a.kostnadKr)} (${a.ar}, vart ${a.intervallAr}:e år${kalla})`;
}
