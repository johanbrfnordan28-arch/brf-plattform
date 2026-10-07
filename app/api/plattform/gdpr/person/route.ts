import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { exporteraPerson, raderaPerson } from "@/lib/gdpr-server";

async function kontrollera() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }
  return null;
}

/** Registerutdrag för en person: GET ?epost=… */
export async function GET(req: Request) {
  const nekad = await kontrollera();
  if (nekad) return nekad;

  const epost = new URL(req.url).searchParams.get("epost") ?? "";
  try {
    const data = await exporteraPerson(epost);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="person-export.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte exportera." },
      { status: 400 },
    );
  }
}

/** Radering på begäran: DELETE { epost } */
export async function DELETE(req: Request) {
  const nekad = await kontrollera();
  if (nekad) return nekad;

  const body = (await req.json().catch(() => ({}))) as { epost?: string };
  try {
    const resultat = await raderaPerson(body.epost ?? "");
    return NextResponse.json({ ok: true, resultat });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte radera." },
      { status: 400 },
    );
  }
}
