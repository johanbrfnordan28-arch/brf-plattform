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

export const FORKLARING_ARSBUDGET_VS_PLAN = `Underhållsplanen beskriver större åtgärder (t.ex. stambyte, fasadbyte) som i bokföringen normalt aktiveras och skrivs av över komponentens nyttjandeperiod (K3). Samtidigt behöver styrelsen veta när investeringen sker och hur mycket som ska avsättas i föreningens budget varje år.

Här sammanställs underlag till årsbudgeten: avsättning per kvm och år (för att bygga upp till tyngre renoveringar), besiktningar det år de planeras, samt kostnadsfört underhåll (t.ex. spolning och målning) som kostnadsförs direkt. Större investeringar visas i egen kolumn — beloppen är planerade utgifter, inte en jämn avskrivning i resultaträkningen.`;

export const FORKLARING_AVSATTNING = `Avsättningen (kr/m² och år) är en jämn budgetpost som styrelsen normalt tar med varje år. För större komponenter räknas den ofta utifrån livscykel och intervall: investerar ni i ny belysning med 20 års livslängd kan kostnaden skrivas av i tio år (K3) medan ni samtidigt avsätter motsvarande belopp per kvm och år så att nästa byte kan finansieras när det är dags. Verktyget föreslår nivå utifrån planerade investeringar och intervall i registret.`;

export const FORKLARING_BUDGET_AKTUELLT_AR = `Raden för budgetåret visar summan styrelsen kan använda som stöd när årsbudgeten tas fram: avsättning, planerade besiktningar och kostnadsfört underhåll det året. Investeringar (större renoveringar) redovisas separat så ni ser både löpande budget och stora utgiftsår.`;

export const FORKLARING_DIREKTKOSTNAD = `Kostnadsfört underhåll är löpande åtgärder med intervall (spolning, filmning, målning m.m.) som kostnadsförs i resultaträkningen det år de utförs. De aktiveras inte som anläggningstillgång och skrivs därför inte av över tid enligt K3 — till skillnad från aktiverade investeringar/komponentutbyten.`;

export const FORKLARING_INVESTERING = `Beloppet avser planerad investering/komponentåtgärd enligt underhållsplanen. I bokföringen (K3) aktiveras större åtgärder normalt som anläggningstillgång och skrivs av över komponentens nyttjandeperiod — det ska inte förväxlas med kostnadsfört underhåll i resultaträkningen.`;

export const FORKLARING_K3 = `Från 2026 ska bostadsrättsföreningar tillämpa K3. Här ser ni uppskattade installationsvärden per komponent och en enkel avskrivningstid. Ta bort komponenter som inte är aktuella i steg 2 (fastighetens delar).`;
