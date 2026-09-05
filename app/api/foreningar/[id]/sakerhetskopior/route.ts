import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import {
  kravForeningBehorighet,
  listaSakerhetskopior,
  parsaBackupPayload,
  sparaSakerhetskopia,
} from "@/lib/forening-sakerhetskopia-server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const { id } = await ctx.params;
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return NextResponse.json({ fel: beh.fel }, { status: beh.status });
  }

  try {
    const kopior = await listaSakerhetskopior(id);
    return NextResponse.json({ kopior });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte lista kopior." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  const { id } = await ctx.params;
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return NextResponse.json({ fel: beh.fel }, { status: beh.status });
  }

  try {
    const body = (await req.json()) as { backup?: unknown };
    const backup = parsaBackupPayload(body.backup ?? body);
    if (typeof backup === "string") {
      return NextResponse.json({ fel: backup }, { status: 400 });
    }
    const kopia = await sparaSakerhetskopia({
      foreningId: id,
      backup,
      epost: beh.epost,
    });
    return NextResponse.json({ ok: true, kopia });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara säkerhetskopia." },
      { status: 400 },
    );
  }
}
