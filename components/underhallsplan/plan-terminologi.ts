/**
 * Användarvänd begreppsavgränsning (bokföringsnära):
 * - Underhållsplanen = större åtgärder som kan aktiveras och skrivas av (K3).
 * - Årsbudgeten = poster som kostnadsförs det år de förfaller
 *   (avsättning, besiktningar, kostnadsfört underhåll t.ex. spolning/filmning).
 */

export const PLAN_BEGREPP = {
  underhallsplan: "Underhållsplan",
  arsbudgetSteg: "Utgifter i årsbudgeten",
  arsbudgetStegKort: "Årsbudget",
  avsattning: "Avsättning",
  besiktningar: "Besiktningar",
  /** Underhåll som kostnadsförs i resultaträkningen (ej aktiveras). */
  direktkostnader: "Kostnadsfört underhåll",
  /** Kort kolumnrubrik */
  direktkostnaderKort: "Kostnadsfört",
  investeringarPlan: "Planerade investeringar",
  utgifterArsbudget: "Summa utgifter i årsbudgeten",
} as const;

export const FORKLARING_ARSBUDGET_VS_PLAN = `Underhållsplanen beskriver större åtgärder (t.ex. stambyte, fasadbyte) som i bokföringen normalt aktiveras och skrivs av över komponentens nyttjandeperiod (K3) — inte som en jämn kostnad varje år.

Här sammanställs poster som ska tas upp i föreningens årliga budget och som kostnadsförs det år de utförs: avsättning per kvm och år, besiktningar, samt kostnadsfört underhåll (t.ex. avloppsspolning och filmning). Planerade investeringar som kan aktiveras visas separat.`;

export const FORKLARING_AVSATTNING = `Avsättningen (kr/m² och år) är en jämn post som normalt budgeteras varje år i föreningen.`;

export const FORKLARING_DIREKTKOSTNAD = `Kostnadsfört underhåll är löpande åtgärder med intervall (spolning, filmning, målning m.m.) som kostnadsförs i resultaträkningen det år de utförs. De aktiveras inte som anläggningstillgång och skrivs därför inte av över tid enligt K3 — till skillnad från aktiverade investeringar/komponentutbyten.`;

export const FORKLARING_INVESTERING = `Beloppet avser planerad investering/komponentåtgärd enligt underhållsplanen. I bokföringen (K3) aktiveras större åtgärder normalt som anläggningstillgång och skrivs av över komponentens nyttjandeperiod — det ska inte förväxlas med kostnadsfört underhåll i resultaträkningen.`;

export const FORKLARING_K3 = `Från 2026 ska bostadsrättsföreningar tillämpa K3. Här ser ni uppskattade installationsvärden per komponent och en enkel avskrivningstid. Ta bort komponenter som inte är aktuella i steg 3.`;
