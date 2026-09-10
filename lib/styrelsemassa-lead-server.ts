import { prisma } from "@/lib/db";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import { skickaMejl } from "@/lib/auth/mejl";
import { skapaId } from "@/lib/auth/session";
import { byggStyrelsemassaLankMejl } from "@/lib/styrelsemassa-mejl";
import { hamtaInbjudanTexter } from "@/lib/inbjudan-texter";

export type StyrelsemassaLeadKalla = "massa_sjalv" | "personal" | "massa_lank";

export type StyrelsemassaLeadDto = {
  id: string;
  foreningsNamn: string;
  epost: string;
  kontaktperson: string;
  telefon: string;
  status: "lank_skickad" | "skapade_test";
  kalla: StyrelsemassaLeadKalla;
  inbjudenAvNamn: string;
  inbjudenAvEpost: string;
  foreningId: string | null;
  skapadTidpunkt: string;
  testSkapadTidpunkt: string | null;
  mejlSkickad: boolean;
  /** Om kopplad förening finns: test | kund | utgangen */
  foreningStatus?: string | null;
};

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
  const kalla: StyrelsemassaLeadKalla =
    rad.kalla === "personal" || rad.kalla === "massa_lank"
      ? rad.kalla
      : "massa_sjalv";
  return {
    id: rad.id,
    foreningsNamn: rad.foreningsNamn,
    epost: rad.epost,
    kontaktperson: rad.kontaktperson,
    telefon: rad.telefon,
    status: rad.status === "skapade_test" ? "skapade_test" : "lank_skickad",
    kalla,
    inbjudenAvNamn: rad.inbjudenAvNamn,
    inbjudenAvEpost: rad.inbjudenAvEpost,
    foreningId: rad.foreningId,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    testSkapadTidpunkt: rad.testSkapadTidpunkt?.toISOString() ?? null,
    mejlSkickad: rad.mejlSkickad,
  };
}

export async function skickaStyrelsemassaLank(input: {
  foreningsNamn: string;
  epost: string;
  kontaktperson?: string;
  telefon?: string;
  basUrl: string;
}): Promise<StyrelsemassaLeadDto> {
  const foreningsNamn = input.foreningsNamn.trim();
  const epost = normaliseraEpost(input.epost);
  const kontaktperson = (input.kontaktperson ?? "").trim();
  const telefon = (input.telefon ?? "").trim();

  if (!foreningsNamn) throw new Error("Ange föreningens namn.");
  if (!arGiltigEpost(epost)) throw new Error("Ange en giltig e-postadress.");

  const texter = await hamtaInbjudanTexter();
  const mejl = byggStyrelsemassaLankMejl({
    till: epost,
    foreningsNamn,
    kontaktperson,
    basUrl: input.basUrl,
    texter,
  });

  await skickaMejl(mejl);

  const befintlig = await prisma.styrelsemassaLead.findFirst({
    where: { epostNyckel: epost, status: "lank_skickad" },
    orderBy: { skapadTidpunkt: "desc" },
  });

  if (befintlig) {
    const uppdaterad = await prisma.styrelsemassaLead.update({
      where: { id: befintlig.id },
      data: {
        foreningsNamn,
        kontaktperson,
        telefon,
        mejlSkickad: true,
      },
    });
    return tillDto(uppdaterad);
  }

  const skapad = await prisma.styrelsemassaLead.create({
    data: {
      id: skapaId("massa"),
      foreningsNamn,
      epost,
      epostNyckel: epost,
      kontaktperson,
      telefon,
      kalla: "massa_sjalv",
      mejlSkickad: true,
    },
  });

  return tillDto(skapad);
}

export async function markeraStyrelsemassaLeadSomSkapadeTest(opts: {
  epost: string;
  foreningId: string;
}): Promise<void> {
  const epostNyckel = normaliseraEpost(opts.epost);
  const nu = new Date();

  await prisma.styrelsemassaLead.updateMany({
    where: { epostNyckel },
    data: {
      status: "skapade_test",
      foreningId: opts.foreningId,
      testSkapadTidpunkt: nu,
    },
  });
}

export async function listaStyrelsemassaLeads(): Promise<{
  leads: StyrelsemassaLeadDto[];
  sammanfattning: {
    totalt: number;
    lankSkickad: number;
    skapadeTest: number;
    enbartTest: number;
  };
}> {
  const rader = await prisma.styrelsemassaLead.findMany({
    orderBy: { skapadTidpunkt: "desc" },
  });

  const foreningIds = rader
    .map((r) => r.foreningId)
    .filter((id): id is string => Boolean(id));

  const foreningar =
    foreningIds.length > 0
      ? await prisma.forening.findMany({
          where: { id: { in: foreningIds } },
          select: {
            id: true,
            avtalGodkant: true,
            skapadTidpunkt: true,
          },
        })
      : [];

  const foreningMap = new Map(foreningar.map((f) => [f.id, f]));

  const leads = rader.map((rad) => {
    const dto = tillDto(rad);
    const forening = rad.foreningId
      ? foreningMap.get(rad.foreningId)
      : undefined;
    if (!forening) return dto;
    dto.foreningStatus = forening.avtalGodkant ? "kund" : "test";
    return dto;
  });

  const skapadeTest = leads.filter((l) => l.status === "skapade_test").length;
  const enbartTest = leads.filter(
    (l) => l.status === "skapade_test" && l.foreningStatus === "test",
  ).length;

  return {
    leads,
    sammanfattning: {
      totalt: leads.length,
      lankSkickad: leads.filter((l) => l.status === "lank_skickad").length,
      skapadeTest,
      enbartTest,
    },
  };
}
