import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { korGallring } from "@/lib/gallring-server";

export const dynamic = "force-dynamic";

/** Daglig gallring — anropas av Vercel Cron med `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  const hemlighet = process.env.CRON_SECRET;
  if (!hemlighet) {
    return NextResponse.json(
      { fel: "CRON_SECRET är inte satt." },
      { status: 503 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${hemlighet}`) {
    return NextResponse.json({ fel: "Obehörig." }, { status: 401 });
  }
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resultat = await korGallring();
  console.info("[gallring]", JSON.stringify(resultat));
  return NextResponse.json({ ok: true, resultat });
}
