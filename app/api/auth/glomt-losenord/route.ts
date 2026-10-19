import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { begärAterstallning } from "@/lib/auth/auth-tjanst";
import { skickaLosenordDemoMejl } from "@/lib/auth/demo-mejl";
import { mejlLeveransMeddelande } from "@/lib/auth/mejl-konfiguration";

function basUrlFranRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:3010";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      epost?: string;
      namn?: string;
      foreningsNamn?: string;
    };

    if (!body.epost?.trim()) {
      return NextResponse.json({ fel: "Ange e-post." }, { status: 400 });
    }

    if (!databasArKonfigurerad()) {
      const mejl = await skickaLosenordDemoMejl({
        epost: body.epost,
        foreningsNamn: body.foreningsNamn?.trim() || "er förening",
        mottagarNamn: body.namn,
        basUrl: basUrlFranRequest(req),
        arSkickaIgen: true,
        genereraNytt: true,
      });
      return NextResponse.json({
        ok: true,
        demoLage: true,
        tillfalligtLosenord: mejl.tillfalligtLosenord,
        mejlVia: mejl.mejlVia,
        meddelande: mejlLeveransMeddelande(mejl.mejlVia),
      });
    }

    const resultat = await begärAterstallning({
      epost: body.epost,
      basUrl: basUrlFranRequest(req),
      foreningsNamn: body.foreningsNamn,
    });
    return NextResponse.json({
      ok: true,
      meddelande: resultat.tillfalligtLosenord
        ? mejlLeveransMeddelande(resultat.mejlVia || "")
        : "Om kontot finns skickas ett nytt tillfälligt lösenord till e-postadressen.",
      tillfalligtLosenord: resultat.tillfalligtLosenord,
      mejlVia: resultat.mejlVia,
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
