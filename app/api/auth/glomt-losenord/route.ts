import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { begärAterstallning } from "@/lib/auth/auth-tjanst";
import { skickaAterstallningDemoMejl } from "@/lib/auth/demo-mejl";

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
      aterstallningsLank?: string;
      namn?: string;
    };

    if (!body.epost?.trim()) {
      return NextResponse.json({ fel: "Ange e-post." }, { status: 400 });
    }

    if (!databasArKonfigurerad()) {
      const lank = body.aterstallningsLank?.trim();
      if (lank) {
        const mejl = await skickaAterstallningDemoMejl({
          epost: body.epost,
          aterstallningsLank: lank,
          namn: body.namn,
        });
        return NextResponse.json({
          ok: true,
          demoLage: true,
          aterstallningsLank: lank,
          mejlVia: mejl.mejlVia,
          meddelande:
            mejl.mejlVia === "resend"
              ? "Återställningslänken har skickats till din e-post."
              : "Mejltjänsten saknas — använd länken nedan inom en timme.",
        });
      }

      return NextResponse.json(
        {
          demoLage: true,
          meddelande:
            "Demoläge utan databas — återställning sker i webbläsaren där föreningen skapades.",
        },
        { status: 503 },
      );
    }

    const resultat = await begärAterstallning({
      epost: body.epost,
      basUrl: basUrlFranRequest(req),
    });
    return NextResponse.json({
      ok: true,
      meddelande:
        resultat.aterstallningsLank
          ? "Mejltjänsten är inte konfigurerad — använd återställningslänken nedan inom en timme."
          : "Om kontot finns skickas en återställningslänk till e-postadressen.",
      aterstallningsLank: resultat.aterstallningsLank,
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
