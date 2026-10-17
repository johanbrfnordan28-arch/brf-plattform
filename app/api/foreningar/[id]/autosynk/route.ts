import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { arStandardTestForening, GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  hamtaSenasteAutoKopia,
  kravForeningBehorighet,
  parsaBackupPayload,
  sparaAutoKopia,
} from "@/lib/forening-sakerhetskopia-server";

type Ctx = { params: Promise<{ id: string }> };

async function forbered(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad()) {
    return {
      svar: NextResponse.json({ fel: "Databasen är inte konfigurerad." }, { status: 503 }),
    };
  }
  const { id } = await ctx.params;
  if (id === GRUNDMALL_FORENING_ID || arStandardTestForening(id)) {
    return {
      svar: NextResponse.json(
        { fel: "Gemensamma demoföreningar sparas inte automatiskt." },
        { status: 409 },
      ),
    };
  }
  const beh = await kravForeningBehorighet(req, id);
  if (!beh.ok) {
    return { svar: NextResponse.json({ fel: beh.fel }, { status: beh.status }) };
  }
  return { id, epost: beh.epost };
}

/** Senaste automatiska kopian (utan innehåll) — för att jämföra med webbläsaren. */
export async function GET(req: Request, ctx: Ctx) {
  const f = await forbered(req, ctx);
  if ("svar" in f) return f.svar;
  return NextResponse.json({ senaste: await hamtaSenasteAutoKopia(f.id) });
}

export async function POST(req: Request, ctx: Ctx) {
  const f = await forbered(req, ctx);
  if ("svar" in f) return f.svar;

  const body = (await req.json().catch(() => null)) as {
    backup?: unknown;
    basHash?: unknown;
    tvinga?: unknown;
  } | null;
  const backup = parsaBackupPayload(body?.backup);
  if (typeof backup === "string") {
    return NextResponse.json({ fel: backup }, { status: 400 });
  }

  try {
    const resultat = await sparaAutoKopia({
      foreningId: f.id,
      backup,
      epost: f.epost,
      basHash: typeof body?.basHash === "string" ? body.basHash : null,
      tvinga: body?.tvinga === true,
    });
    return NextResponse.json(resultat, {
      status: resultat.status === "konflikt" ? 409 : 200,
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara." },
      { status: 400 },
    );
  }
}
