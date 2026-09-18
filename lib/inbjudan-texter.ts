import { prisma } from "@/lib/db";
import { HUVUDSIDA_MASSA_QUERY } from "@/lib/massa-lank";

export type InbjudanTexter = {
  massaNamn: string;
  massaHuvudsidaRubrik: string;
  massaHuvudsidaIntro: string;
  massaMejlAmne: string;
  massaMejlMall: string;
  personligMejlAmne: string;
  personligMejlMall: string;
  mejlaLankRubrik: string;
  mejlaLankIntro: string;
};

export type InbjudanTexterDto = InbjudanTexter & {
  uppdateradTidpunkt: string;
  uppdateradAvEpost: string;
};

export const STANDARD_INBJUDAN_TEXTER: InbjudanTexter = {
  massaNamn: "styrelsemässan",
  massaHuvudsidaRubrik: "Välkommen från styrelsemässan",
  massaHuvudsidaIntro:
    "Tack för att ni tittade förbi vår monter. Här kan ni se hur Styrelse-Navet fungerar — underhållsplan, upphandling och styrelsestöd samlat. Prova gärna gratis i 30 dagar när ni vill.",
  massaMejlAmne: "Titta på Styrelse-Navet — {foreningsNamn}",
  massaMejlMall: [
    "{hälsning}",
    "",
    "Tack för att ni träffade oss på {massaNamn} ({foreningsNamn}).",
    "",
    "Här kan ni titta på plattformen i lugn och ro och bedöma om den passar er förening:",
    "",
    "{lank}",
    "",
    "Ni kan skapa en testförening gratis i 30 dagar — ingen bindning under provperioden.",
    "",
    "Hör av er om ni har frågor.",
    "",
    "Med vänlig hälsning",
    "Styrelse-Navet",
  ].join("\n"),
  personligMejlAmne: "Inbjudan till Styrelse-Navet — {foreningsNamn}",
  personligMejlMall: [
    "{hälsning}",
    "",
    "{avsandareNamn} vill bjuda in er till att titta på Styrelse-Navet för {foreningsNamn}.",
    "",
    "Plattformen samlar underhållsplan, upphandling och styrelsestöd — prova gärna gratis i 30 dagar:",
    "",
    "{lank}",
    "",
    "Ingen bindning under provperioden. Hör av er om ni har frågor.",
    "",
    "Med vänlig hälsning",
    "{avsandareNamn}",
    "Styrelse-Navet",
  ].join("\n"),
  mejlaLankRubrik: "Mejla mig en länk",
  mejlaLankIntro:
    "Inte redo att skapa föreningen nu? Lämna namn och e-post — vi mejlar en länk till huvudsidan så ni kan börja när det passar.",
};

function franDb(rad: {
  inbjudanMassaNamn: string;
  inbjudanMassaHuvudsidaRubrik: string;
  inbjudanMassaHuvudsidaIntro: string;
  inbjudanMassaMejlAmne: string;
  inbjudanMassaMejlMall: string;
  inbjudanPersonligMejlAmne: string;
  inbjudanPersonligMejlMall: string;
  inbjudanMejlaLankRubrik: string;
  inbjudanMejlaLankIntro: string;
  uppdateradTidpunkt: Date;
  uppdateradAvEpost: string;
}): InbjudanTexterDto {
  return {
    massaNamn: rad.inbjudanMassaNamn.trim() || STANDARD_INBJUDAN_TEXTER.massaNamn,
    massaHuvudsidaRubrik:
      rad.inbjudanMassaHuvudsidaRubrik.trim() ||
      STANDARD_INBJUDAN_TEXTER.massaHuvudsidaRubrik,
    massaHuvudsidaIntro:
      rad.inbjudanMassaHuvudsidaIntro.trim() ||
      STANDARD_INBJUDAN_TEXTER.massaHuvudsidaIntro,
    massaMejlAmne:
      rad.inbjudanMassaMejlAmne.trim() || STANDARD_INBJUDAN_TEXTER.massaMejlAmne,
    massaMejlMall:
      rad.inbjudanMassaMejlMall.trim() || STANDARD_INBJUDAN_TEXTER.massaMejlMall,
    personligMejlAmne:
      rad.inbjudanPersonligMejlAmne.trim() ||
      STANDARD_INBJUDAN_TEXTER.personligMejlAmne,
    personligMejlMall:
      rad.inbjudanPersonligMejlMall.trim() ||
      STANDARD_INBJUDAN_TEXTER.personligMejlMall,
    mejlaLankRubrik:
      rad.inbjudanMejlaLankRubrik.trim() ||
      STANDARD_INBJUDAN_TEXTER.mejlaLankRubrik,
    mejlaLankIntro:
      rad.inbjudanMejlaLankIntro.trim() ||
      STANDARD_INBJUDAN_TEXTER.mejlaLankIntro,
    uppdateradTidpunkt: rad.uppdateradTidpunkt.toISOString(),
    uppdateradAvEpost: rad.uppdateradAvEpost,
  };
}

export function publikaInbjudanTexter(
  texter: InbjudanTexter,
): Pick<
  InbjudanTexter,
  "massaNamn" | "massaHuvudsidaRubrik" | "massaHuvudsidaIntro" | "mejlaLankRubrik" | "mejlaLankIntro"
> {
  return {
    massaNamn: texter.massaNamn,
    massaHuvudsidaRubrik: texter.massaHuvudsidaRubrik,
    massaHuvudsidaIntro: texter.massaHuvudsidaIntro,
    mejlaLankRubrik: texter.mejlaLankRubrik,
    mejlaLankIntro: texter.mejlaLankIntro,
  };
}

export async function hamtaInbjudanTexter(): Promise<InbjudanTexterDto> {
  const rad = await prisma.plattformInstallning.findUnique({
    where: { id: "default" },
  });
  if (!rad) {
    return {
      ...STANDARD_INBJUDAN_TEXTER,
      uppdateradTidpunkt: new Date(0).toISOString(),
      uppdateradAvEpost: "",
    };
  }
  return franDb(rad);
}

export function hamtaInbjudanTexterStandard(): InbjudanTexterDto {
  return {
    ...STANDARD_INBJUDAN_TEXTER,
    uppdateradTidpunkt: new Date(0).toISOString(),
    uppdateradAvEpost: "",
  };
}

export async function sparaInbjudanTexter(opts: {
  texter: Partial<InbjudanTexter>;
  epost: string;
}): Promise<InbjudanTexterDto> {
  const nuvarande = await hamtaInbjudanTexter();
  const merged: InbjudanTexter = {
    massaNamn: opts.texter.massaNamn?.trim() || nuvarande.massaNamn,
    massaHuvudsidaRubrik:
      opts.texter.massaHuvudsidaRubrik?.trim() || nuvarande.massaHuvudsidaRubrik,
    massaHuvudsidaIntro:
      opts.texter.massaHuvudsidaIntro?.trim() || nuvarande.massaHuvudsidaIntro,
    massaMejlAmne: opts.texter.massaMejlAmne?.trim() || nuvarande.massaMejlAmne,
    massaMejlMall: opts.texter.massaMejlMall?.trim() || nuvarande.massaMejlMall,
    personligMejlAmne:
      opts.texter.personligMejlAmne?.trim() || nuvarande.personligMejlAmne,
    personligMejlMall:
      opts.texter.personligMejlMall?.trim() || nuvarande.personligMejlMall,
    mejlaLankRubrik:
      opts.texter.mejlaLankRubrik?.trim() || nuvarande.mejlaLankRubrik,
    mejlaLankIntro: opts.texter.mejlaLankIntro?.trim() || nuvarande.mejlaLankIntro,
  };

  const rad = await prisma.plattformInstallning.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      inbjudanMassaNamn: merged.massaNamn,
      inbjudanMassaHuvudsidaRubrik: merged.massaHuvudsidaRubrik,
      inbjudanMassaHuvudsidaIntro: merged.massaHuvudsidaIntro,
      inbjudanMassaMejlAmne: merged.massaMejlAmne,
      inbjudanMassaMejlMall: merged.massaMejlMall,
      inbjudanPersonligMejlAmne: merged.personligMejlAmne,
      inbjudanPersonligMejlMall: merged.personligMejlMall,
      inbjudanMejlaLankRubrik: merged.mejlaLankRubrik,
      inbjudanMejlaLankIntro: merged.mejlaLankIntro,
      uppdateradAvEpost: opts.epost,
    },
    update: {
      inbjudanMassaNamn: merged.massaNamn,
      inbjudanMassaHuvudsidaRubrik: merged.massaHuvudsidaRubrik,
      inbjudanMassaHuvudsidaIntro: merged.massaHuvudsidaIntro,
      inbjudanMassaMejlAmne: merged.massaMejlAmne,
      inbjudanMassaMejlMall: merged.massaMejlMall,
      inbjudanPersonligMejlAmne: merged.personligMejlAmne,
      inbjudanPersonligMejlMall: merged.personligMejlMall,
      inbjudanMejlaLankRubrik: merged.mejlaLankRubrik,
      inbjudanMejlaLankIntro: merged.mejlaLankIntro,
      uppdateradAvEpost: opts.epost,
    },
  });

  return franDb(rad);
}

export function fyllInbjudanMall(
  mall: string,
  variabler: Record<string, string>,
): string {
  return mall.replace(/\{(\w+)\}/g, (_, nyckel: string) => variabler[nyckel] ?? "");
}

export function huvudsidaMassaLank(basUrl: string): string {
  return `${basUrl.replace(/\/$/, "")}${HUVUDSIDA_MASSA_QUERY}`;
}

export function huvudsidaInbjudanLank(basUrl: string): string {
  return `${basUrl.replace(/\/$/, "")}/?kalla=inbjudan`;
}
