import { NextResponse } from "next/server";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import { VILLKOR_VERSION } from "@/lib/juridik";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ fel: "Databasen är inte konfigurerad." }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  const rad = await prisma.forening.findUnique({
    where: { id },
    select: { villkorVersion: true, villkorGodkantTidpunkt: true },
  });
  if (!rad) {
    return NextResponse.json({ fel: "Föreningen finns inte." }, { status: 404 });
  }
  return NextResponse.json({
    aktuellVersion: VILLKOR_VERSION,
    godkandVersion: rad.villkorVersion,
    godkantTidpunkt: rad.villkorGodkantTidpunkt?.toISOString() ?? "",
    behoverGodkannas: rad.villkorVersion !== VILLKOR_VERSION,
  });
}

/** Godkänner aktuell version av villkor och personuppgiftsbiträdesavtal. */
export async function POST(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ fel: "Databasen är inte konfigurerad." }, { status: 503 });
  }
  const { id } = await ctx.params;
  const behorighet = await harStyrelseBehorighet(req, id);
  if (!behorighet.ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    villkorVersion?: string;
    epost?: string;
  };
  if (body.villkorVersion !== VILLKOR_VERSION) {
    return NextResponse.json(
      { fel: "Villkoren har uppdaterats. Ladda om sidan och godkänn igen." },
      { status: 409 },
    );
  }
  const godkantAv = (behorighet.epost || body.epost || "").trim().toLowerCase();
  await prisma.forening.update({
    where: { id },
    data: {
      villkorVersion: VILLKOR_VERSION,
      villkorGodkantTidpunkt: new Date(),
      villkorGodkantAvEpost: godkantAv,
    },
  });
  return NextResponse.json({ ok: true, godkandVersion: VILLKOR_VERSION });
}
