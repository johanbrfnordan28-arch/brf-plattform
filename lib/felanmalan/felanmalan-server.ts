import { Prisma, type FelanmalanArende, type Forening } from "@prisma/client";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";
import { kastaOmForeningBorttagen } from "@/lib/forening-borttag-server";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
  arGiltigRoll,
  arGiltigStatus,
  FELANMALAN_INSTALLNING_MAX,
  parseBilder,
  type FelanmalanArendeDto,
  type FelanmalanInstallningar,
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
    bilder: parseBilder(rad.bilder).map(({ id, contentType, storlekBytes }) => ({
      id,
      contentType,
      storlekBytes,
    })),
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    uppdateradTidpunkt: rad.uppdateradTidpunkt.toISOString(),
  };
}

async function nastaArendeNummer(foreningId: string): Promise<string> {
  const prefix = `FM-${new Date().getFullYear()}-`;
  const senaste = await prisma.felanmalanArende.findFirst({
    where: { foreningId, arendeNummer: { startsWith: prefix } },
    orderBy: { arendeNummer: "desc" },
    select: { arendeNummer: true },
  });
  const nr = senaste ? Number(senaste.arendeNummer.slice(prefix.length)) || 0 : 0;
  return `${prefix}${String(nr + 1).padStart(4, "0")}`;
}

function arUnikKrock(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

const SKRAPSKYDD = {
  perEpostPerTimme: 5,
  perForeningPerTimme: 30,
};

/** Kastar om samma avsändare eller förening skickat för många ärenden den senaste timmen. */
export async function kontrolleraSkrapskydd(
  foreningId: string,
  medlemEpost: string,
): Promise<void> {
  const sedan = new Date(Date.now() - 60 * 60 * 1000);
  const [perEpost, perForening] = await Promise.all([
    prisma.felanmalanArende.count({
      where: {
        foreningId,
        medlemEpost: normaliseraEpost(medlemEpost),
        skapadTidpunkt: { gte: sedan },
      },
    }),
    prisma.felanmalanArende.count({
      where: { foreningId, skapadTidpunkt: { gte: sedan } },
    }),
  ]);
  if (
    perEpost >= SKRAPSKYDD.perEpostPerTimme ||
    perForening >= SKRAPSKYDD.perForeningPerTimme
  ) {
    throw new SkrapskyddFel(
      "Många felanmälningar har skickats på kort tid. Vänta en stund och försök igen, eller kontakta styrelsen direkt.",
    );
  }
}

export class SkrapskyddFel extends Error {}

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

  const historik: FelanmalanHistorikRad[] = laggTillHistorik(
    [],
    opts.medlemNamn || "Medlem",
    "Felanmälan skickad in av medlem.",
  );

  for (let forsok = 0; ; forsok++) {
    try {
      const rad = await prisma.felanmalanArende.create({
        data: {
          id: skapaId("fel"),
          foreningId: opts.foreningId,
          arendeNummer: await nastaArendeNummer(opts.foreningId),
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
    } catch (e) {
      if (!arUnikKrock(e) || forsok >= 4) throw e;
    }
  }
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
}): Promise<{ arende: FelanmalanArendeDto; tidigareStatus: string }> {
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

  return { arende: tillFelanmalanDto(uppdaterad), tidigareStatus: rad.status };
}

function delaRader(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((r) => r.trim())
    .filter(Boolean);
}

export function tillInstallningar(rad: Forening): FelanmalanInstallningar {
  return {
    extraEpost: delaRader(rad.felanmalanExtraEpost),
    jourTelefon: rad.felanmalanJourTelefon,
    jourText: rad.felanmalanJourText,
    info: rad.felanmalanInfo,
  };
}

/** Alla som ska få mejl om nya ärenden — föreningens e-post plus extra mottagare. */
export function felanmalanMottagare(rad: Forening): string[] {
  const alla = [rad.epost, ...delaRader(rad.felanmalanExtraEpost)]
    .map(normaliseraEpost)
    .filter(arGiltigEpost);
  return [...new Set(alla)];
}

export async function sparaFelanmalanInstallningar(
  foreningId: string,
  input: Partial<FelanmalanInstallningar>,
): Promise<FelanmalanInstallningar> {
  const max = FELANMALAN_INSTALLNING_MAX;
  const extraEpost = (input.extraEpost ?? []).map(normaliseraEpost).filter(Boolean);
  const ogiltig = extraEpost.find((e) => !arGiltigEpost(e));
  if (ogiltig) throw new Error(`Ogiltig e-postadress: ${ogiltig}`);
  if (extraEpost.length > max.extraEpost) {
    throw new Error(`Högst ${max.extraEpost} extra mottagare.`);
  }
  const jourTelefon = (input.jourTelefon ?? "").trim();
  const jourText = (input.jourText ?? "").trim();
  const info = (input.info ?? "").trim();
  if (jourTelefon.length > max.jourTelefon) throw new Error("Journumret är för långt.");
  if (jourText.length > max.jourText) throw new Error("Jourtexten är för lång.");
  if (info.length > max.info) {
    throw new Error(`Informationen får vara högst ${max.info} tecken.`);
  }

  const rad = await prisma.forening.update({
    where: { id: foreningId },
    data: {
      felanmalanExtraEpost: [...new Set(extraEpost)].join("\n"),
      felanmalanJourTelefon: jourTelefon,
      felanmalanJourText: jourText,
      felanmalanInfo: info,
    },
  });
  return tillInstallningar(rad);
}
