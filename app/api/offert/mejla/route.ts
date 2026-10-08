import { NextResponse } from "next/server";
import { lasSession } from "@/lib/auth/session";
import { byggOffertSkickadMejl } from "@/lib/offert-mejl";
import { skickaOffertMejlTillTeam } from "@/lib/offert-mejl-server";

/** Personal — kopia till teamet när en offert förbereds till kund. */
export async function POST(request: Request) {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as {
      typ?: "forfragan" | "offert";
      foreningsNamn?: string;
      kontaktperson?: string;
      tjanster?: string[];
      kundEpost?: string;
      prisText?: string;
      brodtextTillKund?: string;
    };

    if (body.typ !== "offert") {
      return NextResponse.json(
        { fel: "Offertförfrågningar skickas via /api/offert/forfragan." },
        { status: 400 },
      );
    }

    const foreningsNamn = body.foreningsNamn?.trim() ?? "";
    const kontaktperson = body.kontaktperson?.trim() ?? "";
    const kundEpost = body.kundEpost?.trim() ?? "";
    const prisText = body.prisText?.trim() ?? "";
    const brodtextTillKund = body.brodtextTillKund?.trim() ?? "";
    const tjanster = Array.isArray(body.tjanster)
      ? body.tjanster.join(", ")
      : "";

    if (!foreningsNamn || !kundEpost || !prisText || !brodtextTillKund) {
      return NextResponse.json(
        { fel: "Ofullständig offert." },
        { status: 400 },
      );
    }

    const mejl = byggOffertSkickadMejl({
      foreningsNamn,
      kontaktperson,
      kundEpost,
      tjanster,
      prisText,
      brodtextTillKund,
    });

    const resultat = await skickaOffertMejlTillTeam(
      { ...mejl, replyTo: kundEpost },
    );

    if (resultat.levererade === 0 && resultat.via !== "outbox") {
      return NextResponse.json(
        {
          ok: false,
          fel: resultat.varning || "Mejlet kunde inte skickas till teamet.",
          ...resultat,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      ...resultat,
      sparadIOutbox: resultat.levererade === 0 && resultat.via === "outbox",
    });
  } catch (error) {
    console.error("[offert/mejla]", error);
    return NextResponse.json({ fel: "Kunde inte skicka mejl." }, { status: 500 });
  }
}
