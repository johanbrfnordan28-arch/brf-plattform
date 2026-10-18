/**
 * Grunddata som fylls i vid skapande av förening och speglas till
 * profil, underhållsplan och lägenhetsregister.
 */

import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import {
  sparaForeningProfil,
  sparaSenastSkapadProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  synkaGrundFormTillUnderhallsplan,
  type ForeningGrundForm,
} from "@/lib/forening-grund-synk";

export type ForeningStartGrund = ForeningGrundForm & {
  organisationsnummer: string;
};

export const MAX_LAGENHETER_VID_SKAPANDE = 400;

export function parseAntalLagenheter(text: string): number {
  return parseHeltalFranText(text);
}

export function appliceraForeningStartData(
  profil: ForeningProfil,
  grund: ForeningStartGrund,
  opts?: { baraOmTom?: boolean },
): ForeningProfil {
  if (opts?.baraOmTom && profil.grundinfoPaborjad) {
    return profil;
  }

  const { forstaAdress } = synkaGrundFormTillUnderhallsplan(profil, grund);
  const uppdaterad: ForeningProfil = {
    ...profil,
    organisationsnummer:
      grund.organisationsnummer.trim() || profil.organisationsnummer,
    postadress: forstaAdress || profil.postadress,
    postnummer: grund.postnummer.trim() || profil.postnummer,
    ort: grund.ort.trim() || profil.ort,
    grundinfoPaborjad: true,
  };
  sparaForeningProfil(uppdaterad, { tyst: true });
  sparaSenastSkapadProfil(uppdaterad);
  return uppdaterad;
}
