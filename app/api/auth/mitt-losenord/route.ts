import { NextResponse } from "next/server";
import { prisma, databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { dekrypteraLosenordForVisning } from "@/lib/auth/losenord-kuvert";

/**
 * Returnerar endast den inloggades eget lösenord — aldrig andras.
 */
export async function GET() {
  const session = await lasSession();
  if (!session) {
    return NextResponse.json({ fel: "Du är inte inloggad." }, { status: 401 });
  }

  if (!databasArKonfigurerad()) {
    return NextResponse.json({
      epost: session.epost,
      losenord: null,
      lokalFallback: true,
      meddelande:
        "Servern har ingen databas — lösenordet finns endast lokalt i webbläsaren för ditt konto.",
    });
  }

  const konto = await prisma.konto.findUnique({
    where: { id: session.kontoId },
  });
  if (!konto || konto.id !== session.kontoId) {
    return NextResponse.json({ fel: "Kontot hittades inte." }, { status: 404 });
  }

  const losenord = dekrypteraLosenordForVisning(konto.losenordKuvert || "");
  return NextResponse.json({
    epost: konto.epost,
    namn: konto.namn,
    losenord,
    senasteInloggning: konto.senasteInloggning?.toISOString() ?? null,
    meddelande: losenord
      ? "Endast du som är inloggad kan se ditt lösenord."
      : "Lösenordet kan inte visas (skapades innan denna funktion). Byt lösenord för att kunna se det här.",
  });
}
