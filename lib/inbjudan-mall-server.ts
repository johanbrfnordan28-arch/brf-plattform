import { prisma } from "@/lib/db";
import { normaliseraEpost } from "@/lib/auth/epost";
import { skapaId } from "@/lib/auth/session";

export type PersonligInbjudanMallDto = {
  id: string;
  agareEpost: string;
  titel: string;
  avsandareNamn: string;
  mejlAmne: string;
  mejlMall: string;
  arStandard: boolean;
  skapadTidpunkt: string;
  uppdateradTidpunkt: string;
  /** True om inloggad användare äger mallen. */
  kanRedigera: boolean;
};

function tillDto(
  rad: {
    id: string;
    agareEpost: string;
    titel: string;
    avsandareNamn: string;
    mejlAmne: string;
    mejlMall: string;
    arStandard: boolean;
    skapadTidpunkt: Date;
    uppdateradTidpunkt: Date;
  },
  inloggadEpost: string,
): PersonligInbjudanMallDto {
  return {
    id: rad.id,
    agareEpost: rad.agareEpost,
    titel: rad.titel,
    avsandareNamn: rad.avsandareNamn,
    mejlAmne: rad.mejlAmne,
    mejlMall: rad.mejlMall,
    arStandard: rad.arStandard,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    uppdateradTidpunkt: rad.uppdateradTidpunkt.toISOString(),
    kanRedigera: rad.agareEpost === normaliseraEpost(inloggadEpost),
  };
}

export async function listaPersonligaInbjudanMallar(
  inloggadEpost: string,
): Promise<PersonligInbjudanMallDto[]> {
  const rader = await prisma.personligInbjudanMall.findMany({
    orderBy: [{ agareEpost: "asc" }, { titel: "asc" }],
  });
  return rader.map((r) => tillDto(r, inloggadEpost));
}

export async function hamtaPersonligInbjudanMall(
  id: string,
  inloggadEpost: string,
): Promise<PersonligInbjudanMallDto | null> {
  const rad = await prisma.personligInbjudanMall.findUnique({ where: { id } });
  if (!rad) return null;
  return tillDto(rad, inloggadEpost);
}

export async function hamtaStandardInbjudanMall(
  agareEpost: string,
): Promise<PersonligInbjudanMallDto | null> {
  const epost = normaliseraEpost(agareEpost);
  const rad = await prisma.personligInbjudanMall.findFirst({
    where: { agareEpost: epost, arStandard: true },
  });
  if (!rad) return null;
  return tillDto(rad, epost);
}

async function sattSomEndaStandard(agareEpost: string, mallId: string) {
  await prisma.personligInbjudanMall.updateMany({
    where: { agareEpost, id: { not: mallId } },
    data: { arStandard: false },
  });
}

export async function skapaPersonligInbjudanMall(opts: {
  agareEpost: string;
  titel: string;
  avsandareNamn?: string;
  mejlAmne: string;
  mejlMall: string;
  arStandard?: boolean;
}): Promise<PersonligInbjudanMallDto> {
  const agareEpost = normaliseraEpost(opts.agareEpost);
  const titel = opts.titel.trim();
  const mejlAmne = opts.mejlAmne.trim();
  const mejlMall = opts.mejlMall.trim();

  if (!titel) throw new Error("Ge mallen ett namn.");
  if (!mejlAmne) throw new Error("Ange mejlamne.");
  if (!mejlMall) throw new Error("Ange mejltext.");

  const id = skapaId("mall");
  const arStandard = opts.arStandard === true;

  const skapad = await prisma.personligInbjudanMall.create({
    data: {
      id,
      agareEpost,
      titel,
      avsandareNamn: opts.avsandareNamn?.trim() ?? "",
      mejlAmne,
      mejlMall,
      arStandard,
    },
  });

  if (arStandard) {
    await sattSomEndaStandard(agareEpost, id);
  }

  return tillDto(skapad, agareEpost);
}

export async function uppdateraPersonligInbjudanMall(opts: {
  id: string;
  agareEpost: string;
  titel?: string;
  avsandareNamn?: string;
  mejlAmne?: string;
  mejlMall?: string;
  arStandard?: boolean;
}): Promise<PersonligInbjudanMallDto> {
  const agareEpost = normaliseraEpost(opts.agareEpost);
  const befintlig = await prisma.personligInbjudanMall.findUnique({
    where: { id: opts.id },
  });
  if (!befintlig || befintlig.agareEpost !== agareEpost) {
    throw new Error("Du kan bara redigera dina egna mallar.");
  }

  const uppdaterad = await prisma.personligInbjudanMall.update({
    where: { id: opts.id },
    data: {
      ...(opts.titel !== undefined ? { titel: opts.titel.trim() } : {}),
      ...(opts.avsandareNamn !== undefined
        ? { avsandareNamn: opts.avsandareNamn.trim() }
        : {}),
      ...(opts.mejlAmne !== undefined ? { mejlAmne: opts.mejlAmne.trim() } : {}),
      ...(opts.mejlMall !== undefined ? { mejlMall: opts.mejlMall.trim() } : {}),
      ...(opts.arStandard !== undefined ? { arStandard: opts.arStandard } : {}),
    },
  });

  if (uppdaterad.arStandard) {
    await sattSomEndaStandard(agareEpost, uppdaterad.id);
  }

  return tillDto(uppdaterad, agareEpost);
}

export async function taBortPersonligInbjudanMall(opts: {
  id: string;
  agareEpost: string;
}): Promise<void> {
  const agareEpost = normaliseraEpost(opts.agareEpost);
  const befintlig = await prisma.personligInbjudanMall.findUnique({
    where: { id: opts.id },
  });
  if (!befintlig || befintlig.agareEpost !== agareEpost) {
    throw new Error("Du kan bara ta bort dina egna mallar.");
  }
  await prisma.personligInbjudanMall.delete({ where: { id: opts.id } });
}
