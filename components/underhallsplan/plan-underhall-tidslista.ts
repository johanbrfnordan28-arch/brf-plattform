import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { underhallAtgardEtikett } from "@/components/underhallsplan/underhall-atgard-katalog";
import {
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import {
  hamtaUnderhallTillfallenData,
  hamtaUnderhallTillfallenPlanNyckel,
  hamtaUnderhallTillfallenPriser,
} from "@/components/underhallsplan/underhall-tillfallen-register";
import { expanderaUnderhallTillfallePerAr } from "@/components/underhallsplan/underhall-tillfallen-plan";

export type PlanUnderhallTidRad = {
  ar: number;
  komponent: string;
  underkomponentEtikett: string;
  tillfalleTitel: string;
  atgardEtiketter: string[];
  intervallAr: number;
  kostnadKr: number;
};

/** Alla planerade år från underhållstillfällen (steg 3) — sorterade för utskrift på slutsidan. */
export function samlaPlanUnderhallTidslista(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  planStartAr: number,
  planLangdAr: number,
): PlanUnderhallTidRad[] {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const rader: PlanUnderhallTidRad[] = [];

  for (const komponent of activeComponents) {
    const data = komponentDetaljer[komponent];
    const register = data?.underhallTillfallenRegister;
    if (!register) continue;

    const mall = hamtaKomponentMall(komponent);
    if (!mall) continue;

    for (const underId of Object.keys(register)) {
      const planNyckel = hamtaUnderhallTillfallenPlanNyckel(komponent, underId);
      if (!planNyckel) continue;

      const tillfallen = hamtaUnderhallTillfallenData(data, underId, planNyckel);
      const underEtikett =
        mall.underkomponenter.find((u) => u.id === underId)?.etikett ?? underId;
      const priser = hamtaUnderhallTillfallenPriser(data, underId);

      for (const t of tillfallen.tillfallen) {
        if (t.atgarder.length === 0 || !t.intervallAr.trim()) continue;

        const intervallAr = Number.parseInt(t.intervallAr, 10) || 0;
        const atgardEtiketter = t.atgarder.map((id) =>
          underhallAtgardEtikett(planNyckel, id),
        );
        const titel =
          t.titel.trim() || atgardEtiketter.join(" · ") || "Planerat tillfälle";

        const perAr = expanderaUnderhallTillfallePerAr(
          planNyckel,
          t,
          priser,
          planStartAr,
          planLangdAr,
        );

        for (const { ar, summaKr } of perAr) {
          if (ar < planStartAr || ar > planSlutAr) continue;
          rader.push({
            ar,
            komponent,
            underkomponentEtikett: underEtikett,
            tillfalleTitel: titel,
            atgardEtiketter,
            intervallAr,
            kostnadKr: summaKr,
          });
        }
      }
    }
  }

  return rader.sort(
    (a, b) =>
      a.ar - b.ar ||
      a.komponent.localeCompare(b.komponent, "sv") ||
      a.underkomponentEtikett.localeCompare(b.underkomponentEtikett, "sv"),
  );
}
