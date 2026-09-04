import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { tillDto } from "@/lib/forening-server";

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

  const rader = await prisma.forening.findMany({
    orderBy: { skapadTidpunkt: "desc" },
    include: {
      medlemmar: {
        include: {
          konto: { select: { epost: true, namn: true, typ: true } },
        },
      },
    },
  });

  return NextResponse.json({
    foreningar: rader.map((f) => ({
      ...tillDto(f),
      medlemmar: f.medlemmar
        .filter((m) => m.konto.typ === "STYRELSE")
        .map((m) => ({
          roll: m.roll,
          epost: m.konto.epost,
          namn: m.konto.namn,
        })),
    })),
  });
}
