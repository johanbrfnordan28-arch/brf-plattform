import { NextResponse } from "next/server";
import { lasSession } from "@/lib/auth/session";
import { skickaMejl } from "@/lib/auth/mejl";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
} from "@/lib/felanmalan/felanmalan-typer";
import {
  listaFelanmalan,
  skapaFelanmalan,
} from "@/lib/felanmalan/felanmalan-server";
import { byggFelanmalanMejl } from "@/lib/felanmalan/felanmalan-mejl";
import { verifieraAccessNyckel } from "@/lib/forening-server";

async function harStyrelseBehorighet(
  req: Request,
  foreningId: string,
): Promise<boolean> {
  const session = await lasSession();
  if (session?.typ === "PLATTFORM") return true;
  if (session?.typ === "STYRELSE" && session.foreningId === foreningId) {
    return true;
  }
  const access =
    req.headers.get("x-access-nyckel") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!access) return false;
  const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
  return Boolean(rad && verifieraAccessNyckel(access, rad.accessNyckelHash));
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const { id } = await ctx.params;
  if (!(await harStyrelseBehorighet(req, id))) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  const arenden = await listaFelanmalan(id);
  return NextResponse.json({ arenden });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      {
        fel: "Felanmälan sparas när databasen är konfigurerad. Kontakta styrelsen direkt.",
      },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      rubrik?: string;
      beskrivning?: string;
      medlemNamn?: string;
      medlemEpost?: string;
      medlemTelefon?: string;
      lagenhetsnummer?: string;
      prioritet?: string;
      orsak?: string;
      debiteringKan?: boolean;
      debiteringAnteckning?: string;
      nyckelPlats?: string;
      boendeEjHemma?: boolean;
    };

    if (!body.rubrik?.trim() || !body.beskrivning?.trim()) {
      return NextResponse.json(
        { fel: "Ange rubrik och beskrivning av felet." },
        { status: 400 },
      );
    }
    if (!body.medlemNamn?.trim() || !body.medlemEpost?.trim()) {
      return NextResponse.json(
        { fel: "Ange namn och e-post så vi kan återkoppla." },
        { status: 400 },
      );
    }

    const prioritet =
      body.prioritet && arGiltigPrioritet(body.prioritet)
        ? body.prioritet
        : "normal";
    const orsak =
      body.orsak && arGiltigOrsak(body.orsak) ? body.orsak : "ovrigt";

    const arende = await skapaFelanmalan({
      foreningId: id,
      rubrik: body.rubrik,
      beskrivning: body.beskrivning,
      medlemNamn: body.medlemNamn,
      medlemEpost: body.medlemEpost,
      medlemTelefon: body.medlemTelefon,
      lagenhetsnummer: body.lagenhetsnummer,
      prioritet,
      orsak,
      debiteringKan: body.debiteringKan,
      debiteringAnteckning: body.debiteringAnteckning,
      nyckelPlats: body.nyckelPlats,
      boendeEjHemma: body.boendeEjHemma,
    });

    const forening = await prisma.forening.findUnique({ where: { id } });
    const mottagare =
      forening?.epost?.trim() ||
      process.env.FELANMALAN_FALLBACK_EPOST?.trim() ||
      "";
    if (mottagare) {
      const bas =
        process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ??
        new URL(req.url).origin;
      const mejl = byggFelanmalanMejl({
        foreningsNamn: forening?.namn ?? "Föreningen",
        arende,
        styrelsePanelUrl: `${bas}/forening/felanmalan`,
      });
      await skickaMejl({
        till: mottagare,
        amne: mejl.amne,
        brodtext: mejl.brodtext,
        replyTo: arende.medlemEpost,
      });
    }

    return NextResponse.json({ ok: true, arende });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa ärendet." },
      { status: 400 },
    );
  }
}
