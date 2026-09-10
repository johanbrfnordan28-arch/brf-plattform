import {
  fyllInbjudanMall,
  hamtaInbjudanTexterStandard,
  huvudsidaInbjudanLank,
  huvudsidaMassaLank,
  type InbjudanTexter,
} from "@/lib/inbjudan-texter";

function byggHalsning(kontaktperson?: string): string {
  const namn = kontaktperson?.trim();
  return namn ? `Hej ${namn},` : "Hej,";
}

export function byggMassaInbjudanMejl(opts: {
  till: string;
  foreningsNamn: string;
  kontaktperson?: string;
  basUrl: string;
  texter?: InbjudanTexter;
}): { till: string; amne: string; brodtext: string } {
  const texter = opts.texter ?? hamtaInbjudanTexterStandard();
  const lank = huvudsidaMassaLank(opts.basUrl);
  const variabler = {
    hälsning: byggHalsning(opts.kontaktperson),
    foreningsNamn: opts.foreningsNamn.trim(),
    massaNamn: texter.massaNamn,
    lank,
  };

  return {
    till: opts.till,
    amne: fyllInbjudanMall(texter.massaMejlAmne, variabler),
    brodtext: fyllInbjudanMall(texter.massaMejlMall, variabler),
  };
}

export function byggPersonligInbjudanMejl(opts: {
  till: string;
  foreningsNamn: string;
  kontaktperson?: string;
  avsandareNamn: string;
  basUrl: string;
  texter?: InbjudanTexter;
}): { till: string; amne: string; brodtext: string } {
  const texter = opts.texter ?? hamtaInbjudanTexterStandard();
  const lank = huvudsidaInbjudanLank(opts.basUrl);
  const avsandareNamn = opts.avsandareNamn.trim() || "Styrelse-Navet";
  const variabler = {
    hälsning: byggHalsning(opts.kontaktperson),
    foreningsNamn: opts.foreningsNamn.trim(),
    avsandareNamn,
    lank,
    massaNamn: texter.massaNamn,
  };

  return {
    till: opts.till,
    amne: fyllInbjudanMall(texter.personligMejlAmne, variabler),
    brodtext: fyllInbjudanMall(texter.personligMejlMall, variabler),
  };
}
