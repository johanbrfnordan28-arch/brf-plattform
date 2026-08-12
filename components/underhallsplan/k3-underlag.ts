import {
  effektivAvskrivningAr,
  standardAvskrivningAr,
} from "@/components/underhallsplan/komponent-avskrivning";
import {
  FAR_K3_KOMPONENTER,
  farAndelText,
  type FarK3Komponent,
} from "@/components/underhallsplan/far-k3-komponenter";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

export type K3UnderlagRad = {
  komponent: string;
  underkomponentId: string;
  etikett: string;
  avskrivningAr: number;
  hint: string;
  /** true = raden finns i föreningens aktiva register */
  iRegistret: boolean;
  /** Orientering utanför registret (t.ex. saknad FAR-komponent) */
  vagledning?: boolean;
  /** FAR andel av anskaffningsvärdet */
  andelText?: string;
};

function hittaRegisterRad(
  far: FarK3Komponent,
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): {
  komponentNamn: string;
  underkomponentId: string;
  etikett: string;
  avskrivningAr: number;
} | null {
  for (const koppling of far.registerKopplingar) {
    if (!activeComponents.includes(koppling.komponentNamn)) continue;
    const data = komponentDetaljer[koppling.komponentNamn];
    if (!data) continue;
    const rad = data.underkomponenter.find(
      (r) => r.id === koppling.underkomponentId,
    );
    if (!rad) continue;
    if (!rad.aktiv && !rad.ärEgen) continue;

    const ar = effektivAvskrivningAr(
      koppling.komponentNamn,
      koppling.underkomponentId,
      rad.avskrivningAr,
    );
    return {
      komponentNamn: koppling.komponentNamn,
      underkomponentId: koppling.underkomponentId,
      etikett: rad.etikett || far.namn,
      avskrivningAr:
        ar > 0
          ? ar
          : far.standardNyttjandeperiodAr,
    };
  }
  return null;
}

/**
 * Samlar K3-underlag enligt FAR Tabell 1 (ca 8–11 väsentliga komponenter).
 * Visar alltid de komponenter FAR säger finns i typiska BRF:er;
 * villkorliga (balkong, hiss, styr) bara om de är aktiva i registret.
 */
export function samlaK3Underlag(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
): K3UnderlagRad[] {
  const rader: K3UnderlagRad[] = [];

  for (const far of FAR_K3_KOMPONENTER) {
    const hittad = hittaRegisterRad(far, activeComponents, komponentDetaljer);

    if (hittad) {
      rader.push({
        komponent: hittad.komponentNamn,
        underkomponentId: hittad.underkomponentId,
        etikett: far.namn,
        avskrivningAr: hittad.avskrivningAr,
        hint: `FAR ${farAndelText(far)} av anskaffningsvärdet · ${far.periodAlternativ?.map((p) => `${p.etikett} ${p.ar} år`).join("; ") ?? `${far.standardNyttjandeperiodAr} år`}`,
        iRegistret: true,
        andelText: farAndelText(far),
      });
      continue;
    }

    if (far.ejAlltid) continue;

    // Saknas i registret — visa vägledning så antalet FAR-komponenter blir korrekt
    const standardAr =
      Number.parseInt(
        standardAvskrivningAr(
          far.registerKopplingar[0]?.komponentNamn ?? "",
          far.registerKopplingar[0]?.underkomponentId ?? "",
        ),
        10,
      ) || far.standardNyttjandeperiodAr;

    rader.push({
      komponent: far.registerKopplingar[0]?.komponentNamn ?? "FAR",
      underkomponentId: far.id,
      etikett: far.namn,
      avskrivningAr: standardAr,
      hint: `FAR ${farAndelText(far)} · aktivera i registret för att knyta till underhållsplanen`,
      iRegistret: false,
      vagledning: true,
      andelText: farAndelText(far),
    });
  }

  return rader;
}
