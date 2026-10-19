import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import {
  lasDriftTjanstState,
  sparaDriftTjanstState,
} from "@/lib/drift-tjanst-server";
import { arDriftState } from "@/components/rondering/drift-avtal-typer";

export const dynamic = "force-dynamic";

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
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  try {
    const state = await lasDriftTjanstState(id);
    return NextResponse.json({ state });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte hämta." },
      { status: 400 },
    );
  }
}

export async function PUT(
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
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { state?: unknown };
    if (!arDriftState(body.state)) {
      return NextResponse.json({ fel: "Ogiltig data." }, { status: 400 });
    }
    const state = await sparaDriftTjanstState(id, body.state);
    return NextResponse.json({ state });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara." },
      { status: 400 },
    );
  }
}
