import { NextResponse } from "next/server";
import { godkannAvtalPaServer } from "@/lib/forening-server";

export const runtime = "nodejs";

function lasAccessNyckel(request: Request): string {
  return (
    request.headers.get("x-access-nyckel") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  ).trim();
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const accessNyckel = lasAccessNyckel(request);
    if (!accessNyckel) {
      return NextResponse.json(
        { fel: "Åtkomstnyckel krävs." },
        { status: 401 },
      );
    }
    const forening = await godkannAvtalPaServer(id, accessNyckel);
    return NextResponse.json({ forening });
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Kunde inte godkänna.";
    const status = meddelande.includes("Ogiltig")
      ? 401
      : meddelande.includes("finns inte")
        ? 404
        : meddelande.includes("Spara") ||
            meddelande.includes("Fyll") ||
            meddelande.includes("Ange")
          ? 400
          : 500;
    return NextResponse.json({ fel: meddelande }, { status });
  }
}
