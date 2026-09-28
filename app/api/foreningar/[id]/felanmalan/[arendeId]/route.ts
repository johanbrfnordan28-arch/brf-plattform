import { NextResponse } from "next/server";
import { lasSession } from "@/lib/auth/session";
import { skickaMejl } from "@/lib/auth/mejl";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
  arGiltigRoll,
  arGiltigStatus,
  FELANMALAN_ROLL_ETIKETT,
} from "@/lib/felanmalan/felanmalan-typer";
import { uppdateraFelanmalan } from "@/lib/felanmalan/felanmalan-server";
import { byggFelanmalanVidareMejl } from "@/lib/felanmalan/felanmalan-mejl";
import { verifieraAccessNyckel } from "@/lib/forening-server";

async function harStyrelseBehorighet(
  req: Request,
  foreningId: string,
): Promise<{ ok: boolean; av: string }> {
  const session = await lasSession();
  if (session?.typ === "PLATTFORM") {
    return { ok: true, av: session.epost || "Plattform" };
  }
  if (session?.typ === "STYRELSE" && session.foreningId === foreningId) {
    return { ok: true, av: session.namn || session.epost };
  }
  const access =
    req.headers.get("x-access-nyckel") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (access) {
    const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
    if (rad && verifieraAccessNyckel(access, rad.accessNyckelHash)) {
      return { ok: true, av: "Styrelse (access)" };
    }
  }
  return { ok: false, av: "" };
}

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
    };

    const arende = await uppdateraFelanmalan({
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
      kommentar: body.kommentar,
    });

    if (body.skickaMejlVidare && body.vidareEpost?.trim()) {
      const forening = await prisma.forening.findUnique({ where: { id } });
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
