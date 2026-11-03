import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { arOffertStatus } from "@/lib/offert-forfragan";
import { uppdateraOffertForfragan } from "@/lib/offert-forfragan-server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }
  if (!databasArKonfigurerad()) {
    return NextResponse.json({ fel: "Databasen är inte konfigurerad." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: unknown;
    internAnteckning?: unknown;
    offertSkickad?: unknown;
  };
  if (body.status !== undefined && !arOffertStatus(body.status)) {
    return NextResponse.json({ fel: "Ogiltig status." }, { status: 400 });
  }

  const forfragan = await uppdateraOffertForfragan(id, {
    status: arOffertStatus(body.status) ? body.status : undefined,
    internAnteckning:
      typeof body.internAnteckning === "string" ? body.internAnteckning : undefined,
    offertSkickad: body.offertSkickad === true,
  });
  if (!forfragan) {
    return NextResponse.json({ fel: "Förfrågan hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ forfragan });
}
