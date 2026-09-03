import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { begärAterstallning } from "@/lib/auth/auth-tjanst";

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
    const body = (await req.json()) as { epost?: string };
    if (!body.epost?.trim()) {
      return NextResponse.json({ fel: "Ange e-post." }, { status: 400 });
    }
    await begärAterstallning({
      epost: body.epost,
      basUrl: basUrlFranRequest(req),
    });
    return NextResponse.json({
      ok: true,
      meddelande:
        "Om kontot finns skickas en återställningslänk till e-postadressen.",
    });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error ? e.message : "Kunde inte begära återställning.",
      },
      { status: 400 },
    );
  }
}
