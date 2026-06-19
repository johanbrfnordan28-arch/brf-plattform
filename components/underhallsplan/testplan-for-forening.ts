import {
  arGrundmallForening,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { hamtaStandardTestForeningTestplan } from "@/lib/testforeningar";
import {
  hamtaTestplan,
  testplaner,
  testplanNordan28,
  testplanNordan30,
  type TestplanDefinition,
  type TestplanId,
} from "@/components/underhallsplan/testplaner";

/** Demo-planer som bara ska visas i grundmallen — inte på egna föreningssidor. */
export const GENERISKA_DEMO_TESTPLANER: TestplanId[] = [
  "test-1900",
  "test-50",
  "test-70",
  "test-90",
  "test-sailor",
];

function matcharNordan28(foreningId: string, foreningNamn: string): boolean {
  const id = foreningId.toLowerCase();
  const namn = foreningNamn.toLowerCase();
  return id.includes("nordan-28") || namn.includes("nordan 28");
}

function matcharNordan30(foreningId: string, foreningNamn: string): boolean {
  const id = foreningId.toLowerCase();
  const namn = foreningNamn.toLowerCase();
  return id.includes("nordan-30") || namn.includes("nordan 30");
}

export function hamtaTillgangligaTestplaner(
  foreningId?: string,
  foreningNamn?: string,
): TestplanDefinition[] {
  const id = foreningId ?? lasAktivForeningId();
  if (arGrundmallForening(id)) return testplaner;

  const standardPlan = hamtaStandardTestForeningTestplan(id);
  if (standardPlan) {
    const plan = hamtaTestplan(standardPlan);
    return plan ? [plan] : [];
  }

  const namn = foreningNamn ?? lasForeningProfil(id)?.namn ?? "";
  if (matcharNordan28(id, namn)) return [testplanNordan28];
  if (matcharNordan30(id, namn)) return [testplanNordan30];

  return [];
}

export function arTillatenTestplanForForening(
  planId: TestplanId,
  foreningId?: string,
  foreningNamn?: string,
): boolean {
  const tillgangliga = hamtaTillgangligaTestplaner(foreningId, foreningNamn);
  return tillgangliga.some((plan) => plan.id === planId);
}

export function arGeneriskDemoTestplan(planId: TestplanId): boolean {
  return GENERISKA_DEMO_TESTPLANER.includes(planId);
}
