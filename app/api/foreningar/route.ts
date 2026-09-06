import { NextResponse } from "next/server";
import {
  skapaForeningPaServer,
  type ForeningUpsertInput,
} from "@/lib/forening-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForeningUpsertInput;
    if (!body?.id || !body?.namn) {
      return NextResponse.json(
        { fel: "id och namn krävs." },
        { status: 400 },
      );
    }
    const { dto, accessNyckel } = await skapaForeningPaServer(body);
    return NextResponse.json({ forening: dto, accessNyckel }, { status: 201 });
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Kunde inte skapa.";
    const status = meddelande.includes("finns redan") ? 409 : 500;
    return NextResponse.json({ fel: meddelande }, { status });
  }
}
