import { NextResponse } from "next/server";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import type { FelanmalanPublikInfo } from "@/lib/felanmalan/felanmalan-typer";

/** Offentligt namn och felanmälningsinfo för medlemsportalen — inga personuppgifter. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Tjänsten är inte tillgänglig just nu." },
      { status: 503 },
    );
  }
  const { id } = await ctx.params;
  const rad = await prisma.forening.findUnique({
    where: { id },
    select: {
      id: true,
      namn: true,
      borttagenTidpunkt: true,
      felanmalanJourTelefon: true,
      felanmalanJourText: true,
      felanmalanInfo: true,
    },
  });
  if (!rad || rad.borttagenTidpunkt) {
    return NextResponse.json({ fel: "Föreningen hittades inte." }, { status: 404 });
  }
  const felanmalan: FelanmalanPublikInfo = {
    jourTelefon: rad.felanmalanJourTelefon,
    jourText: rad.felanmalanJourText,
    info: rad.felanmalanInfo,
  };
  return NextResponse.json({ id: rad.id, namn: rad.namn, felanmalan });
}
