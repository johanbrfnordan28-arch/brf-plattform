import type { FelanmalanArende, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";
import { kastaOmForeningBorttagen } from "@/lib/forening-borttag-server";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
  arGiltigRoll,
  arGiltigStatus,
  type FelanmalanArendeDto,
  type FelanmalanHistorikRad,
  type FelanmalanOrsak,
  type FelanmalanPrioritet,
  type FelanmalanStatus,
  type FelanmalanTilldeladRoll,
} from "@/lib/felanmalan/felanmalan-typer";

function parseHistorik(raw: unknown): FelanmalanHistorikRad[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is FelanmalanHistorikRad =>
      typeof r === "object" &&
      r != null &&
      typeof (r as FelanmalanHistorikRad).tidpunkt === "string" &&
      typeof (r as FelanmalanHistorikRad).text === "string",
  );
}

export function tillFelanmalanDto(rad: FelanmalanArende): FelanmalanArendeDto {
  const historik = parseHistorik(rad.historik);
  return {
    id: rad.id,
    foreningId: rad.foreningId,
    arendeNummer: rad.arendeNummer,
    status: arGiltigStatus(rad.status) ? rad.status : "inkommen",
    prioritet: arGiltigPrioritet(rad.prioritet) ? rad.prioritet : "normal",
    orsak: arGiltigOrsak(rad.orsak) ? rad.orsak : "ovrigt",
    rubrik: rad.rubrik,
    beskrivning: rad.beskrivning,
    medlemNamn: rad.medlemNamn,
    medlemEpost: rad.medlemEpost,
    medlemTelefon: rad.medlemTelefon,
    lagenhetsnummer: rad.lagenhetsnummer,
    debiteringKan: rad.debiteringKan,
    debiteringAnteckning: rad.debiteringAnteckning,
    nyckelPlats: rad.nyckelPlats,
    boendeEjHemma: rad.boendeEjHemma,
    tilldeladRoll: arGiltigRoll(rad.tilldeladRoll)
      ? rad.tilldeladRoll
      : "forvaltare",
    vidareEpost: rad.vidareEpost,
    historik,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    uppdateradTidpunkt: rad.uppdateradTidpunkt.toISOString(),
  };
}

async function nastaArendeNummer(foreningId: string): Promise<string> {
  const ar = new Date().getFullYear();
  const prefix = `FM-${ar}-`;
  const count = await prisma.felanmalanArende.count({
    where: {
      foreningId,
      arendeNummer: { startsWith: prefix },
    },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

function laggTillHistorik(
  befintlig: FelanmalanHistorikRad[],
  av: string,
  text: string,
): FelanmalanHistorikRad[] {
  return [
    ...befintlig,
    { tidpunkt: new Date().toISOString(), av, text },
  ];
}

export async function skapaFelanmalan(opts: {
  foreningId: string;
  rubrik: string;
  beskrivning: string;
  medlemNamn: string;
  medlemEpost: string;
  medlemTelefon?: string;
  lagenhetsnummer?: string;
  prioritet?: FelanmalanPrioritet;
  orsak?: FelanmalanOrsak;
  debiteringKan?: boolean;
  debiteringAnteckning?: string;
  nyckelPlats?: string;
  boendeEjHemma?: boolean;
}): Promise<FelanmalanArendeDto> {
  const forening = await prisma.forening.findUnique({
    where: { id: opts.foreningId },
  });
  if (!forening) throw new Error("Föreningen hittades inte.");
  kastaOmForeningBorttagen(forening);

  const arendeNummer = await nastaArendeNummer(opts.foreningId);
  const historik: FelanmalanHistorikRad[] = laggTillHistorik(
    [],
    opts.medlemNamn || "Medlem",
    "Felanmälan skickad in av medlem.",
  );

  const rad = await prisma.felanmalanArende.create({
    data: {
      id: skapaId("fel"),
      foreningId: opts.foreningId,
      arendeNummer,
      rubrik: opts.rubrik.trim(),
      beskrivning: opts.beskrivning.trim(),
      medlemNamn: opts.medlemNamn.trim(),
      medlemEpost: opts.medlemEpost.trim().toLowerCase(),
      medlemTelefon: opts.medlemTelefon?.trim() ?? "",
      lagenhetsnummer: opts.lagenhetsnummer?.trim() ?? "",
      prioritet: opts.prioritet ?? "normal",
      orsak: opts.orsak ?? "ovrigt",
      debiteringKan: Boolean(opts.debiteringKan),
      debiteringAnteckning: opts.debiteringAnteckning?.trim() ?? "",
      nyckelPlats: opts.nyckelPlats?.trim() ?? "",
      boendeEjHemma: Boolean(opts.boendeEjHemma),
      historik: historik as unknown as Prisma.InputJsonValue,
    },
  });

  return tillFelanmalanDto(rad);
}

export async function listaFelanmalan(
  foreningId: string,
): Promise<FelanmalanArendeDto[]> {
  const rader = await prisma.felanmalanArende.findMany({
    where: { foreningId },
    orderBy: [{ skapadTidpunkt: "desc" }],
  });
  return rader.map(tillFelanmalanDto);
}

export async function uppdateraFelanmalan(opts: {
  foreningId: string;
  arendeId: string;
  av: string;
  status?: FelanmalanStatus;
  prioritet?: FelanmalanPrioritet;
  orsak?: FelanmalanOrsak;
  tilldeladRoll?: FelanmalanTilldeladRoll;
  vidareEpost?: string;
  kommentar?: string;
  skickaMejlVidare?: boolean;
}): Promise<FelanmalanArendeDto> {
  const rad = await prisma.felanmalanArende.findFirst({
    where: { id: opts.arendeId, foreningId: opts.foreningId },
  });
  if (!rad) throw new Error("Ärendet hittades inte.");

  let historik = parseHistorik(rad.historik);
  const andringar: string[] = [];

  if (opts.status && opts.status !== rad.status) {
    andringar.push(`Status: ${rad.status} → ${opts.status}`);
  }
  if (opts.prioritet && opts.prioritet !== rad.prioritet) {
    andringar.push(`Prioritet: ${opts.prioritet}`);
  }
  if (opts.tilldeladRoll && opts.tilldeladRoll !== rad.tilldeladRoll) {
    andringar.push(`Tilldelad: ${opts.tilldeladRoll}`);
  }
  if (opts.kommentar?.trim()) {
    andringar.push(opts.kommentar.trim());
  }

  if (andringar.length > 0) {
    historik = laggTillHistorik(historik, opts.av, andringar.join(" · "));
  }

  const uppdaterad = await prisma.felanmalanArende.update({
    where: { id: rad.id },
    data: {
      status: opts.status ?? rad.status,
      prioritet: opts.prioritet ?? rad.prioritet,
      orsak: opts.orsak ?? rad.orsak,
      tilldeladRoll: opts.tilldeladRoll ?? rad.tilldeladRoll,
      vidareEpost: opts.vidareEpost?.trim() ?? rad.vidareEpost,
      historik: historik as unknown as Prisma.InputJsonValue,
    },
  });

  return tillFelanmalanDto(uppdaterad);
}
