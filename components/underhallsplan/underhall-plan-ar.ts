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
  let ar = parseAr(rad.underhallNastaAr) || planStartAr;
  if (ar < planStartAr) ar = planStartAr;

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
