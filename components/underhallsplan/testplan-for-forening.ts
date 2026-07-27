import {
  arGrundmallForening,
  lasAktivForeningId,
} from "@/lib/forening-registry";
import { hamtaStandardTestForeningTestplan } from "@/lib/testforeningar";
import {
  hamtaTestplan,
  testplaner,
  type TestplanDefinition,
  type TestplanId,
} from "@/components/underhallsplan/testplaner";

/** Demo-planer som bara ska visas i grundmallen — inte på egna föreningssidor. */
export const GENERISKA_DEMO_TESTPLANER: TestplanId[] = [
  "test-1900",
  "test-50",
  "test-70",
  "test-90",
];

export function hamtaTillgangligaTestplaner(
  foreningId?: string,
): TestplanDefinition[] {
  const id = foreningId ?? lasAktivForeningId();
  if (arGrundmallForening(id)) return testplaner;

  const standardPlan = hamtaStandardTestForeningTestplan(id);
  if (standardPlan) {
    const plan = hamtaTestplan(standardPlan);
    return plan ? [plan] : [];
  }

  return [];
}

export function arTillatenTestplanForForening(
  planId: TestplanId,
  foreningId?: string,
): boolean {
  const tillgangliga = hamtaTillgangligaTestplaner(foreningId);
  return tillgangliga.some((plan) => plan.id === planId);
}

export function arGeneriskDemoTestplan(planId: TestplanId): boolean {
  return GENERISKA_DEMO_TESTPLANER.includes(planId);
}
