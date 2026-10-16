import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import {
  lasDriftTjanstState,
  sparaDriftTjanstState,
} from "@/lib/drift-tjanst-server";
import {
  hamtaAvtalViaToken,
  hamtaUppdragViaToken,
  kvitteraUppdragIState,
  signeraDriftAvtalIState,
} from "@/lib/drift-tjanst-logik";
import { personnummerTillNyckel } from "@/lib/auth/personnummer-nyckel";
import {
  arGiltigtPersonnummer,
  maskeraPersonnummer,
} from "@/lib/personnummer-format";
import type { BankIdPart } from "@/lib/bankid-signering";

export const dynamic = "force-dynamic";

export async function GET(
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
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ fel: "Token saknas." }, { status: 400 });
  }
  try {
    const state = await lasDriftTjanstState(id);
    if (!state) {
      return NextResponse.json({ fel: "Länken är ogiltig." }, { status: 404 });
    }
    const avtal = hamtaAvtalViaToken(state, token);
    if (avtal) {
      return NextResponse.json({ typ: "avtal", avtal });
    }
    const uppdrag = hamtaUppdragViaToken(state, token);
    if (uppdrag) {
      const tillhor = state.avtal.find((a) => a.id === uppdrag.avtalId) ?? null;
      return NextResponse.json({ typ: "uppdrag", uppdrag, avtal: tillhor });
    }
    return NextResponse.json({ fel: "Länken är ogiltig." }, { status: 404 });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte hämta." },
      { status: 400 },
    );
  }
}

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
    const body = (await req.json()) as {
      token?: string;
      atgard?: string;
      namn?: string;
      personnummer?: string;
      part?: BankIdPart;
      metod?: "bankid" | "namn";
      genomfordaPunktIds?: string[];
    };
    const token = body.token?.trim() ?? "";
    const atgard = body.atgard;
    const namn = body.namn?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ fel: "Token saknas." }, { status: 400 });
    }
    if (!namn) {
      return NextResponse.json({ fel: "Ange namn för signering." }, { status: 400 });
    }
    const state = await lasDriftTjanstState(id);
    if (!state) {
      return NextResponse.json({ fel: "Föreningen hittades inte." }, { status: 404 });
    }

    if (atgard === "godkann-avtal") {
      const pnr = body.personnummer?.trim() ?? "";
      if (!arGiltigtPersonnummer(pnr)) {
        return NextResponse.json(
          { fel: "Ange ett giltigt personnummer för den som ska signera." },
          { status: 400 },
        );
      }
      const nyckel = personnummerTillNyckel(pnr);
      if (!nyckel) {
        return NextResponse.json(
          { fel: "Kunde inte läsa personnummer från BankID." },
          { status: 400 },
        );
      }
      const part: BankIdPart =
        body.part === "forening" ? "forening" : "foretag";
      const resultat = signeraDriftAvtalIState(state, token, {
        namn,
        personnummerMaskerat: maskeraPersonnummer(pnr),
        personnummerNyckel: nyckel,
        tidpunkt: new Date().toISOString(),
        part,
      });
      if (!resultat.ok) {
        return NextResponse.json({ fel: resultat.fel }, { status: 400 });
      }
      await sparaDriftTjanstState(id, resultat.state);
      return NextResponse.json({ typ: "avtal", avtal: resultat.avtal });
    }

    if (atgard === "kvittera-uppdrag") {
      const resultat = kvitteraUppdragIState(state, token, {
        namn,
        metod: body.metod === "namn" ? "namn" : "bankid",
        genomfordaPunktIds: Array.isArray(body.genomfordaPunktIds)
          ? body.genomfordaPunktIds
          : [],
      });
      if (!resultat.ok) {
        return NextResponse.json({ fel: resultat.fel }, { status: 400 });
      }
      await sparaDriftTjanstState(id, resultat.state);
      const tillhor = resultat.state.avtal.find(
        (a) => a.id === resultat.uppdrag.avtalId,
      );
      return NextResponse.json({
        typ: "uppdrag",
        uppdrag: resultat.uppdrag,
        avtal: tillhor ?? null,
      });
    }

    return NextResponse.json({ fel: "Okänd åtgärd." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte spara." },
      { status: 400 },
    );
  }
}
