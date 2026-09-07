import { NextResponse } from "next/server";
import { hamtaMinaForeningar } from "@/lib/auth/auth-tjanst";
import { lasSession } from "@/lib/auth/session";
import { databasArKonfigurerad } from "@/lib/db";

/** Föreningar kopplade till inloggat konto — för testperiod-inloggning i ny webbläsare. */
export async function GET() {
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ foreningar: [] });
  }

  const session = await lasSession();
  if (!session) {
    return NextResponse.json({ inloggad: false, foreningar: [] });
  }

  const foreningar = await hamtaMinaForeningar(session.kontoId);
  return NextResponse.json({
    inloggad: true,
    epost: session.epost,
    foreningar,
  });
}
