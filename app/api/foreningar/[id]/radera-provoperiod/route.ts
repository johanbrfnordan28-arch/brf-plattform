import { NextResponse } from "next/server";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import { arProvoperiodUtgangen } from "@/lib/forening-avtal";
<<<<<<< HEAD
import { kravForeningBehorighet } from "@/lib/forening-sakerhetskopia-server";
=======
import { raderaForeningMedKonton } from "@/lib/forening-borttag-server";
>>>>>>> 1fdcc83 (feat: daglig gallring av inloggningar, intresseanmälningar och utgångna testföreningar)

/**
 * Raderar förening på servern när prövoperioden gått ut utan tecknat avtal.
 * Anropas från klienten efter lokal rensning.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { id } = await ctx.params;
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return NextResponse.json({ fel: beh.fel }, { status: beh.status });
  }
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

    await raderaForeningMedKonton(id);

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
