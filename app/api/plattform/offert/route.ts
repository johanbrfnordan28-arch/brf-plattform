import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { listaOffertForfragningar } from "@/lib/offert-forfragan-server";

export async function GET() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ forfragningar: [], demoLage: true });
  }
  return NextResponse.json({ forfragningar: await listaOffertForfragningar() });
}
