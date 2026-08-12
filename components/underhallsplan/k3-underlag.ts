import {
  effektivAvskrivningAr,
  hamtaAvskrivningRekommendation,
  K3_STOMME_VAGLEDNING,
  arK3AvskrivningsKomponent,
} from "@/components/underhallsplan/komponent-avskrivning";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

export type K3UnderlagRad = {
  komponent: string;
  underkomponentId: string;
  etikett: string;
  avskrivningAr: number;
  hint: string;
  /** true = raden finns i föreningens aktiva register */
  iRegistret: boolean;
  /** Orientering utanför registret (t.ex. stomme) */
  vagledning?: boolean;
};

/**
 * Samlar K3-underlag från komponentregistret: aktiva underkomponenter
 * som är betydande byggnadsdelar, plus vägledning för stomme/grund.
 */
export function samlaK3Underlag(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): K3UnderlagRad[] {
  const rader: K3UnderlagRad[] = [
    {
      komponent: "Byggnad",
      underkomponentId: "stomme-grund",
      etikett: K3_STOMME_VAGLEDNING.etikett,
      avskrivningAr: K3_STOMME_VAGLEDNING.rekommenderadAvskrivningAr,
      hint: K3_STOMME_VAGLEDNING.hint,
      iRegistret: false,
      vagledning: true,
    },
  ];

  for (const komponent of activeComponents) {
    const data = komponentDetaljer[komponent];
    if (!data) continue;
    for (const rad of data.underkomponenter) {
      if (!rad.aktiv && !rad.ärEgen) continue;
      const arK3 =
        rad.ärEgen ||
        arK3AvskrivningsKomponent(komponent, rad.id) ||
        Boolean(rad.avskrivningAr?.trim());
      if (!arK3) continue;

      const rek = hamtaAvskrivningRekommendation(komponent, rad.id);
      if (rek && !rek.arK3Komponent && !rad.avskrivningAr?.trim()) continue;

      const ar = effektivAvskrivningAr(komponent, rad.id, rad.avskrivningAr);
      if (ar <= 0 && !rad.ärEgen) continue;

      rader.push({
        komponent,
        underkomponentId: rad.id,
        etikett: rad.etikett,
        avskrivningAr: ar > 0 ? ar : 0,
        hint: rek?.hint ?? "Ange nyttjandeperiod i steg 3 — bedöms per förening.",
        iRegistret: true,
      });
    }
  }

  return rader;
}
