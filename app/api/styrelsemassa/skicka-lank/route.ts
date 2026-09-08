import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skickaStyrelsemassaLank } from "@/lib/styrelsemassa-lead-server";
import { byggStyrelsemassaLankMejl } from "@/lib/styrelsemassa-mejl";
import { skickaMejlDirekt } from "@/lib/auth/mejl";

function basUrlFranRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:3010";
}

/** Registrerar intresse och mejlar länk till prova-gratis. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      foreningsNamn?: string;
      epost?: string;
      kontaktperson?: string;
      telefon?: string;
    };

    const input = {
      foreningsNamn: body.foreningsNamn?.trim() ?? "",
      epost: body.epost?.trim() ?? "",
      kontaktperson: body.kontaktperson?.trim(),
      telefon: body.telefon?.trim(),
      basUrl: basUrlFranRequest(req),
    };

    if (!input.foreningsNamn || !input.epost) {
      return NextResponse.json(
        { fel: "Fyll i föreningens namn och e-post." },
        { status: 400 },
      );
    }

    if (!databasArKonfigurerad()) {
      const mejl = byggStyrelsemassaLankMejl({
        till: input.epost,
        foreningsNamn: input.foreningsNamn,
        kontaktperson: input.kontaktperson,
        basUrl: input.basUrl,
      });
      const skickat = await skickaMejlDirekt(mejl);
      return NextResponse.json({
        ok: true,
        demoLage: true,
        mejlVia: skickat.via,
        meddelande:
          skickat.via === "resend" || skickat.via === "smtp"
            ? "Tack! Vi har mejlat en länk till er."
            : "Länken är registrerad (demoläge — sätt RESEND_API_KEY eller SMTP_* för mejl).",
      });
    }

    const lead = await skickaStyrelsemassaLank(input);
    return NextResponse.json({
      ok: true,
      lead,
      meddelande: "Tack! Vi har mejlat en länk till er.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        fel:
          error instanceof Error
            ? error.message
            : "Kunde inte skicka länken.",
      },
      { status: 400 },
    );
  }
}
