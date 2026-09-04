import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { sakraPlattformAdminKonton } from "@/lib/auth/server-hjalp";

export async function GET(req: Request) {
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

  await sakraPlattformAdminKonton();

  const url = new URL(req.url);
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") || 50)),
  );

  const rader = await prisma.inloggningsHistorik.findMany({
    orderBy: { tidpunkt: "desc" },
    take: limit,
    include: {
      forening: { select: { namn: true } },
    },
  });

  return NextResponse.json({
    inloggningar: rader.map((r) => ({
      id: r.id,
      epost: r.epost,
      typ: r.typ,
      foreningId: r.foreningId,
      foreningsNamn: r.forening?.namn ?? null,
      lyckad: r.lyckad,
      ip: r.ip,
      userAgent: r.userAgent,
      tidpunkt: r.tidpunkt.toISOString(),
    })),
  });
}
