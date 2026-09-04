import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

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

  const rader = await prisma.mejlOutbox.findMany({
    orderBy: { skapadTidpunkt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    mejl: rader.map((m) => ({
      id: m.id,
      till: m.till,
      amne: m.amne,
      brodtext: m.brodtext,
      skickadVia: m.skickadVia,
      skapadTidpunkt: m.skapadTidpunkt.toISOString(),
    })),
  });
}
