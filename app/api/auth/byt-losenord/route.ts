import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { bytLosenord } from "@/lib/auth/auth-tjanst";
import { lasSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const session = await lasSession();
  if (!session) {
    return NextResponse.json({ fel: "Du är inte inloggad." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      nuvarande?: string;
      nytt?: string;
    };
    if (!body.nuvarande || !body.nytt) {
      return NextResponse.json(
        { fel: "Ange nuvarande och nytt lösenord." },
        { status: 400 },
      );
    }
    await bytLosenord({
      kontoId: session.kontoId,
      nuvarande: body.nuvarande,
      nytt: body.nytt,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte byta lösenord." },
      { status: 400 },
    );
  }
}
