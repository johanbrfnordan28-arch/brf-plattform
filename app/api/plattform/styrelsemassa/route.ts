import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { listaStyrelsemassaLeads } from "@/lib/styrelsemassa-lead-server";

export async function GET() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  if (!databasArKonfigurerad()) {
    return NextResponse.json({
      leads: [],
      sammanfattning: {
        totalt: 0,
        lankSkickad: 0,
        skapadeTest: 0,
        enbartTest: 0,
      },
      demoLage: true,
    });
  }

  const data = await listaStyrelsemassaLeads();
  return NextResponse.json(data);
}
