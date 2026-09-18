import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { tillDto } from "@/lib/forening-server";
import { klassificeraInternForeningStatus } from "@/lib/plattform-forening-status";

type ForeningMedData = Awaited<
  ReturnType<
    typeof prisma.forening.findMany<{
      include: {
        medlemmar: {
          include: {
            konto: {
              select: {
                epost: true;
                namn: true;
                typ: true;
                senasteInloggning: true;
              };
            };
          };
        };
      };
    }>
  >
>[number];

function tillPlattformRad(
  f: ForeningMedData,
  maps: {
    totaltMap: Map<string, { antal: number; senaste: Date | null }>;
    map7: Map<string, number>;
    map30: Map<string, number>;
  },
) {
  const dto = tillDto(f);
  const statusInfo = klassificeraInternForeningStatus({
    avtalGodkant: dto.avtalGodkant,
    skapadTidpunkt: dto.skapadTidpunkt,
  });
  const medlemmar = f.medlemmar.map((m) => ({
    roll: m.roll,
    epost: m.konto.epost,
    namn: m.konto.namn,
    typ: m.konto.typ,
    senasteInloggning: m.konto.senasteInloggning?.toISOString() ?? null,
  }));
  const login = maps.totaltMap.get(f.id);
  const senasteFranMedlem = medlemmar
    .map((m) => m.senasteInloggning)
    .filter(Boolean)
    .sort()
    .at(-1);
  const senasteFranLogg = login?.senaste?.toISOString() ?? null;
  const senasteInloggning =
    [senasteFranLogg, senasteFranMedlem].filter(Boolean).sort().at(-1) ?? null;

  return {
    ...dto,
    status: statusInfo.status,
    statusEtikett: statusInfo.etikett,
    borttagenTidpunkt: f.borttagenTidpunkt?.toISOString() ?? null,
    borttagenAvEpost: f.borttagenAvEpost,
    medlemmar,
    aktivitet: {
      antalAnvandare: medlemmar.length,
      inloggningarTotalt: login?.antal ?? 0,
      inloggningar7Dagar: maps.map7.get(f.id) ?? 0,
      inloggningar30Dagar: maps.map30.get(f.id) ?? 0,
      senasteInloggning,
    },
  };
}

export async function GET() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  if (!databasArKonfigurerad()) {
    return NextResponse.json({
      foreningar: [],
      borttagna: [],
      sammanfattning: {
        totalt: 0,
        test: 0,
        kund: 0,
        utgangen: 0,
        borttagna: 0,
        anvandareTotalt: 0,
        inloggningar7Dagar: 0,
      },
      demoLage: true,
    });
  }

  const nu = Date.now();
  const sedan7 = new Date(nu - 7 * 24 * 60 * 60 * 1000);
  const sedan30 = new Date(nu - 30 * 24 * 60 * 60 * 1000);

  const [rader, loginTotalt, login7, login30] = await Promise.all([
    prisma.forening.findMany({
      orderBy: { skapadTidpunkt: "desc" },
      include: {
        medlemmar: {
          include: {
            konto: {
              select: {
                epost: true,
                namn: true,
                typ: true,
                senasteInloggning: true,
              },
            },
          },
        },
      },
    }),
    prisma.inloggningsHistorik.groupBy({
      by: ["foreningId"],
      where: { lyckad: true, foreningId: { not: null } },
      _count: { _all: true },
      _max: { tidpunkt: true },
    }),
    prisma.inloggningsHistorik.groupBy({
      by: ["foreningId"],
      where: {
        lyckad: true,
        foreningId: { not: null },
        tidpunkt: { gte: sedan7 },
      },
      _count: { _all: true },
    }),
    prisma.inloggningsHistorik.groupBy({
      by: ["foreningId"],
      where: {
        lyckad: true,
        foreningId: { not: null },
        tidpunkt: { gte: sedan30 },
      },
      _count: { _all: true },
    }),
  ]);

  const totaltMap = new Map(
    loginTotalt
      .filter((r) => r.foreningId)
      .map((r) => [
        r.foreningId!,
        { antal: r._count._all, senaste: r._max.tidpunkt },
      ]),
  );
  const map7 = new Map(
    login7
      .filter((r) => r.foreningId)
      .map((r) => [r.foreningId!, r._count._all]),
  );
  const map30 = new Map(
    login30
      .filter((r) => r.foreningId)
      .map((r) => [r.foreningId!, r._count._all]),
  );

  const maps = { totaltMap, map7, map30 };
  const allaRader = rader.map((f) => tillPlattformRad(f, maps));
  const foreningar = allaRader.filter((f) => !f.borttagenTidpunkt);
  const borttagna = allaRader.filter((f) => f.borttagenTidpunkt);

  const sammanfattning = {
    totalt: foreningar.length,
    test: foreningar.filter((f) => f.status === "test").length,
    kund: foreningar.filter((f) => f.status === "kund").length,
    utgangen: foreningar.filter((f) => f.status === "utgangen").length,
    borttagna: borttagna.length,
    anvandareTotalt: foreningar.reduce(
      (sum, f) => sum + f.aktivitet.antalAnvandare,
      0,
    ),
    inloggningar7Dagar: foreningar.reduce(
      (sum, f) => sum + f.aktivitet.inloggningar7Dagar,
      0,
    ),
  };

  return NextResponse.json({ foreningar, borttagna, sammanfattning });
}
