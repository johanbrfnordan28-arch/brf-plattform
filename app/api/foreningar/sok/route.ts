import { NextResponse } from "next/server";
import { sokForeningarPaServer } from "@/lib/forening-server";

export const runtime = "nodejs";

/** Sök — minst 3 bokstäver. Returnerar högst 5 träffar, aldrig hela listan. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const foreningar = await sokForeningarPaServer(q);
    return NextResponse.json({ foreningar });
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Sökning misslyckades.";
    return NextResponse.json({ fel: meddelande }, { status: 500 });
  }
}
