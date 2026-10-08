import { randomBytes } from "crypto";
import type { OffertForfragan as OffertForfraganRad } from "@prisma/client";
import { arGiltigEpost, normaliseraEpost } from "@/lib/auth/epost";
import { prisma } from "@/lib/db";
import { hamtaOffertKontaktperson } from "@/lib/kontakt-epost";
import {
  arOffertTjanst,
  OFFERT_MAXLANGD,
  type OffertForfragan,
  type OffertForfraganInput,
  type OffertForfraganStatus,
} from "@/lib/offert-forfragan";

const TIMME_MS = 60 * 60 * 1000;
const MAX_PER_EPOST_OCH_TIMME = 5;
const MAX_TOTALT_PER_TIMME = 60;

export class OffertValideringsFel extends Error {}
export class OffertSkrapskyddFel extends Error {}

export type ValideradOffertForfragan = Omit<
  OffertForfragan,
  "id" | "status" | "skapad" | "senastOffertSkickad" | "internAnteckning"
>;

function trimMax(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function valideraOffertForfragan(
  input: Partial<OffertForfraganInput>,
): ValideradOffertForfragan {
  const foreningsNamn = trimMax(input.foreningsNamn, OFFERT_MAXLANGD.foreningsNamn);
  const kontaktperson = trimMax(input.kontaktperson, OFFERT_MAXLANGD.kontaktperson);
  const epost = normaliseraEpost(trimMax(input.epost, OFFERT_MAXLANGD.epost));
  if (!foreningsNamn || !kontaktperson || !epost) {
    throw new OffertValideringsFel("Fyll i föreningsnamn, kontaktperson och e-post.");
  }
  if (!arGiltigEpost(epost)) {
    throw new OffertValideringsFel("Ange en giltig e-postadress.");
  }
  const kontakt = hamtaOffertKontaktperson(String(input.oonskadKontaktId ?? ""));
  if (!kontakt) {
    throw new OffertValideringsFel("Välj vem ni vill kontakta.");
  }
  const tjanster = [
    ...new Set(Array.isArray(input.tjanster) ? input.tjanster : []),
  ].filter(arOffertTjanst);
  if (!tjanster.length) {
    throw new OffertValideringsFel("Välj minst en tjänst.");
  }
  return {
    foreningsNamn,
    kontaktperson,
    oonskadKontaktId: kontakt.id,
    epost,
    telefon: trimMax(input.telefon, OFFERT_MAXLANGD.telefon),
    antalLagenheter: trimMax(input.antalLagenheter, OFFERT_MAXLANGD.antalLagenheter),
    tjanster,
    meddelande: trimMax(input.meddelande, OFFERT_MAXLANGD.meddelande),
  };
}

export function tillOffertForfragan(rad: OffertForfraganRad): OffertForfragan {
  return {
    id: rad.id,
    foreningsNamn: rad.foreningsNamn,
    kontaktperson: rad.kontaktperson,
    oonskadKontaktId:
      hamtaOffertKontaktperson(rad.oonskadKontaktId)?.id ?? "offert",
    epost: rad.epost,
    telefon: rad.telefon,
    antalLagenheter: rad.antalLagenheter,
    tjanster: rad.tjanster.filter(arOffertTjanst),
    meddelande: rad.meddelande,
    status: rad.status as OffertForfraganStatus,
    skapad: rad.skapadTidpunkt.toISOString(),
    senastOffertSkickad: rad.senastOffertSkickad?.toISOString(),
    internAnteckning: rad.internAnteckning,
  };
}

async function kontrolleraSkrapskydd(epost: string): Promise<void> {
  const sedan = new Date(Date.now() - TIMME_MS);
  const [franEpost, totalt] = await Promise.all([
    prisma.offertForfragan.count({
      where: { epost, skapadTidpunkt: { gte: sedan } },
    }),
    prisma.offertForfragan.count({ where: { skapadTidpunkt: { gte: sedan } } }),
  ]);
  if (franEpost >= MAX_PER_EPOST_OCH_TIMME || totalt >= MAX_TOTALT_PER_TIMME) {
    throw new OffertSkrapskyddFel(
      "Många förfrågningar på kort tid — vänta en stund eller mejla oss direkt.",
    );
  }
}

export async function sparaOffertForfragan(
  data: ValideradOffertForfragan,
): Promise<OffertForfragan> {
  await kontrolleraSkrapskydd(data.epost);
  const rad = await prisma.offertForfragan.create({
    data: {
      id: `offert_${randomBytes(9).toString("base64url")}`,
      ...data,
    },
  });
  return tillOffertForfragan(rad);
}

export async function listaOffertForfragningar(): Promise<OffertForfragan[]> {
  const rader = await prisma.offertForfragan.findMany({
    orderBy: { skapadTidpunkt: "desc" },
    take: 500,
  });
  return rader.map(tillOffertForfragan);
}

export async function uppdateraOffertForfragan(
  id: string,
  patch: {
    status?: OffertForfraganStatus;
    internAnteckning?: string;
    offertSkickad?: boolean;
  },
): Promise<OffertForfragan | null> {
  const finns = await prisma.offertForfragan.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!finns) return null;
  const rad = await prisma.offertForfragan.update({
    where: { id },
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.internAnteckning !== undefined
        ? {
            internAnteckning: patch.internAnteckning
              .trim()
              .slice(0, OFFERT_MAXLANGD.internAnteckning),
          }
        : {}),
      ...(patch.offertSkickad
        ? { status: "offert-skickad", senastOffertSkickad: new Date() }
        : {}),
    },
  });
  return tillOffertForfragan(rad);
}
