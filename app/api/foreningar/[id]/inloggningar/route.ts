import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

/**
 * Översikt: vilka som har inloggning + inloggningsstatistik för en förening.
 * Visar aldrig andras lösenord.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const { id: foreningId } = await ctx.params;
  const session = await lasSession();
  if (!session) {
    return NextResponse.json({ fel: "Du är inte inloggad." }, { status: 401 });
  }

  const behorig =
    session.typ === "PLATTFORM" ||
    (session.typ === "STYRELSE" && session.foreningId === foreningId);

  if (!behorig) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }

  const forening = await prisma.forening.findUnique({
    where: { id: foreningId },
    include: {
      medlemmar: {
        include: {
          konto: {
            select: {
              id: true,
              epost: true,
              namn: true,
              typ: true,
              aktiv: true,
              senasteInloggning: true,
              skapadTidpunkt: true,
            },
          },
        },
      },
    },
  });

  if (!forening) {
    return NextResponse.json({ fel: "Föreningen hittades inte." }, { status: 404 });
  }

  const medlemmar = forening.medlemmar
    .filter((m) => m.konto.typ === "STYRELSE")
    .map((m) => ({
      kontoId: m.konto.id,
      namn: m.konto.namn,
      epost: m.konto.epost,
      roll: m.roll,
      aktiv: m.konto.aktiv,
      senasteInloggning: m.konto.senasteInloggning?.toISOString() ?? null,
      skapadTidpunkt: m.konto.skapadTidpunkt.toISOString(),
      arJag: m.konto.id === session.kontoId,
    }));

  const nu = Date.now();
  const dygn = 24 * 60 * 60 * 1000;
  const historik = await prisma.inloggningsHistorik.findMany({
    where: { foreningId, typ: "STYRELSE" },
    orderBy: { tidpunkt: "desc" },
    take: 100,
  });

  const lyckade = historik.filter((h) => h.lyckad);
  const statistik = {
    totaltLyckade: lyckade.length,
    totaltMisslyckade: historik.filter((h) => !h.lyckad).length,
    senaste7Dagar: lyckade.filter(
      (h) => nu - h.tidpunkt.getTime() < 7 * dygn,
    ).length,
    senaste24Timmar: lyckade.filter(
      (h) => nu - h.tidpunkt.getTime() < dygn,
    ).length,
    unikaEposter7Dagar: [
      ...new Set(
        lyckade
          .filter((h) => nu - h.tidpunkt.getTime() < 7 * dygn)
          .map((h) => h.epost),
      ),
    ].length,
  };

  return NextResponse.json({
    foreningId: forening.id,
    foreningsNamn: forening.namn,
    inloggadEpost: session.epost,
    medlemmar,
    statistik,
    historik: historik.map((h) => ({
      id: h.id,
      epost: h.epost,
      lyckad: h.lyckad,
      tidpunkt: h.tidpunkt.toISOString(),
      ip: h.ip,
    })),
  });
}
