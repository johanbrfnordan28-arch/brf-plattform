/**
 * Användarvänd begreppsavgränsning:
 * - Underhållsplanen = större investeringar som avskrivs/amorteras över tid.
 * - Årsbudgeten = utgifter styrelsen budgeterar det år de förfaller
 *   (avsättning varje år, besiktningar det år de utförs — t.ex. vart 10:e år).
 */

export const PLAN_BEGREPP = {
  underhallsplan: "Underhållsplan",
  arsbudgetSteg: "Utgifter i årsbudgeten",
  arsbudgetStegKort: "Årsbudget",
  avsattning: "Avsättning",
  besiktningar: "Besiktningar",
  investeringarPlan: "Planerade investeringar",
  utgifterArsbudget: "Summa utgifter i årsbudgeten",
} as const;

export const FORKLARING_ARSBUDGET_VS_PLAN = `Underhållsplanen beskriver större investeringar (t.ex. stambyte, fasad) som skrivs av över en period — inte som en jämn kostnad varje år i föreningens budget.

Här sammanställs utgifter som ska tas upp i föreningens årliga budget: avsättning per kvm och år samt besiktningar och liknande det år de utförs (vissa vart 3:e, 10:e eller annat intervall). Planerade investeringar från underhållsplanen visas separat som underlag — de är inte samma sak som årsbudgetposten.`;

export const FORKLARING_AVSATTNING = `Avsättningen (kr/m² och år) är en jämn post som normalt budgeteras varje år i föreningen.`;

export const FORKLARING_INVESTERING = `Beloppet avser planerad investering/åtgärd det året enligt underhållsplanen. Kostnaden fördelas i bokföringen över avskrivningstid — den ska inte förväxlas med en årlig driftsbudgetpost.`;
