import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skapaForeningMedKonto } from "@/lib/auth/auth-tjanst";

function basUrlFranRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:3010";
}

/** Skapa förening + styrelsekonto; skickar tillfälligt lösenord på mejl. */
export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      foreningId?: string;
      foreningsNamn?: string;
      skapareNamn?: string;
      skapareEpost?: string;
      skapareRoll?: string;
    };

    if (
      !body.foreningId?.trim() ||
      !body.foreningsNamn?.trim() ||
      !body.skapareNamn?.trim() ||
      !body.skapareEpost?.trim()
    ) {
      return NextResponse.json(
        { fel: "Fyll i föreningsnamn, ditt namn och e-post." },
        { status: 400 },
      );
    }

    const resultat = await skapaForeningMedKonto({
      foreningId: body.foreningId.trim(),
      foreningsNamn: body.foreningsNamn.trim(),
      skapareNamn: body.skapareNamn.trim(),
      skapareEpost: body.skapareEpost.trim(),
      skapareRoll: body.skapareRoll?.trim() || "Ordförande",
      basUrl: basUrlFranRequest(req),
    });

    return NextResponse.json({
      forening: resultat.forening,
      accessNyckel: resultat.accessNyckel,
      epost: resultat.epost,
      tillfalligtLosenord: resultat.tillfalligtLosenord,
      mejlVia: resultat.mejlVia,
      meddelande:
        resultat.mejlVia === "resend"
          ? "Lösenordet har skickats till din e-post."
          : "Lösenordet sparades i mejl-outbox (SMTP ej konfigurerat) och visas en gång här.",
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa föreningen." },
      { status: 400 },
    );
  }
}
