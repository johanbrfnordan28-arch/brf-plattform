import { prisma } from "@/lib/db";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import { skickaMejl } from "@/lib/auth/mejl";
import { skapaId } from "@/lib/auth/session";
import { byggPersonligInbjudanMejl } from "@/lib/forening-inbjudan-mejl";
import { hamtaInbjudanTexter } from "@/lib/inbjudan-texter";
import type { StyrelsemassaLeadDto } from "@/lib/styrelsemassa-lead-server";

function tillDto(rad: {
  id: string;
  foreningsNamn: string;
  epost: string;
  kontaktperson: string;
  telefon: string;
  status: string;
  kalla: string;
  inbjudenAvNamn: string;
  inbjudenAvEpost: string;
  foreningId: string | null;
  skapadTidpunkt: Date;
  testSkapadTidpunkt: Date | null;
  mejlSkickad: boolean;
}): StyrelsemassaLeadDto {
  return {
    id: rad.id,
    foreningsNamn: rad.foreningsNamn,
    epost: rad.epost,
    kontaktperson: rad.kontaktperson,
    telefon: rad.telefon,
    status: rad.status === "skapade_test" ? "skapade_test" : "lank_skickad",
    kalla:
      rad.kalla === "personal" || rad.kalla === "massa_lank"
        ? rad.kalla
        : "massa_sjalv",
    inbjudenAvNamn: rad.inbjudenAvNamn,
    inbjudenAvEpost: rad.inbjudenAvEpost,
    foreningId: rad.foreningId,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    testSkapadTidpunkt: rad.testSkapadTidpunkt?.toISOString() ?? null,
    mejlSkickad: rad.mejlSkickad,
  };
}

export async function skickaPersonligForeningsinbjudan(input: {
  foreningsNamn: string;
  epost: string;
  kontaktperson?: string;
  avsandareNamn: string;
  inbjudenAvEpost: string;
  basUrl: string;
}): Promise<StyrelsemassaLeadDto> {
  const foreningsNamn = input.foreningsNamn.trim();
  const epost = normaliseraEpost(input.epost);
  const kontaktperson = (input.kontaktperson ?? "").trim();
  const avsandareNamn = input.avsandareNamn.trim();
  const inbjudenAvEpost = input.inbjudenAvEpost.trim();

  if (!foreningsNamn) throw new Error("Ange föreningens namn.");
  if (!arGiltigEpost(epost)) throw new Error("Ange en giltig e-postadress.");
  if (!avsandareNamn) throw new Error("Ange vem inbjudan kommer från.");

  const texter = await hamtaInbjudanTexter();
  const mejl = byggPersonligInbjudanMejl({
    till: epost,
    foreningsNamn,
    kontaktperson,
    avsandareNamn,
    basUrl: input.basUrl,
    texter,
  });

  await skickaMejl(mejl);

  const skapad = await prisma.styrelsemassaLead.create({
    data: {
      id: skapaId("inbj"),
      foreningsNamn,
      epost,
      epostNyckel: epost,
      kontaktperson,
      kalla: "personal",
      inbjudenAvNamn: avsandareNamn,
      inbjudenAvEpost,
      mejlSkickad: true,
    },
  });

  return tillDto(skapad);
}
