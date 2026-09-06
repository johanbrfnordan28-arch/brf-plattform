import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { loggaInStyrelse } from "@/lib/auth/auth-tjanst";
import { skrivSessionCookie } from "@/lib/auth/session";
import { hamtaRequestMeta } from "@/lib/auth/server-hjalp";

export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      epost?: string;
      losenord?: string;
    };
    if (!body.epost?.trim() || !body.losenord) {
      return NextResponse.json(
        { fel: "Ange e-post och lösenord." },
        { status: 400 },
      );
    }

    const meta = hamtaRequestMeta(req);
    const resultat = await loggaInStyrelse({
      epost: body.epost,
      losenord: body.losenord,
      ...meta,
    });
    await skrivSessionCookie(resultat.token);

    return NextResponse.json({
      ok: true,
      foreningId: resultat.foreningId,
      epost: body.epost.trim().toLowerCase(),
      typ: "STYRELSE",
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Inloggning misslyckades." },
      { status: 401 },
    );
  }
}
