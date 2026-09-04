import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { tillDto } from "@/lib/forening-server";
import { klassificeraInternForeningStatus } from "@/lib/plattform-forening-status";

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

  const foreningar = rader.map((f) => {
    const dto = tillDto(f);
    const statusInfo = klassificeraInternForeningStatus({
      avtalGodkant: dto.avtalGodkant,
      skapadTidpunkt: dto.skapadTidpunkt,
    });
    return {
      ...dto,
      status: statusInfo.status,
      statusEtikett: statusInfo.etikett,
      medlemmar: f.medlemmar
        .filter((m) => m.konto.typ === "STYRELSE")
        .map((m) => ({
          roll: m.roll,
          epost: m.konto.epost,
          namn: m.konto.namn,
        })),
    };
  });

  const sammanfattning = {
    totalt: foreningar.length,
    test: foreningar.filter((f) => f.status === "test").length,
    kund: foreningar.filter((f) => f.status === "kund").length,
    utgangen: foreningar.filter((f) => f.status === "utgangen").length,
  };

  return NextResponse.json({ foreningar, sammanfattning });
}
