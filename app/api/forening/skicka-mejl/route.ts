import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { skickaMejl } from "@/lib/auth/mejl";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      till?: string;
      amne?: string;
      brodtext?: string;
    };

    const till = typeof body.till === "string" ? body.till.trim() : "";
    const amne = typeof body.amne === "string" ? body.amne.trim() : "";
    const brodtext =
      typeof body.brodtext === "string" ? body.brodtext.trim() : "";

    if (!till || !amne || !brodtext) {
      return NextResponse.json(
        { fel: "till, amne och brodtext krävs." },
        { status: 400 },
      );
    }

    if (!databasArKonfigurerad()) {
      return NextResponse.json({
        ok: true,
        via: "demo",
        meddelande: "Databas saknas — mejlet loggas lokalt i klienten.",
      });
    }

    const resultat = await skickaMejl({ till, amne, brodtext });
    return NextResponse.json({ ok: true, via: resultat.via, id: resultat.id });
  } catch (error) {
    console.error("[skicka-mejl]", error);
    return NextResponse.json(
      { fel: "Kunde inte skicka mejl." },
      { status: 500 },
    );
  }
}
