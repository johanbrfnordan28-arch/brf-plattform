import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { exporteraForening } from "@/lib/gdpr-server";

/** Registerutdrag för en förening (JSON-fil). */
export async function GET(
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
    const data = await exporteraForening(id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="forening-${id}-export.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte exportera." },
      { status: 404 },
    );
  }
}
