import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { aterstallLosenordMedToken } from "@/lib/auth/auth-tjanst";

export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as { token?: string; nytt?: string };
    if (!body.token?.trim() || !body.nytt) {
      return NextResponse.json(
        { fel: "Ange token och nytt lösenord." },
        { status: 400 },
      );
    }
    await aterstallLosenordMedToken({
      token: body.token.trim(),
      nytt: body.nytt,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error ? e.message : "Kunde inte återställa lösenordet.",
      },
      { status: 400 },
    );
  }
}
