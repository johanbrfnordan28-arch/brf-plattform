import { NextResponse } from "next/server";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import { arProvoperiodUtgangen } from "@/lib/forening-avtal";

/**
 * Raderar förening på servern när prövoperioden gått ut utan tecknat avtal.
 * Anropas från klienten efter lokal rensning.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { id } = await ctx.params;
  try {
    const rad = await prisma.forening.findUnique({ where: { id } });
    if (!rad) {
      return NextResponse.json({ ok: true, saknas: true });
    }
    if (rad.avtalGodkant) {
      return NextResponse.json(
        { fel: "Föreningen har tecknat avtal och kan inte raderas här." },
        { status: 400 },
      );
    }
    if (
      !arProvoperiodUtgangen({
        skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
        avtalGodkant: rad.avtalGodkant,
      })
    ) {
      return NextResponse.json(
        { fel: "Prövoperioden har inte gått ut ännu." },
        { status: 400 },
      );
    }

    const medlemmar = await prisma.foreningMedlem.findMany({
      where: { foreningId: id },
      select: { kontoId: true },
    });

    await prisma.foreningMedlem.deleteMany({ where: { foreningId: id } });
    await prisma.inloggningsHistorik.deleteMany({ where: { foreningId: id } });
    await prisma.forening.delete({ where: { id } });

    for (const m of medlemmar) {
      const kvar = await prisma.foreningMedlem.count({
        where: { kontoId: m.kontoId },
      });
      if (kvar === 0) {
        await prisma.losnordAterstallning.deleteMany({
          where: { kontoId: m.kontoId },
        });
        await prisma.inloggningsHistorik.deleteMany({
          where: { kontoId: m.kontoId },
        });
        const konto = await prisma.konto.findUnique({
          where: { id: m.kontoId },
        });
        if (konto?.typ === "STYRELSE") {
          await prisma.konto.delete({ where: { id: m.kontoId } });
        }
      }
    }

    return NextResponse.json({ ok: true, raderad: id });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error ? e.message : "Kunde inte radera föreningen.",
      },
      { status: 500 },
    );
  }
}
