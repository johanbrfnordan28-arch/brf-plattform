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
  uppdateraUnderhallTillfallenPriser,
} from "@/components/underhallsplan/underhall-tillfallen-register";
import { expanderaUnderhallTillfallePerAr } from "@/components/underhallsplan/underhall-tillfallen-plan";

export type PlanUnderhallTidRad = {
  ar: number;
  komponent: string;
  underkomponentId: string;
  underkomponentEtikett: string;
  tillfalleId: string;
  tillfalleTitel: string;
  atgardIds: string[];
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
            underkomponentId: underId,
            underkomponentEtikett: underEtikett,
            tillfalleId: t.id,
            tillfalleTitel: titel,
            atgardIds: [...t.atgarder],
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

/**
 * Sätter total kostnad för ett tillfälle (alla år i expansionen får samma summa).
 * Skriver som totalpris på första åtgärden; övriga nollställs i prisregistret.
 */
export function sattTillfalleTotalKostnad(
  komponentDetaljer: Record<string, KomponentDetaljData>,
  komponent: string,
  underkomponentId: string,
  tillfalleId: string,
  nyKostnadKr: number,
): Record<string, KomponentDetaljData> {
  const data = komponentDetaljer[komponent];
  if (!data) return komponentDetaljer;

  const tillfallen = data.underhallTillfallenRegister?.[underkomponentId];
  const tillfalle = tillfallen?.tillfallen.find((t) => t.id === tillfalleId);
  if (!tillfalle || tillfalle.atgarder.length === 0) return komponentDetaljer;

  const forsta = tillfalle.atgarder[0]!;
  const befintliga = hamtaUnderhallTillfallenPriser(data, underkomponentId);
  const nastaPriser = { ...befintliga };

  for (const id of tillfalle.atgarder) {
    if (id === forsta) {
      nastaPriser[id as keyof typeof nastaPriser] = {
        prisEnhet: "total",
        enhetsprisKr: "",
        mangd: "",
        totalKr: nyKostnadKr > 0 ? String(Math.round(nyKostnadKr)) : "",
      };
    } else {
      nastaPriser[id as keyof typeof nastaPriser] = {
        prisEnhet: "total",
        enhetsprisKr: "",
        mangd: "",
        totalKr: "",
      };
    }
  }

  const nastaData = uppdateraUnderhallTillfallenPriser(
    data,
    underkomponentId,
    nastaPriser,
  );

  return {
    ...komponentDetaljer,
    [komponent]: nastaData,
  };
}
