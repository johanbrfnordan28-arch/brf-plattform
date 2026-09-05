import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import {
  arkiveraPlattformMal,
  listaPlattformMal,
  sparaVarningTestAntal,
  skapaPlattformMal,
  type PlattformMalTyp,
} from "@/lib/plattform-mal";

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

  try {
    const data = await listaPlattformMal();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ladda mål." },
      { status: 500 },
    );
  }
}

/** Skapa nytt mål med tidpunkt. */
export async function POST(req: Request) {
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
      typ?: string;
      titel?: string;
      malAntal?: number;
      tidpunkt?: string;
    };
    if (!body.typ || !body.tidpunkt || body.malAntal == null) {
      return NextResponse.json(
        { fel: "Ange typ, målantal och tidpunkt." },
        { status: 400 },
      );
    }
    const mal = await skapaPlattformMal({
      typ: body.typ as PlattformMalTyp,
      titel: body.titel,
      malAntal: Number(body.malAntal),
      tidpunkt: body.tidpunkt,
      skapadAvEpost: session.epost,
    });
    return NextResponse.json({ ok: true, mal });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa mål." },
      { status: 400 },
    );
  }
}

/** Uppdatera varningströskel för testföreningar. */
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
    const body = (await req.json()) as { varningTestAntal?: number };
    if (body.varningTestAntal == null) {
      return NextResponse.json(
        { fel: "Ange varningTestAntal." },
        { status: 400 },
      );
    }
    const installning = await sparaVarningTestAntal({
      varningTestAntal: Number(body.varningTestAntal),
      epost: session.epost,
    });
    return NextResponse.json({ ok: true, installning });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara varning." },
      { status: 400 },
    );
  }
}

/** Arkivera (ta bort från aktiv lista) ett mål. */
export async function DELETE(req: Request) {
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
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ fel: "Ange id." }, { status: 400 });
    }
    await arkiveraPlattformMal(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ta bort mål." },
      { status: 400 },
    );
  }
}
