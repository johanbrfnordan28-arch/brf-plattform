import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skickaTillfalligtLosenord } from "@/lib/auth/auth-tjanst";
import { skickaLosenordDemoMejl } from "@/lib/auth/demo-mejl";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import { lasSession } from "@/lib/auth/session";

function basUrlFran(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

/**
 * Skickar tillfälligt lösenord via mejl.
 * - Med databas: sparar hash och mejlar (som vanligt).
 * - Utan databas (mässa/demo): mejlar via Resend om RESEND_API_KEY finns.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      epost?: string;
      losenord?: string;
      foreningsNamn?: string;
      mottagarNamn?: string;
      arSkickaIgen?: boolean;
      genereraNytt?: boolean;
    };

    const session = await lasSession();
    const epost = (body.epost || session?.epost || "").trim();

    if (!databasArKonfigurerad()) {
      if (!epost) {
        return NextResponse.json(
          { fel: "Ange e-postadressen lösenordet ska skickas till." },
          { status: 400 },
        );
      }

      const resultat = await skickaLosenordDemoMejl({
        epost,
        losenord: body.losenord,
        foreningsNamn: body.foreningsNamn?.trim() || "er förening",
        mottagarNamn: body.mottagarNamn,
        basUrl: basUrlFran(req),
        arSkickaIgen: body.arSkickaIgen,
        genereraNytt: body.genereraNytt ?? body.arSkickaIgen,
      });

      return NextResponse.json({
        ok: true,
        demoLage: true,
        mejlVia: resultat.mejlVia,
        tillfalligtLosenord: resultat.tillfalligtLosenord,
        meddelande:
          mejlSkickades(resultat.mejlVia)
            ? "Lösenordet har skickats till din e-post."
            : "Mejltjänsten är inte konfigurerad (sätt RESEND_API_KEY eller SMTP_*) — spara lösenordet som visas.",
      });
    }

    if (!epost) {
      return NextResponse.json(
        { fel: "Ange e-postadressen lösenordet ska skickas till." },
        { status: 400 },
      );
    }

    const resultat = await skickaTillfalligtLosenord({
      epost,
      basUrl: basUrlFran(req),
      kontoId: session?.typ === "STYRELSE" ? session.kontoId : undefined,
    });

    return NextResponse.json({
      ok: true,
      skickat: resultat.skickat,
      mejlVia: resultat.mejlVia,
      tillfalligtLosenord: resultat.tillfalligtLosenord,
      meddelande: resultat.tillfalligtLosenord
        ? "Mejltjänsten är inte konfigurerad — ditt nya tillfälliga lösenord visas nedan."
        : mejlSkickades(resultat.mejlVia || "")
          ? "Ett nytt tillfälligt lösenord har skickats till din e-post."
          : "Lösenordet är sparat för utskick (mejltjänst ej konfigurerad — syns i mejl-outbox).",
    });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error
            ? e.message
            : "Kunde inte skicka lösenord.",
      },
      { status: 400 },
    );
  }
}
