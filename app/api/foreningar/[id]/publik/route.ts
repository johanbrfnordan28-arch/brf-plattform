import { NextResponse } from "next/server";
import { databasArKonfigurerad, prisma } from "@/lib/db";

/** Offentligt namn för medlemsportalen — inga kontaktuppgifter. */
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
    select: { id: true, namn: true, borttagenTidpunkt: true },
  });
  if (!rad || rad.borttagenTidpunkt) {
    return NextResponse.json({ fel: "Föreningen hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ id: rad.id, namn: rad.namn });
}
