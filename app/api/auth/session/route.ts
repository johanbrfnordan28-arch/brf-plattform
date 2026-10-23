import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

export async function GET() {
  const session = await lasSession();
  const databas = databasArKonfigurerad();
  if (!session) {
    return NextResponse.json({ inloggad: false, databas });
  }
  return NextResponse.json({
    inloggad: true,
    databas,
    kontoId: session.kontoId,
    epost: session.epost,
    namn: session.namn,
    typ: session.typ,
    foreningId: session.foreningId,
  });
}
