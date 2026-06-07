import { arUnderhallFlyttad } from "@/components/underhallsplan/kommande-projekt";
import { hamtaKomponentMall, type KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";

export type KommandeUnderhallRad = {
  komponent: string;
  underkomponentId: string;
  etikett: string;
  nastaAr: number;
  kostnadKr?: number;
  franHistorik: boolean;
};

export function sammanstallKommandeUnderhall(
  register: Record<string, KomponentDetaljData>,
  planStartAr: number,
  planLangdAr: number,
): KommandeUnderhallRad[] {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const rader: KommandeUnderhallRad[] = [];

  for (const [komponent, data] of Object.entries(register)) {
    const mall = hamtaKomponentMall(komponent);
    for (const rad of data.underkomponenter) {
      if (!rad.aktiv || arUnderhallFlyttad(rad)) continue;
      const nasta = Number.parseInt(rad.underhallNastaAr ?? "", 10);
      if (Number.isNaN(nasta) || nasta < planStartAr || nasta > planSlutAr) continue;
      const effektiv = effektivUnderhallKostnadKr(rad);
      const kostnad = effektiv > 0 ? effektiv : undefined;
      const def = mall.underkomponenter.find((u) => u.id === rad.id);
      rader.push({
        komponent,
        underkomponentId: rad.id,
        etikett: def?.etikett ?? rad.etikett,
        nastaAr: nasta,
        kostnadKr: Number.isNaN(kostnad ?? NaN) ? undefined : kostnad,
        franHistorik: Boolean(rad.underhallFranHistorik),
      });
    }
  }

  return rader.sort((a, b) => a.nastaAr - b.nastaAr || a.komponent.localeCompare(b.komponent));
}
