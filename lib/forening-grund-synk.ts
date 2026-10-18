/**
 * Synkar föreningens grunduppgifter → underhållsplanens steg 1 (adresser, lägenheter, våningar).
 */

import { parseHeltalFranText } from "@/components/underhallsplan/parse-grundtal";
import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import {
  lasUnderhallsplanState,
  sparaUnderhallsplanState,
  tomGrunduppgifter,
  tomtUnderhallsplanState,
} from "@/components/underhallsplan/underhallsplan-lager";
import { synkaLagenhetsarkivTillAntal } from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
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
  const antalByggnader = Math.max(1, adresser.length);
  return normaliseraGrund({
    ...grund,
    adresser: adresser.length > 0 ? adresser : [""],
    antalByggnader: String(antalByggnader),
    antalLagenheter: form.antalLagenheter.trim(),
    antalVaningar: form.antalVaningar.trim(),
  });
}

/**
 * Sparar till underhållsplanen (skapar planen om den saknas) och speglar
 * lägenhetsantalet till lägenhetsregistret. Returnerar första adressen.
 */
export function synkaGrundFormTillUnderhallsplan(
  profil: ForeningProfil,
  form: ForeningGrundForm,
): { forstaAdress: string } {
  const kontakt = styrelseKontaktFranProfil(profil);
  const planNamn = planNamnFranKontakt(kontakt);
  const plan =
    lasUnderhallsplanState(profil.id) ??
    tomtUnderhallsplanState(tomGrunduppgifter(), planNamn);
  const grund = appliceraGrundFormPaPlan(plan.grund, form);
  sparaUnderhallsplanState(
    {
      ...plan,
      planNamn: plan.planNamn || planNamn,
      grund,
      grundSaved:
        plan.grundSaved ||
        grund.adresser.some((a) => a.trim()) ||
        Boolean(grund.antalLagenheter.trim()),
      sparad: new Date().toISOString(),
    },
    profil.id,
  );
  const forstaAdress =
    grund.adresser.map((a) => a.trim()).find(Boolean) ?? "";
  const antal = parseHeltalFranText(form.antalLagenheter);
  if (antal > 0) {
    synkaLagenhetsarkivTillAntal(antal, {
      foreningId: profil.id,
      adress: forstaAdress,
    });
  }
  return { forstaAdress };
}
