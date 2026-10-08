import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import type { OffertForfraganInput } from "@/lib/offert-forfragan";
import {
  OffertSkrapskyddFel,
  OffertValideringsFel,
  sparaOffertForfragan,
  valideraOffertForfragan,
} from "@/lib/offert-forfragan-server";
import { skickaOffertForfraganTillTeam } from "@/lib/offert-mejl-server";

/** Publik — /offert. Sparar förfrågan så personalen ser den och mejlar teamet. */
export async function POST(request: Request) {
  let body: Partial<OffertForfraganInput> & { webbplats?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ fel: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (body.webbplats?.trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const data = valideraOffertForfragan(body);

    if (!databasArKonfigurerad()) {
      const mejl = await skickaOffertForfraganTillTeam(data);
      if (mejl.levererade === 0) {
        console.error("[offert/forfragan] mejl", mejl.varning);
        return NextResponse.json(
          {
            fel: "Förfrågan kunde inte skickas just nu. Mejla oss direkt på offert@styrelse-navet.se.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: true, sparad: false });
    }

    const forfragan = await sparaOffertForfragan(data);
    const mejl = await skickaOffertForfraganTillTeam(data).catch((error) => {
      console.error("[offert/forfragan] mejl", error);
      return null;
    });
    return NextResponse.json({
      ok: true,
      sparad: true,
      id: forfragan.id,
      mejlLevererat: Boolean(mejl && mejl.levererade > 0),
    });
  } catch (error) {
    if (error instanceof OffertValideringsFel) {
      return NextResponse.json({ fel: error.message }, { status: 400 });
    }
    if (error instanceof OffertSkrapskyddFel) {
      return NextResponse.json({ fel: error.message }, { status: 429 });
    }
    console.error("[offert/forfragan]", error);
    return NextResponse.json(
      { fel: "Kunde inte skicka förfrågan. Mejla oss direkt på offert@styrelse-navet.se." },
      { status: 500 },
    );
  }
}
