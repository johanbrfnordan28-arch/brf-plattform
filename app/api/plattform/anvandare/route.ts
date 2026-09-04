import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import {
  listaPlattformAnvandare,
  skapaPlattformAnvandare,
  uppdateraPlattformAnvandare,
} from "@/lib/auth/auth-tjanst";

async function kravPlattformSession() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const session = await kravPlattformSession();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  const anvandare = await listaPlattformAnvandare();
  return NextResponse.json({ anvandare });
}

export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const session = await kravPlattformSession();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      epost?: string;
      namn?: string;
      losenord?: string;
    };
    if (!body.epost?.trim() || !body.losenord) {
      return NextResponse.json(
        { fel: "Ange e-post och kod/lösenord." },
        { status: 400 },
      );
    }
    const anvandare = await skapaPlattformAnvandare({
      epost: body.epost,
      namn: body.namn,
      losenord: body.losenord,
    });
    return NextResponse.json({ ok: true, anvandare });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa användare." },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const session = await kravPlattformSession();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      kontoId?: string;
      namn?: string;
      losenord?: string;
      aktiv?: boolean;
    };
    if (!body.kontoId?.trim()) {
      return NextResponse.json({ fel: "Ange kontoId." }, { status: 400 });
    }
    const anvandare = await uppdateraPlattformAnvandare({
      kontoId: body.kontoId,
      namn: body.namn,
      losenord: body.losenord,
      aktiv: body.aktiv,
    });
    return NextResponse.json({ ok: true, anvandare });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error ? e.message : "Kunde inte uppdatera användare.",
      },
      { status: 400 },
    );
  }
}
