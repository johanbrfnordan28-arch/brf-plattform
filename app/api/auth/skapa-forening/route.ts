import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skapaForeningMedKonto } from "@/lib/auth/auth-tjanst";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";

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
      {
        fel:
          "Databasen är inte konfigurerad. Sätt DATABASE_URL (lokalt SQLite eller Postgres på Vercel).",
      },
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
      aterkopplad: resultat.aterkopplad === true,
      meddelande: resultat.aterkopplad
        ? `Föreningen «${resultat.forening.namn}» fanns redan — den är nu hämtad till den här webbläsaren. Logga in via testperiod med samma e-post.`
        : mejlSkickades(resultat.mejlVia)
          ? resultat.tillfalligtLosenord
            ? "Lösenordet har skickats till din e-post."
            : "Föreningen är kopplad till ditt befintliga konto — logga in med samma e-post och lösenord."
          : resultat.tillfalligtLosenord
            ? "Mejltjänsten är inte konfigurerad — spara lösenordet som visas nedan."
            : "Föreningen är kopplad till ditt befintliga konto — logga in med samma e-post och lösenord.",
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa föreningen." },
      { status: 400 },
    );
  }
}
