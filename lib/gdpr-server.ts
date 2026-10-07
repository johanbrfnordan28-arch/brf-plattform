import { normaliseraEpost } from "@/lib/auth/epost";
import { prisma } from "@/lib/db";

const ANONYM_NAMN = "Uppgift raderad";

/** Allt servern har om en förening — hashar och hemliga nycklar utelämnas. */
export async function exporteraForening(foreningId: string) {
  const forening = await prisma.forening.findUnique({
    where: { id: foreningId },
    include: {
      medlemmar: { include: { konto: true } },
      felanmalan: { orderBy: { skapadTidpunkt: "asc" } },
      inloggningar: { orderBy: { tidpunkt: "asc" } },
      sakerhetskopior: { orderBy: { skapadTidpunkt: "asc" } },
    },
  });
  if (!forening) throw new Error("Föreningen finns inte.");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessNyckelHash, medlemmar, ...uppgifter } = forening;
  const leads = await prisma.styrelsemassaLead.findMany({
    where: { foreningId },
  });

  return {
    format: "styrelse-navet-gdpr-export-forening",
    exporteradTidpunkt: new Date().toISOString(),
    forening: {
      ...uppgifter,
      styrelse: medlemmar.map((m) => ({
        roll: m.roll,
        epost: m.konto.epost,
        namn: m.konto.namn,
        bankidKopplat: Boolean(m.konto.personnummerNyckel),
        medlemSedan: m.skapadTidpunkt,
      })),
    },
    intresseanmalningar: leads,
  };
}

/** Allt servern har om en person, sökt på e-postadress. */
export async function exporteraPerson(epostRaw: string) {
  const epost = normaliseraEpost(epostRaw);
  if (!epost) throw new Error("Ange en e-postadress.");

  const konto = await prisma.konto.findUnique({
    where: { epostNyckel: epost },
    include: { medlemskap: { include: { forening: true } } },
  });
  const [inloggningar, leads, felanmalan, mejl] = await Promise.all([
    prisma.inloggningsHistorik.findMany({
      where: { OR: [{ epost: { equals: epost, mode: "insensitive" } }, ...(konto ? [{ kontoId: konto.id }] : [])] },
      orderBy: { tidpunkt: "asc" },
    }),
    prisma.styrelsemassaLead.findMany({ where: { epostNyckel: epost } }),
    prisma.felanmalanArende.findMany({
      where: { medlemEpost: epost },
      include: { forening: { select: { namn: true } } },
    }),
    prisma.mejlOutbox.findMany({ where: { till: { equals: epost, mode: "insensitive" } } }),
  ]);

  return {
    format: "styrelse-navet-gdpr-export-person",
    exporteradTidpunkt: new Date().toISOString(),
    epost,
    konto: konto
      ? {
          epost: konto.epost,
          namn: konto.namn,
          typ: konto.typ,
          aktiv: konto.aktiv,
          bankidKopplat: Boolean(konto.personnummerNyckel),
          senasteInloggning: konto.senasteInloggning,
          skapadTidpunkt: konto.skapadTidpunkt,
          styrelseuppdrag: konto.medlemskap.map((m) => ({
            forening: m.forening.namn,
            roll: m.roll,
            sedan: m.skapadTidpunkt,
          })),
        }
      : null,
    inloggningshistorik: inloggningar,
    intresseanmalningar: leads,
    felanmalningar: felanmalan.map(({ forening, ...arende }) => ({
      forening: forening.namn,
      ...arende,
    })),
    skickadeMejl: mejl,
  };
}

export type RaderaPersonResultat = {
  kontoRaderat: boolean;
  inloggningar: number;
  intresseanmalningar: number;
  felanmalningarAnonymiserade: number;
  mejl: number;
};

/**
 * Raderar personens konto och uppgifter. Felanmälningar anonymiseras i stället
 * för att raderas — ärendet tillhör föreningen.
 */
export async function raderaPerson(
  epostRaw: string,
): Promise<RaderaPersonResultat> {
  const epost = normaliseraEpost(epostRaw);
  if (!epost) throw new Error("Ange en e-postadress.");

  const konto = await prisma.konto.findUnique({
    where: { epostNyckel: epost },
    include: { medlemskap: { include: { forening: true } } },
  });
  if (konto?.typ === "PLATTFORM") {
    throw new Error("Personalkonton raderas inte härifrån.");
  }
  if (konto) {
    const ensamI: string[] = [];
    for (const m of konto.medlemskap) {
      if (m.forening.borttagenTidpunkt) continue;
      const antal = await prisma.foreningMedlem.count({
        where: { foreningId: m.foreningId },
      });
      if (antal <= 1) ensamI.push(m.forening.namn);
    }
    if (ensamI.length > 0) {
      throw new Error(
        `Personen är ensam i styrelsen för ${ensamI.join(", ")}. Lägg till någon annan i styrelsen eller ta bort föreningen först, annars kan ingen logga in där.`,
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const inloggningar = await tx.inloggningsHistorik.deleteMany({
      where: { OR: [{ epost: { equals: epost, mode: "insensitive" } }, ...(konto ? [{ kontoId: konto.id }] : [])] },
    });
    if (konto) await tx.konto.delete({ where: { id: konto.id } });
    const leads = await tx.styrelsemassaLead.deleteMany({
      where: { epostNyckel: epost },
    });
    const felanmalan = await tx.felanmalanArende.updateMany({
      where: { medlemEpost: epost },
      data: { medlemNamn: ANONYM_NAMN, medlemEpost: "", medlemTelefon: "" },
    });
    const mejl = await tx.mejlOutbox.deleteMany({ where: { till: { equals: epost, mode: "insensitive" } } });
    return {
      kontoRaderat: Boolean(konto),
      inloggningar: inloggningar.count,
      intresseanmalningar: leads.count,
      felanmalningarAnonymiserade: felanmalan.count,
      mejl: mejl.count,
    };
  });
}
