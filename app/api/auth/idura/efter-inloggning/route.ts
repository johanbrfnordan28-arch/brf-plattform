import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { tillDto } from "@/lib/forening-server";
import { utfardaAccessNyckelForMedlem } from "@/lib/auth/auth-tjanst";

export async function GET() {
  const session = await lasSession();
  if (!session || session.typ !== "STYRELSE" || !session.foreningId) {
    return NextResponse.json({ fel: "Inte inloggad." }, { status: 401 });
  }

  const foreningRad = await prisma.forening.findUnique({
    where: { id: session.foreningId },
  });
  if (!foreningRad || foreningRad.borttagenTidpunkt) {
    return NextResponse.json({ fel: "Föreningen hittades inte." }, { status: 404 });
  }

  const accessNyckel = await utfardaAccessNyckelForMedlem(
    session.foreningId,
    session.kontoId,
  );

  return NextResponse.json({
    ok: true,
    foreningId: session.foreningId,
    forening: tillDto(foreningRad),
    accessNyckel,
    epost: session.epost,
  });
}
