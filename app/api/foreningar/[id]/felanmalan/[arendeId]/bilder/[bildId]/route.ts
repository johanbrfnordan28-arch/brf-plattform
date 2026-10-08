import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import {
  bildlagringArKonfigurerad,
  hamtaArendeBild,
} from "@/lib/felanmalan/felanmalan-bilder-server";

type Ctx = { params: Promise<{ id: string; arendeId: string; bildId: string }> };

/** Bild till ett felanmälningsärende — bara för föreningens styrelse och personal. */
export async function GET(req: Request, ctx: Ctx) {
  if (!databasArKonfigurerad() || !bildlagringArKonfigurerad()) {
    return NextResponse.json({ fel: "Bildlagring är inte konfigurerad." }, { status: 503 });
  }
  const { id, arendeId, bildId } = await ctx.params;
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  const resultat = await hamtaArendeBild({ foreningId: id, arendeId, bildId });
  if (!resultat) {
    return NextResponse.json({ fel: "Bilden hittades inte." }, { status: 404 });
  }
  return new Response(resultat.stream, {
    headers: {
      "Content-Type": resultat.bild.contentType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
