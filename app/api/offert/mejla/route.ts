import { NextResponse } from "next/server";
import {
  hamtaOffertKontaktperson,
} from "@/lib/kontakt-epost";
import {
  byggOffertForfraganMejl,
  byggOffertSkickadMejl,
} from "@/lib/offert-mejl";
import { skickaOffertMejlTillTeam } from "@/lib/offert-mejl-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      typ?: "forfragan" | "offert";
      foreningsNamn?: string;
      kontaktperson?: string;
      epost?: string;
      telefon?: string;
      antalLagenheter?: string;
      tjanster?: string[];
      meddelande?: string;
      oonskadKontaktId?: string;
      kundEpost?: string;
      prisText?: string;
      brodtextTillKund?: string;
    };

    const typ = body.typ === "offert" ? "offert" : "forfragan";

    if (typ === "forfragan") {
      const foreningsNamn = body.foreningsNamn?.trim() ?? "";
      const kontaktperson = body.kontaktperson?.trim() ?? "";
      const epost = body.epost?.trim() ?? "";
      const tjanster = Array.isArray(body.tjanster) ? body.tjanster : [];
      const oonskadKontaktId = body.oonskadKontaktId?.trim() ?? "";
      const valdKontakt = hamtaOffertKontaktperson(oonskadKontaktId);

      if (!foreningsNamn || !kontaktperson || !epost || !tjanster.length) {
        return NextResponse.json(
          { fel: "Ofullständig offertförfrågan." },
          { status: 400 },
        );
      }

      if (!valdKontakt) {
        return NextResponse.json(
          { fel: "Välj vem ni vill kontakta." },
          { status: 400 },
        );
      }

      const mejl = byggOffertForfraganMejl({
        foreningsNamn,
        kontaktperson,
        epost,
        telefon: body.telefon?.trim() ?? "",
        antalLagenheter: body.antalLagenheter?.trim() ?? "",
        tjanster,
        meddelande: body.meddelande?.trim() ?? "",
        oonskadKontakt: `${valdKontakt.namn} (${valdKontakt.epost})`,
      });

      const resultat = await skickaOffertMejlTillTeam(
        { ...mejl, replyTo: epost },
        valdKontakt.epost,
      );

      if (resultat.levererade === 0) {
        return NextResponse.json(
          {
            ok: false,
            fel:
              "Mejlet kunde inte skickas just nu. Mejla oss direkt på offert@styrelse-navet.se.",
            ...resultat,
          },
          { status: 503 },
        );
      }

      return NextResponse.json({ ok: true, ...resultat });
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

    if (resultat.levererade === 0) {
      return NextResponse.json(
        {
          ok: false,
          fel: "Mejlet kunde inte skickas till teamet.",
          ...resultat,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, ...resultat });
  } catch (error) {
    console.error("[offert/mejla]", error);
    return NextResponse.json({ fel: "Kunde inte skicka mejl." }, { status: 500 });
  }
}
