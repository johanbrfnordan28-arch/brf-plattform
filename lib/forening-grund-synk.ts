/**
 * Synkar föreningens grunduppgifter → underhållsplanens steg 1 (adresser, lägenheter, våningar).
 */

import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import {
  lasUnderhallsplanState,
  sparaUnderhallsplanState,
} from "@/components/underhallsplan/underhallsplan-lager";
import type { ForeningProfil } from "@/lib/forening-registry";
import { planNamnFranKontakt, styrelseKontaktFranProfil } from "@/lib/styrelse-kontakt";

export type ForeningGrundForm = {
  adresser: string[];
  postnummer: string;
  ort: string;
  antalLagenheter: string;
  antalVaningar: string;
};

export function adresserFranProfilOchPlan(
  profil: ForeningProfil,
  grund: Grunduppgifter | null | undefined,
): string[] {
  const franPlan = (grund?.adresser ?? []).map((a) => a.trim()).filter(Boolean);
  if (franPlan.length > 0) return franPlan;
  if (profil.postadress.trim()) return [profil.postadress.trim()];
  return [""];
}

/** Skriver adress/lägenheter/våningar in i underhållsplanen; returnerar uppdaterad grund. */
export function appliceraGrundFormPaPlan(
  grund: Grunduppgifter,
  form: ForeningGrundForm,
): Grunduppgifter {
  const adresser = form.adresser.map((a) => a.trim()).filter(Boolean);
  return normaliseraGrund({
    ...grund,
    adresser: adresser.length > 0 ? adresser : [""],
    antalLagenheter: form.antalLagenheter.trim(),
    antalVaningar: form.antalVaningar.trim(),
  });
}

/**
 * Sparar till underhållsplanen och returnerar den första adressen (för profil.postadress).
 */
export function synkaGrundFormTillUnderhallsplan(
  profil: ForeningProfil,
  form: ForeningGrundForm,
): { forstaAdress: string } {
  const plan = lasUnderhallsplanState();
  if (!plan) {
    const forsta = form.adresser.map((a) => a.trim()).find(Boolean) ?? "";
    return { forstaAdress: forsta };
  }
  const kontakt = styrelseKontaktFranProfil(profil);
  const grund = appliceraGrundFormPaPlan(plan.grund, form);
  sparaUnderhallsplanState({
    ...plan,
    planNamn: plan.planNamn || planNamnFranKontakt(kontakt),
    grund,
    sparad: new Date().toISOString(),
  });
  const forstaAdress =
    grund.adresser.map((a) => a.trim()).find(Boolean) ?? "";
  return { forstaAdress };
}
