import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import {
  hamtaInbjudanTexter,
  hamtaInbjudanTexterStandard,
  sparaInbjudanTexter,
  type InbjudanTexter,
} from "@/lib/inbjudan-texter";

async function kravPlattform() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") return null;
  return session;
}

export async function GET() {
  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  if (!databasArKonfigurerad()) {
    return NextResponse.json({
      demoLage: true,
      texter: hamtaInbjudanTexterStandard(),
    });
  }

  try {
    const texter = await hamtaInbjudanTexter();
    return NextResponse.json({ texter });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ladda texter." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      {
        fel: "Demoläge utan databas — texter sparas när DATABASE_URL är satt.",
      },
      { status: 503 },
    );
  }

  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { texter?: Partial<InbjudanTexter> };
    const texter = await sparaInbjudanTexter({
      texter: body.texter ?? {},
      epost: session.epost,
    });
    return NextResponse.json({ ok: true, texter });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara texter." },
      { status: 400 },
    );
  }
}
