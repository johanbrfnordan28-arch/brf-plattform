import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skickaTillfalligtLosenord } from "@/lib/auth/auth-tjanst";
import { lasSession } from "@/lib/auth/session";

function basUrlFran(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return new URL(req.url).origin;
}

/**
 * Skickar nytt tillfälligt lösenord via mejl.
 * - Inloggad: skickar till eget konto (epost valfri).
 * - Utan session: kräver epost (t.ex. efter skapa förening).
 */
export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as { epost?: string };
    const session = await lasSession();
    const epost = (body.epost || session?.epost || "").trim();
    if (!epost) {
      return NextResponse.json(
        { fel: "Ange e-postadressen lösenordet ska skickas till." },
        { status: 400 },
      );
    }

    const resultat = await skickaTillfalligtLosenord({
      epost,
      basUrl: basUrlFran(req),
      kontoId: session?.typ === "STYRELSE" ? session.kontoId : undefined,
    });

    return NextResponse.json({
      ok: true,
      skickat: resultat.skickat,
      mejlVia: resultat.mejlVia,
      meddelande:
        resultat.mejlVia === "resend"
          ? "Ett nytt tillfälligt lösenord har skickats till din e-post."
          : "Lösenordet är sparat för utskick (mejltjänst ej konfigurerad — syns i mejl-outbox).",
    });
  } catch (e) {
    return NextResponse.json(
      {
        fel:
          e instanceof Error
            ? e.message
            : "Kunde inte skicka lösenord.",
      },
      { status: 400 },
    );
  }
}
