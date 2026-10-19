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
import {
  arGrundmallForening,
  lasForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { planNamnFranKontakt, styrelseKontaktFranProfil } from "@/lib/styrelse-kontakt";

export type ForeningGrundForm = {
  adresser: string[];
  postnummer: string;
  ort: string;
  antalLagenheter: string;
  antalVaningar: string;
};

export type SynkadForeningGrund = ForeningGrundForm & {
  organisationsnummer: string;
};

export function hamtaSynkadForeningGrund(
  profil: ForeningProfil,
): SynkadForeningGrund {
  const plan = lasUnderhallsplanState(profil.id);
  return {
    organisationsnummer: profil.organisationsnummer.trim(),
    adresser: adresserFranProfilOchPlan(profil, plan?.grund),
    postnummer: profil.postnummer,
    ort: profil.ort,
    antalLagenheter:
      (plan?.grund.antalLagenheter ?? "").trim() ||
      profil.antalLagenheter.trim(),
    antalVaningar:
      (plan?.grund.antalVaningar ?? "").trim() || profil.antalVaningar.trim(),
  };
}

export function hamtaAntalLagenheterSynkat(profil?: ForeningProfil | null): number {
  const p = profil ?? lasForeningProfil();
  if (p) {
    return parseHeltalFranText(hamtaSynkadForeningGrund(p).antalLagenheter);
  }
  const plan = lasUnderhallsplanState();
  return plan?.grund ? parseHeltalFranText(plan.grund.antalLagenheter) : 0;
}

/** Fyller tomma planfält från profilen utan att skriva över det styrelsen redan angett i planen. */
export function fyllTomtGrundFranProfil(
  grund: Grunduppgifter,
  profil: ForeningProfil,
): Grunduppgifter {
  const synkad = hamtaSynkadForeningGrund(profil);
  const harAdress = grund.adresser.some((a) => a.trim());
  return appliceraGrundFormPaPlan(grund, {
    adresser: harAdress ? grund.adresser : synkad.adresser,
    postnummer: synkad.postnummer,
    ort: synkad.ort,
    antalLagenheter: grund.antalLagenheter.trim() || synkad.antalLagenheter,
    antalVaningar: grund.antalVaningar.trim() || synkad.antalVaningar,
  });
}

/** Underhållsplanens grund med registrerad föreningsdata ifylld där planen är tom. */
export function hamtaSynkadPlanGrund(foreningId?: string): Grunduppgifter | null {
  const profil = lasForeningProfil(foreningId);
  const plan = lasUnderhallsplanState(foreningId);
  if (!profil || arGrundmallForening(profil.id)) {
    return plan?.grund ?? null;
  }
  return fyllTomtGrundFranProfil(plan?.grund ?? tomGrunduppgifter(), profil);
}

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
