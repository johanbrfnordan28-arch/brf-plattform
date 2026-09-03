import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { loggaInPlattform } from "@/lib/auth/auth-tjanst";
import { skrivSessionCookie } from "@/lib/auth/session";
import { hamtaRequestMeta } from "@/lib/auth/server-hjalp";

function basUrlFranRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:3010";
}

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
    const resultat = await loggaInPlattform({
      epost: body.epost,
      losenord: body.losenord,
      basUrl: basUrlFranRequest(req),
      ...meta,
    });
    await skrivSessionCookie(resultat.token);

    return NextResponse.json({
      ok: true,
      typ: "PLATTFORM",
      epost: body.epost.trim().toLowerCase(),
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Inloggning misslyckades." },
      { status: 401 },
    );
  }
}
