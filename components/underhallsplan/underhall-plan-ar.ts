import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";

export type UnderhallKostnadPerArRad = {
  ar: number;
  summaKr: number;
};

function parseAr(text: string | undefined): number {
  const n = Number.parseInt(text?.trim() ?? "", 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Flyttar ett planerat åtgärdsår framåt i intervallsteg tills det ligger
 * inom/efter planstarten — behåller fasen från byggår (t.ex. 2013+30 → 2043).
 */
export function forstaAtgardArIPlan(
  nastaAr: number,
  intervallAr: number,
  planStartAr: number,
): number {
  if (!Number.isFinite(nastaAr) || nastaAr <= 0) return planStartAr;
  if (!Number.isFinite(intervallAr) || intervallAr < 1) {
    return Math.max(nastaAr, planStartAr);
  }
  let ar = nastaAr;
  while (ar < planStartAr) ar += intervallAr;
  return ar;
}

/** Första åtgärd = byggår + intervall (ev. framflyttad till planperioden). */
export function nastaArFranByggar(
  byggar: number,
  intervallAr: number,
  planStartAr?: number,
): number {
  const forsta = byggar + intervallAr;
  if (planStartAr == null) return forsta;
  return forstaAtgardArIPlan(forsta, intervallAr, planStartAr);
}

/** Vilka år underhållet planeras och vilken summa som gäller varje gång. */
export function beraknaUnderhallKostnadPerArForRad(
  rad: UnderkomponentRad,
  planStartAr: number,
  planLangdAr: number,
): UnderhallKostnadPerArRad[] {
  const kostnad = effektivUnderhallKostnadKr(rad);
  const intervall = parseAr(rad.underhallIntervallAr);
  if (kostnad <= 0 || intervall < 1) return [];

  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  let ar = forstaAtgardArIPlan(
    parseAr(rad.underhallNastaAr) || planStartAr,
    intervall,
    planStartAr,
  );

  const rader: UnderhallKostnadPerArRad[] = [];
  while (ar <= planSlutAr) {
    rader.push({ ar, summaKr: kostnad });
    ar += intervall;
  }
  return rader;
}

/** Summerar flera underhållsrader till en kostnad per år. */
export function summeraUnderhallPerAr(
  rader: UnderhallKostnadPerArRad[],
): UnderhallKostnadPerArRad[] {
  const map = new Map<number, number>();
  for (const rad of rader) {
    map.set(rad.ar, (map.get(rad.ar) ?? 0) + rad.summaKr);
  }
  return [...map.entries()]
    .map(([ar, summaKr]) => ({ ar, summaKr }))
    .sort((a, b) => a.ar - b.ar);
}
