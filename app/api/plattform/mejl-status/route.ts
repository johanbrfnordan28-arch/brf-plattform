import { NextResponse } from "next/server";
import { hamtaMejlTransportStatus } from "@/lib/auth/mejl-konfiguration";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";

/** Visar om Resend/SMTP är konfigurerat (plattformsadmin). */
export async function GET() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  const transport = hamtaMejlTransportStatus();
  return NextResponse.json({
    ...transport,
    databas: databasArKonfigurerad(),
    meddelande:
      transport.aktivTransport === "ingen"
        ? "Ingen mejltjänst aktiv. Lägg till RESEND_API_KEY i Vercel (rekommenderat via Resend-integrationen) eller SMTP_* för er mailserver."
        : `Mejl skickas via ${transport.aktivTransport}.`,
  });
}
