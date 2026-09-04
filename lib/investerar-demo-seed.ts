import {
  sparaUnderhallsplanState,
  type UnderhallsplanLagratState,
} from "@/components/underhallsplan/underhallsplan-lager";
import {
  hamtaTestplan,
  type TestplanId,
} from "@/components/underhallsplan/testplaner";
import {
  hamtaAntalLagenheterFranGrund,
  normaliseraGrund,
  uppdateraPlanTitelMedLagenheter,
} from "@/components/underhallsplan/grund-synk";
import { normaliseraPlaninstallningar } from "@/components/underhallsplan/planinstallningar";
import { synkaUnderhallsplanState } from "@/components/underhallsplan/komponentregister";
import { skapaStandardSamfallighetsavgift } from "@/components/underhallsplan/samfallighetsavgift";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import {
  appliceraSailorGrund,
  arSailorForening,
  SAILOR_PLAN_START_AR,
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";
import { byggSailorKomponentUtkast } from "@/lib/sailor-underhallsplan-utkast";

export function byggLagratStateFranTestplan(
  id: TestplanId,
  foreningsnamn?: string,
  options?: { foreningId?: string; grundPatch?: Partial<Grunduppgifter> },
): UnderhallsplanLagratState {
  const plan = hamtaTestplan(id);
  let grund = normaliseraGrund(plan.grund);
  if (options?.grundPatch) {
    grund = normaliseraGrund({ ...grund, ...options.grundPatch });
  }
  if (arSailorForening(options?.foreningId)) {
    grund = normaliseraGrund(appliceraSailorGrund(grund));
  }
  let synced = synkaUnderhallsplanState(
    plan.activeComponents,
    synkaUnderhallsplanState(
      plan.activeComponents,
      plan.komponentDetaljer ?? {},
    ).register,
  );
  let varderingsUnderlag = undefined as
    | typeof SAILOR_VARDERING_UNDERLAG
    | undefined;
  let planNotering = plan.planNotering ?? null;
  let samfallighetsavgift = skapaStandardSamfallighetsavgift();
  let krPerKvmAr = plan.krPerKvmAr;
  let activeComponents = synced.activeComponents;
  let komponentDetaljer = synced.register;

  let besiktningar = plan.besiktningar;
  if (arSailorForening(options?.foreningId)) {
    const utkast = byggSailorKomponentUtkast();
    varderingsUnderlag = SAILOR_VARDERING_UNDERLAG;
    planNotering = utkast.planNotering;
    samfallighetsavgift = utkast.samfallighetsavgift;
    krPerKvmAr = utkast.krPerKvmAr;
    activeComponents = utkast.activeComponents;
    komponentDetaljer = utkast.komponentDetaljer;
    besiktningar = utkast.besiktningar;
  }
  const antalLgh = hamtaAntalLagenheterFranGrund(grund);
  const titelBas = foreningsnamn?.trim() || plan.namn;
  const arSailor = Boolean(arSailorForening(options?.foreningId));

  return {
    version: 1,
    sparad: new Date().toISOString(),
    aktivTestplan: id,
    planNamn: uppdateraPlanTitelMedLagenheter(titelBas, antalLgh),
    planNotering,
    grund,
    planinstallningar: normaliseraPlaninstallningar(
      arSailorForening(options?.foreningId)
        ? {
            ...plan.planinstallningar,
            planStartAr: String(SAILOR_PLAN_START_AR),
          }
        : plan.planinstallningar,
    ),
    grundSaved: true,
    renoveringarSaved: false,
    komponenterSaved: arSailor,
    besiktningarSaved: arSailor,
    activeComponents,
    komponentDetaljer,
    besiktningar,
    samfallighetsavgift,
    renoveringarLista: [],
    renoveringSammanfattning: null,
    krPerKvmAr,
    varderingsUnderlag,
  };
}

/** Skriver demo-underhållsplan till localStorage (endast webbläsare). */
export function forberedInvesterarDemo(
  id: TestplanId = "test-90",
): void {
  if (typeof window === "undefined") return;
  sparaUnderhallsplanState(byggLagratStateFranTestplan(id));
}
