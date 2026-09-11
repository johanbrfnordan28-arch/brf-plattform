import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { raderaForeningPermanent } from "@/lib/forening-borttag-server";

/** Permanent radering — kräver att föreningen redan ligger i borttagna. */
export async function DELETE(
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
    await raderaForeningPermanent(id);
    return NextResponse.json({ ok: true, raderad: id });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte radera föreningen." },
      { status: 400 },
    );
  }
}
