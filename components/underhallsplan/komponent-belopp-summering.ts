import type { PlanUnderhallTidRad } from "@/components/underhallsplan/plan-underhall-tidslista";

export type KomponentBeloppSummering = {
  komponent: string;
  antalPoster: number;
  summaKr: number;
  /** Delar med belopp > 0 */
  delar: { etikett: string; summaKr: number }[];
};

/** Summerar planerade belopp per huvudkomponent från tidslistan. */
export function summeraKomponentBeloppFranTidslista(
  rader: PlanUnderhallTidRad[],
): KomponentBeloppSummering[] {
  const perKomponent = new Map<
    string,
    { summaKr: number; antalPoster: number; delar: Map<string, number> }
  >();

  for (const rad of rader) {
    if (rad.kostnadKr <= 0) continue;
    const bef = perKomponent.get(rad.komponent) ?? {
      summaKr: 0,
      antalPoster: 0,
      delar: new Map<string, number>(),
    };
    bef.summaKr += rad.kostnadKr;
    bef.antalPoster += 1;
    const delKey = rad.underkomponentEtikett || rad.underkomponentId;
    bef.delar.set(delKey, (bef.delar.get(delKey) ?? 0) + rad.kostnadKr);
    perKomponent.set(rad.komponent, bef);
  }

  return [...perKomponent.entries()]
    .map(([komponent, data]) => ({
      komponent,
      antalPoster: data.antalPoster,
      summaKr: data.summaKr,
      delar: [...data.delar.entries()]
        .map(([etikett, summaKr]) => ({ etikett, summaKr }))
        .sort((a, b) => b.summaKr - a.summaKr),
    }))
    .sort((a, b) => b.summaKr - a.summaKr);
}
