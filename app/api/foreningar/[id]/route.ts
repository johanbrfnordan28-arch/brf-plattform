import { NextResponse } from "next/server";
import {
  hamtaForeningPaServer,
  uppdateraForeningPaServer,
  type ForeningUpsertInput,
} from "@/lib/forening-server";

export const runtime = "nodejs";

function lasAccessNyckel(request: Request): string {
  return (
    request.headers.get("x-access-nyckel") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  ).trim();
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const accessNyckel = lasAccessNyckel(request);
    if (!accessNyckel) {
      return NextResponse.json(
        { fel: "Åtkomstnyckel krävs." },
        { status: 401 },
      );
    }
    const forening = await hamtaForeningPaServer(id, accessNyckel);
    return NextResponse.json({ forening });
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Kunde inte hämta.";
    const status = meddelande.includes("Ogiltig")
      ? 401
      : meddelande.includes("finns inte")
        ? 404
        : 500;
    return NextResponse.json({ fel: meddelande }, { status });
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const accessNyckel = lasAccessNyckel(request);
    if (!accessNyckel) {
      return NextResponse.json(
        { fel: "Åtkomstnyckel krävs." },
        { status: 401 },
      );
    }
    const body = (await request.json()) as Partial<ForeningUpsertInput>;
    const forening = await uppdateraForeningPaServer(id, accessNyckel, body);
    return NextResponse.json({ forening });
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Kunde inte spara.";
    const status = meddelande.includes("Ogiltig")
      ? 401
      : meddelande.includes("finns inte")
        ? 404
        : meddelande.includes("används redan")
          ? 409
          : 500;
    return NextResponse.json({ fel: meddelande }, { status });
  }
}
