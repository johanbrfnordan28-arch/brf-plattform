import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

const MAL_ID = "default";

async function kravPlattform() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") return null;
  return session;
}

export async function GET() {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  const mal = await prisma.plattformMal.upsert({
    where: { id: MAL_ID },
    create: { id: MAL_ID },
    update: {},
  });

  return NextResponse.json({
    mal: {
      malAvtal: mal.malAvtal,
      malTest: mal.malTest,
      uppdateradTidpunkt: mal.uppdateradTidpunkt.toISOString(),
      uppdateradAvEpost: mal.uppdateradAvEpost,
    },
  });
}

export async function PUT(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      malAvtal?: number;
      malTest?: number;
    };

    const malAvtal = Number(body.malAvtal);
    const malTest = Number(body.malTest);
    if (
      !Number.isFinite(malAvtal) ||
      !Number.isFinite(malTest) ||
      malAvtal < 0 ||
      malTest < 0 ||
      malAvtal > 100000 ||
      malTest > 100000
    ) {
      return NextResponse.json(
        { fel: "Ange giltiga mål (0 eller högre)." },
        { status: 400 },
      );
    }

    const mal = await prisma.plattformMal.upsert({
      where: { id: MAL_ID },
      create: {
        id: MAL_ID,
        malAvtal: Math.floor(malAvtal),
        malTest: Math.floor(malTest),
        uppdateradAvEpost: session.epost,
      },
      update: {
        malAvtal: Math.floor(malAvtal),
        malTest: Math.floor(malTest),
        uppdateradAvEpost: session.epost,
      },
    });

    return NextResponse.json({
      ok: true,
      mal: {
        malAvtal: mal.malAvtal,
        malTest: mal.malTest,
        uppdateradTidpunkt: mal.uppdateradTidpunkt.toISOString(),
        uppdateradAvEpost: mal.uppdateradAvEpost,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara mål." },
      { status: 400 },
    );
  }
}
