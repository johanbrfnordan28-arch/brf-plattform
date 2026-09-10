import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import { skickaMejlDirekt } from "@/lib/auth/mejl";
import { byggPersonligInbjudanMejl } from "@/lib/forening-inbjudan-mejl";
import { skickaPersonligForeningsinbjudan } from "@/lib/forening-inbjudan-server";
import { hamtaInbjudanTexterStandard } from "@/lib/inbjudan-texter";

function basUrlFranRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:3010";
}

/** Personal skickar inbjudan till namngiven kontakt i en förening. */
export async function POST(req: Request) {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      foreningsNamn?: string;
      epost?: string;
      kontaktperson?: string;
      avsandareNamn?: string;
    };

    const input = {
      foreningsNamn: body.foreningsNamn?.trim() ?? "",
      epost: body.epost?.trim() ?? "",
      kontaktperson: body.kontaktperson?.trim(),
      avsandareNamn: body.avsandareNamn?.trim() || session.namn?.trim() || session.epost,
      inbjudenAvEpost: session.epost,
      basUrl: basUrlFranRequest(req),
    };

    if (!input.foreningsNamn || !input.epost) {
      return NextResponse.json(
        { fel: "Fyll i föreningens namn och mottagarens e-post." },
        { status: 400 },
      );
    }

    if (!databasArKonfigurerad()) {
      const mejl = byggPersonligInbjudanMejl({
        till: input.epost,
        foreningsNamn: input.foreningsNamn,
        kontaktperson: input.kontaktperson,
        avsandareNamn: input.avsandareNamn,
        basUrl: input.basUrl,
        texter: hamtaInbjudanTexterStandard(),
      });
      const skickat = await skickaMejlDirekt(mejl);
      return NextResponse.json({
        ok: mejlSkickades(skickat.via),
        demoLage: true,
        mejlVia: skickat.via,
        meddelande: mejlSkickades(skickat.via)
          ? "Inbjudan skickad till mottagaren."
          : "Mejltjänsten saknas — kontrollera RESEND_API_KEY.",
      });
    }

    const lead = await skickaPersonligForeningsinbjudan(input);
    return NextResponse.json({
      ok: true,
      lead,
      meddelande: "Inbjudan skickad — mottagaren kommer till huvudsidan via länken i mejlet.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        fel:
          error instanceof Error
            ? error.message
            : "Kunde inte skicka inbjudan.",
      },
      { status: 400 },
    );
  }
}
