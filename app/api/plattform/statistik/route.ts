import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

/** Aggregerad inloggningsstatistik för plattformsadmin. */
export async function GET() {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  const nu = Date.now();
  const dygn = 24 * 60 * 60 * 1000;
  const sedan7 = new Date(nu - 7 * dygn);
  const sedan1 = new Date(nu - dygn);

  const [totalt, lyckade7, lyckade1, misslyckade7, konton, senaste] =
    await Promise.all([
      prisma.inloggningsHistorik.count(),
      prisma.inloggningsHistorik.count({
        where: { lyckad: true, tidpunkt: { gte: sedan7 } },
      }),
      prisma.inloggningsHistorik.count({
        where: { lyckad: true, tidpunkt: { gte: sedan1 } },
      }),
      prisma.inloggningsHistorik.count({
        where: { lyckad: false, tidpunkt: { gte: sedan7 } },
      }),
      prisma.konto.findMany({
        where: { typ: "STYRELSE", aktiv: true },
        select: {
          id: true,
          epost: true,
          namn: true,
          senasteInloggning: true,
          medlemskap: {
            select: {
              roll: true,
              forening: { select: { id: true, namn: true } },
            },
          },
        },
        orderBy: { senasteInloggning: "desc" },
      }),
      prisma.inloggningsHistorik.findMany({
        orderBy: { tidpunkt: "desc" },
        take: 50,
        include: { forening: { select: { namn: true } } },
      }),
    ]);

  const unika7 = await prisma.inloggningsHistorik.findMany({
    where: { lyckad: true, tidpunkt: { gte: sedan7 } },
    select: { epost: true },
    distinct: ["epost"],
  });

  return NextResponse.json({
    statistik: {
      totaltHandelser: totalt,
      lyckade24Timmar: lyckade1,
      lyckade7Dagar: lyckade7,
      misslyckade7Dagar: misslyckade7,
      unikaAnvandare7Dagar: unika7.length,
      antalStyrelseKonton: konton.length,
    },
    kontonMedInloggning: konton.map((k) => ({
      kontoId: k.id,
      epost: k.epost,
      namn: k.namn,
      senasteInloggning: k.senasteInloggning?.toISOString() ?? null,
      foreningar: k.medlemskap.map((m) => ({
        id: m.forening.id,
        namn: m.forening.namn,
        roll: m.roll,
      })),
    })),
    senasteInloggningar: senaste.map((h) => ({
      id: h.id,
      epost: h.epost,
      typ: h.typ,
      lyckad: h.lyckad,
      foreningsNamn: h.forening?.namn ?? null,
      tidpunkt: h.tidpunkt.toISOString(),
      ip: h.ip,
    })),
  });
}
