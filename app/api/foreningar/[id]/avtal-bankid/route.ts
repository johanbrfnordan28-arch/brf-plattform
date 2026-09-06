import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { signeraAvtalMedBankId } from "@/lib/auth/auth-tjanst";
import { lasSession } from "@/lib/auth/session";
import { verifieraAccessNyckel } from "@/lib/forening-server";
import { prisma } from "@/lib/db";

/**
 * Signerar avtal med BankID (demo-steg tills riktig e-legitimation kopplas in).
 * Kräver antingen styrelsesession för föreningen eller access-nyckel.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Databasen är inte konfigurerad." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { signerNamn?: string };
    const signerNamn = body.signerNamn?.trim();
    if (!signerNamn) {
      return NextResponse.json(
        { fel: "Ange namn för BankID-signering." },
        { status: 400 },
      );
    }

    const session = await lasSession();
    const accessNyckel =
      req.headers.get("x-access-nyckel") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    let behorig = false;
    if (session?.typ === "PLATTFORM") {
      behorig = true;
    } else if (session?.typ === "STYRELSE" && session.foreningId === id) {
      behorig = true;
    } else if (accessNyckel) {
      const rad = await prisma.forening.findUnique({ where: { id } });
      if (rad && verifieraAccessNyckel(accessNyckel, rad.accessNyckelHash)) {
        behorig = true;
      }
    }

    if (!behorig) {
      return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
    }

    const dto = await signeraAvtalMedBankId({ foreningId: id, signerNamn });
    return NextResponse.json({ forening: dto });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Signering misslyckades." },
      { status: 400 },
    );
  }
}
