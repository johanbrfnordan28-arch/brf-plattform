import { prisma } from "@/lib/db";
import { arProvoperiodUtgangen, PROVOPERIODE_DAGAR } from "@/lib/forening-avtal";
import {
  flyttaForeningTillBorttagna,
  GALLRING_AV_EPOST,
  raderaForeningMedKonton,
} from "@/lib/forening-borttag-server";
import {
  arStandardTestForening,
  GRUNDMALL_FORENING_ID,
} from "@/lib/forening-konstanter";
import { GALLRING_MANADER } from "@/lib/juridik";

/** Utgångna testföreningar ligger i «Borttagna» så här länge innan de raderas. */
const BORTTAGNA_ANGERFRIST_DAGAR = 30;

const DAG_MS = 24 * 60 * 60 * 1000;

function manaderSedan(manader: number, nu: Date): Date {
  const d = new Date(nu);
  d.setMonth(d.getMonth() - manader);
  return d;
}

export type GallringResultat = {
  inloggningar: number;
  intresseanmalningar: number;
  mejl: number;
  testforeningarFlyttade: string[];
  testforeningarRaderade: string[];
};

export async function korGallring(nu = new Date()): Promise<GallringResultat> {
  const [inloggningar, leads, mejl] = await Promise.all([
    prisma.inloggningsHistorik.deleteMany({
      where: {
        tidpunkt: {
          lt: manaderSedan(GALLRING_MANADER.inloggningshistorik, nu),
        },
      },
    }),
    prisma.styrelsemassaLead.deleteMany({
      where: {
        skapadTidpunkt: {
          lt: manaderSedan(GALLRING_MANADER.intresseanmalningar, nu),
        },
      },
    }),
    prisma.mejlOutbox.deleteMany({
      where: {
        skapadTidpunkt: { lt: manaderSedan(GALLRING_MANADER.mejlOutbox, nu) },
      },
    }),
  ]);

  const kandidater = await prisma.forening.findMany({
    where: {
      avtalGodkant: false,
      borttagenTidpunkt: null,
      gallringUndantag: false,
      skapadTidpunkt: { lt: new Date(nu.getTime() - PROVOPERIODE_DAGAR * DAG_MS) },
    },
    select: { id: true, skapadTidpunkt: true },
  });
  const testforeningarFlyttade: string[] = [];
  for (const f of kandidater) {
    if (f.id === GRUNDMALL_FORENING_ID || arStandardTestForening(f.id)) continue;
    if (
      !arProvoperiodUtgangen({
        skapadTidpunkt: f.skapadTidpunkt.toISOString(),
        avtalGodkant: false,
        nu,
      })
    ) {
      continue;
    }
    await flyttaForeningTillBorttagna({
      foreningId: f.id,
      avEpost: GALLRING_AV_EPOST,
    });
    testforeningarFlyttade.push(f.id);
  }

  const attRadera = await prisma.forening.findMany({
    where: {
      avtalGodkant: false,
      borttagenAvEpost: GALLRING_AV_EPOST,
      borttagenTidpunkt: {
        lt: new Date(nu.getTime() - BORTTAGNA_ANGERFRIST_DAGAR * DAG_MS),
      },
    },
    select: { id: true },
  });
  const testforeningarRaderade: string[] = [];
  for (const f of attRadera) {
    await raderaForeningMedKonton(f.id);
    testforeningarRaderade.push(f.id);
  }

  return {
    inloggningar: inloggningar.count,
    intresseanmalningar: leads.count,
    mejl: mejl.count,
    testforeningarFlyttade,
    testforeningarRaderade,
  };
}
