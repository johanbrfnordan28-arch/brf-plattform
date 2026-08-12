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
} from "@/lib/sailor-forening";
import { appliceraFarK3PaPlan } from "@/components/underhallsplan/far-k3-synk";

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
  if (arSailorForening(options?.foreningId)) {
    const far = appliceraFarK3PaPlan(
      synced.activeComponents,
      synced.register,
      { aktiveraVillkorliga: true, skrivOverAvskrivning: true },
    );
    synced = synkaUnderhallsplanState(
      far.activeComponents,
      far.komponentDetaljer,
    );
  }
  const antalLgh = hamtaAntalLagenheterFranGrund(grund);
  const titelBas = foreningsnamn?.trim() || plan.namn;

  return {
    version: 1,
    sparad: new Date().toISOString(),
    aktivTestplan: id,
    planNamn: uppdateraPlanTitelMedLagenheter(titelBas, antalLgh),
    planNotering: plan.planNotering ?? null,
    grund,
    planinstallningar: normaliseraPlaninstallningar(plan.planinstallningar),
    grundSaved: true,
    renoveringarSaved: false,
    komponenterSaved: false,
    besiktningarSaved: false,
    activeComponents: synced.activeComponents,
    komponentDetaljer: synced.register,
    besiktningar: plan.besiktningar,
    samfallighetsavgift: skapaStandardSamfallighetsavgift(),
    renoveringarLista: [],
    renoveringSammanfattning: null,
    krPerKvmAr: plan.krPerKvmAr,
  };
}

/** Skriver demo-underhållsplan till localStorage (endast webbläsare). */
export function forberedInvesterarDemo(
  id: TestplanId = "test-90",
): void {
  if (typeof window === "undefined") return;
  sparaUnderhallsplanState(byggLagratStateFranTestplan(id));
}
