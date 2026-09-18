import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { flyttaForeningTillBorttagna } from "@/lib/forening-borttag-server";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  try {
    const forening = await flyttaForeningTillBorttagna({
      foreningId: id,
      avEpost: session.epost,
    });
    return NextResponse.json({ ok: true, forening });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte flytta föreningen." },
      { status: 400 },
    );
  }
}
