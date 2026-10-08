import { NextResponse } from "next/server";
import { skickaMejl } from "@/lib/auth/mejl";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
  arGiltigRoll,
  arGiltigStatus,
  FELANMALAN_MAXLANGD,
  FELANMALAN_ROLL_ETIKETT,
} from "@/lib/felanmalan/felanmalan-typer";
import { uppdateraFelanmalan } from "@/lib/felanmalan/felanmalan-server";
import {
  byggFelanmalanBoendeMejl,
  byggFelanmalanVidareMejl,
} from "@/lib/felanmalan/felanmalan-mejl";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; arendeId: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const { id, arendeId } = await ctx.params;
  const behorig = await harStyrelseBehorighet(req, id);
  if (!behorig.ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      status?: string;
      prioritet?: string;
      orsak?: string;
      tilldeladRoll?: string;
      vidareEpost?: string;
      kommentar?: string;
      skickaMejlVidare?: boolean;
      /** Mejlas till boende och sparas i historiken. */
      meddelandeTillBoende?: string;
    };

    const meddelande = body.meddelandeTillBoende?.trim() ?? "";
    if (meddelande.length > FELANMALAN_MAXLANGD.meddelande) {
      return NextResponse.json(
        { fel: `Meddelandet får vara högst ${FELANMALAN_MAXLANGD.meddelande} tecken.` },
        { status: 400 },
      );
    }
    const kommentar = [
      body.kommentar?.trim(),
      meddelande ? `Meddelande till boende: ${meddelande}` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    const { arende, tidigareStatus } = await uppdateraFelanmalan({
      foreningId: id,
      arendeId,
      av: behorig.av,
      status:
        body.status && arGiltigStatus(body.status) ? body.status : undefined,
      prioritet:
        body.prioritet && arGiltigPrioritet(body.prioritet)
          ? body.prioritet
          : undefined,
      orsak: body.orsak && arGiltigOrsak(body.orsak) ? body.orsak : undefined,
      tilldeladRoll:
        body.tilldeladRoll && arGiltigRoll(body.tilldeladRoll)
          ? body.tilldeladRoll
          : undefined,
      vidareEpost: body.vidareEpost,
      kommentar,
    });

    const forening = await prisma.forening.findUnique({ where: { id } });
    const nyssAvslutat =
      arende.status === "avslutad" && tidigareStatus !== "avslutad";
    if (arende.medlemEpost && (meddelande || nyssAvslutat)) {
      const mejl = byggFelanmalanBoendeMejl({
        foreningsNamn: forening?.namn ?? "Föreningen",
        arende,
        meddelande: meddelande || "Felet är åtgärdat.",
        avslutat: nyssAvslutat,
      });
      try {
        await skickaMejl({
          till: arende.medlemEpost,
          amne: mejl.amne,
          brodtext: mejl.brodtext,
          ...(forening?.epost ? { replyTo: forening.epost } : {}),
        });
      } catch (e) {
        console.error("[felanmalan] Mejl till boende misslyckades:", e);
      }
    }

    if (body.skickaMejlVidare && body.vidareEpost?.trim()) {
      const mejl = byggFelanmalanVidareMejl({
        foreningsNamn: forening?.namn ?? "Föreningen",
        arende,
        mottagareRoll:
          FELANMALAN_ROLL_ETIKETT[arende.tilldeladRoll] ?? arende.tilldeladRoll,
      });
      await skickaMejl({
        till: body.vidareEpost.trim(),
        amne: mejl.amne,
        brodtext: mejl.brodtext,
        replyTo: arende.medlemEpost,
      });
    }

    return NextResponse.json({ ok: true, arende });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte uppdatera ärendet." },
      { status: 400 },
    );
  }
}
