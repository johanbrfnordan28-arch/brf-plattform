import {
  FAR_K3_KOMPONENTER,
  FAR_REGISTER_KOMPONENTER,
} from "@/components/underhallsplan/far-k3-komponenter";
import { standardAvskrivningAr } from "@/components/underhallsplan/komponent-avskrivning";
import {
  synkaUnderhallsplanState,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";

export type FarK3SynkOptions = {
  /** Aktivera även balkong, hiss och styr (FAR:s villkorliga komponenter). */
  aktiveraVillkorliga?: boolean;
  /** Skriv över sparade avskrivningstider med FAR-standard. */
  skrivOverAvskrivning?: boolean;
};

/**
 * Säkerställer FAR:s väsentliga komponenter i registret och sätter
 * nyttjandeperioder enligt Tabell 2.
 */
export function appliceraFarK3PaPlan(
  activeComponents: string[],
  komponentDetaljer: Record<string, KomponentDetaljData>,
  options: FarK3SynkOptions = {},
): {
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
} {
  const aktiveraVillkorliga = options.aktiveraVillkorliga ?? true;
  const skrivOver = options.skrivOverAvskrivning ?? true;

  const mergedActive = [
    ...new Set([...activeComponents, ...FAR_REGISTER_KOMPONENTER]),
  ];

  const synced = synkaUnderhallsplanState(mergedActive, komponentDetaljer);
  const nextRegister: Record<string, KomponentDetaljData> = {
    ...synced.register,
  };

  for (const far of FAR_K3_KOMPONENTER) {
    if (far.ejAlltid && !aktiveraVillkorliga) continue;

    for (const koppling of far.registerKopplingar) {
      const data = nextRegister[koppling.komponentNamn];
      if (!data) continue;

      const standard = String(far.standardNyttjandeperiodAr);
      const mallStandard = standardAvskrivningAr(
        koppling.komponentNamn,
        koppling.underkomponentId,
      );
      const avskrivning = mallStandard || standard;

      nextRegister[koppling.komponentNamn] = {
        ...data,
        underkomponenter: data.underkomponenter.map((rad) => {
          if (rad.id !== koppling.underkomponentId) return rad;
          return {
            ...rad,
            aktiv: true,
            avskrivningAr: skrivOver
              ? avskrivning
              : rad.avskrivningAr?.trim() || avskrivning,
          };
        }),
      };
      break; // första tillgängliga koppling räcker
    }
  }

  return {
    activeComponents: synced.activeComponents,
    komponentDetaljer: nextRegister,
  };
}
