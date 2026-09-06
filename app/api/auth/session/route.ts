import { NextResponse } from "next/server";
import { lasSession } from "@/lib/auth/session";

export async function GET() {
  const session = await lasSession();
  if (!session) {
    return NextResponse.json({ inloggad: false });
  }
  return NextResponse.json({
    inloggad: true,
    kontoId: session.kontoId,
    epost: session.epost,
    namn: session.namn,
    typ: session.typ,
    foreningId: session.foreningId,
  });
}
