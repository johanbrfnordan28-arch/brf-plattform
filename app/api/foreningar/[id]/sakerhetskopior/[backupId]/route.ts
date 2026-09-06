import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import {
  hamtaSakerhetskopiaPayload,
  kravForeningBehorighet,
  taBortSakerhetskopia,
} from "@/lib/forening-sakerhetskopia-server";

type Ctx = { params: Promise<{ id: string; backupId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const { id, backupId } = await ctx.params;
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return NextResponse.json({ fel: beh.fel }, { status: beh.status });
  }

  try {
    const backup = await hamtaSakerhetskopiaPayload(id, backupId);
    return NextResponse.json({ backup });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte hämta säkerhetskopia." },
      { status: 404 },
    );
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const { id, backupId } = await ctx.params;
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return NextResponse.json({ fel: beh.fel }, { status: beh.status });
  }

  try {
    await taBortSakerhetskopia(id, backupId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ta bort." },
      { status: 400 },
    );
  }
}
