/**
 * Användarvänd begreppsavgränsning — underlag till föreningens budget:
 * - Planerat underhåll = investeringar i fastigheten (fönsterbyte, takbyte, stambyte m.m.).
 * - Periodiskt underhåll = driftkostnader som kostnadsförs direkt det år de utförs.
 */

export const PLAN_BEGREPP = {
  underhallsplan: "Underhållsplan",
  arsbudgetSteg: "Underlag till årsbudgeten",
  arsbudgetStegKort: "Budgetunderlag",
  avsattning: "Avsättning",
  besiktningar: "Besiktningar",
  /**
   * Periodiskt underhåll / drift — kostnadsförs direkt i resultaträkningen.
   * (Tekniskt samma post som tidigare «kostnadsfört underhåll».)
   */
  direktkostnader: "Periodiskt underhåll",
  /** Kort kolumnrubrik */
  direktkostnaderKort: "Periodiskt",
  /**
   * Planerat underhåll — investeringar i fastigheten enligt planen.
   */
  investeringarPlan: "Planerat underhåll",
  utgifterArsbudget: "Summa i budgetunderlaget",
} as const;

export const FORKLARING_ARSBUDGET_VS_PLAN = `Detta är underlag till föreningens årsbudget. Här syns två typer av underhåll sida vid sida:

• Planerat underhåll — investeringar i fastigheten, t.ex. fönsterbyte, takbyte, stambyte och större fasadåtgärder. I bokföringen (K3) aktiveras de normalt som anläggningstillgång och skrivs av över tiden.

• Periodiskt underhåll — driftkostnader med återkommande intervall, t.ex. avloppsspolning och filmning. De kostnadsförs direkt det år de utförs och aktiveras inte.

Avsättning per m² och år samt besiktningar hör till budgetunderlaget tillsammans med det periodiska underhållet.`;

export const FORKLARING_AVSATTNING = `Avsättningen (kr/m² och år) är en jämn post som budgeteras varje år — så att medel finns när planerat underhåll (investeringar i fastigheten) ska genomföras.`;

export const FORKLARING_DIREKTKOSTNAD = `Periodiskt underhåll är återkommande driftkostnader (t.ex. spolning, filmning och liknande). De kostnadsförs direkt i resultaträkningen det år de utförs — de aktiveras inte som anläggningstillgång och skrivs därför inte av enligt K3.`;

export const FORKLARING_INVESTERING = `Planerat underhåll är investeringar i fastigheten enligt underhållsplanen — t.ex. fönsterbyte, takbyte, stambyte och större fasadåtgärder. I bokföringen (K3) aktiveras de normalt och skrivs av över komponentens nyttjandeperiod. Det ska inte förväxlas med periodiskt underhåll, som kostnadsförs direkt.`;

export const FORKLARING_K3 = `Från 2026 ska bostadsrättsföreningar tillämpa K3. Här ser ni uppskattade installationsvärden per komponent och en enkel avskrivningstid. Ta bort komponenter som inte är aktuella i steg 3.`;
