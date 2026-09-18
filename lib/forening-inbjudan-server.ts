import { prisma } from "@/lib/db";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import { skickaMejl } from "@/lib/auth/mejl";
import { skapaId } from "@/lib/auth/session";
import { byggPersonligInbjudanMejl } from "@/lib/forening-inbjudan-mejl";
import { hamtaInbjudanTexter } from "@/lib/inbjudan-texter";
import { hamtaPersonligInbjudanMall } from "@/lib/inbjudan-mall-server";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
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
  inbjudanMallId: string | null;
  inbjudanMallTitel: string;
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
    inbjudanMallId: rad.inbjudanMallId,
    inbjudanMallTitel: rad.inbjudanMallTitel,
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
  mallId?: string;
}): Promise<{ lead: StyrelsemassaLeadDto; mejlVia: string; mejlSkickades: boolean }> {
  const foreningsNamn = input.foreningsNamn.trim();
  const epost = normaliseraEpost(input.epost);
  const kontaktperson = (input.kontaktperson ?? "").trim();
  const avsandareNamn = input.avsandareNamn.trim();
  const inbjudenAvEpost = input.inbjudenAvEpost.trim();

  if (!foreningsNamn) throw new Error("Ange föreningens namn.");
  if (!arGiltigEpost(epost)) throw new Error("Ange en giltig e-postadress.");
  const texter = await hamtaInbjudanTexter();
  let mejlAmne: string | undefined;
  let mejlMall: string | undefined;
  let mallTitel = "";
  let mallId: string | null = null;
  let mallAvsandare = "";

  if (input.mallId?.trim()) {
    const mall = await hamtaPersonligInbjudanMall(
      input.mallId.trim(),
      inbjudenAvEpost,
    );
    if (!mall) throw new Error("Inbjudningsmallen hittades inte.");
    mejlAmne = mall.mejlAmne;
    mejlMall = mall.mejlMall;
    mallTitel = mall.titel;
    mallId = mall.id;
    mallAvsandare = mall.avsandareNamn;
  }

  const effektivAvsandare = avsandareNamn || mallAvsandare;
  if (!effektivAvsandare) {
    throw new Error("Ange vem inbjudan kommer från, eller välj en mall med avsändarnamn.");
  }

  const mejl = byggPersonligInbjudanMejl({
    till: epost,
    foreningsNamn,
    kontaktperson,
    avsandareNamn: effektivAvsandare,
    basUrl: input.basUrl,
    texter,
    mejlAmne,
    mejlMall,
  });

  const mejlResultat = await skickaMejl(mejl);
  const levererat = mejlSkickades(mejlResultat.via);

  const skapad = await prisma.styrelsemassaLead.create({
    data: {
      id: skapaId("inbj"),
      foreningsNamn,
      epost,
      epostNyckel: epost,
      kontaktperson,
      kalla: "personal",
      inbjudenAvNamn: effektivAvsandare,
      inbjudenAvEpost,
      inbjudanMallId: mallId,
      inbjudanMallTitel: mallTitel,
      mejlSkickad: levererat,
    },
  });

  return {
    lead: tillDto(skapad),
    mejlVia: mejlResultat.via,
    mejlSkickades: levererat,
  };
}
