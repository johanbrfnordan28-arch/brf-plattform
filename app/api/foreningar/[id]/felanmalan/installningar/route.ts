import { NextResponse } from "next/server";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import {
  sparaFelanmalanInstallningar,
  tillInstallningar,
} from "@/lib/felanmalan/felanmalan-server";
import type { FelanmalanInstallningar } from "@/lib/felanmalan/felanmalan-typer";

type Ctx = { params: Promise<{ id: string }> };

async function kontrollera(req: Request, id: string) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ fel: "Databasen är inte konfigurerad." }, { status: 503 });
  }
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const nekad = await kontrollera(req, id);
  if (nekad) return nekad;
  const rad = await prisma.forening.findUnique({ where: { id } });
  if (!rad) {
    return NextResponse.json({ fel: "Föreningen finns inte." }, { status: 404 });
  }
  return NextResponse.json({
    installningar: tillInstallningar(rad),
    foreningEpost: rad.epost,
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const nekad = await kontrollera(req, id);
  if (nekad) return nekad;
  const body = (await req.json().catch(() => ({}))) as Partial<FelanmalanInstallningar>;
  try {
    const installningar = await sparaFelanmalanInstallningar(id, {
      extraEpost: Array.isArray(body.extraEpost) ? body.extraEpost.map(String) : [],
      jourTelefon: String(body.jourTelefon ?? ""),
      jourText: String(body.jourText ?? ""),
      info: String(body.info ?? ""),
    });
    return NextResponse.json({ ok: true, installningar });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara." },
      { status: 400 },
    );
  }
}
