import { byggMassaInbjudanMejl } from "@/lib/forening-inbjudan-mejl";
import type { InbjudanTexter } from "@/lib/inbjudan-texter";

/** Mejlmall efter mässa / «mejla mig en länk» — länkar till huvudsidan. */
export function byggStyrelsemassaLankMejl(opts: {
  till: string;
  foreningsNamn: string;
  kontaktperson?: string;
  basUrl: string;
  texter?: InbjudanTexter;
}): { till: string; amne: string; brodtext: string } {
  return byggMassaInbjudanMejl(opts);
}
