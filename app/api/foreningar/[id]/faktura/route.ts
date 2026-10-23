import { NextResponse } from "next/server";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import { meddelaSigneratKundavtal } from "@/lib/forening-avtal-meddelande";
import type { ForeningFakturaUppgifter } from "@/lib/forening-faktura";

function lasFaktura(body: unknown): ForeningFakturaUppgifter {
  const o =
    body && typeof body === "object"
      ? (body as Partial<ForeningFakturaUppgifter>)
      : {};
  return {
    epost: typeof o.epost === "string" ? o.epost.trim() : "",
    adress: typeof o.adress === "string" ? o.adress.trim() : "",
    postnummer: typeof o.postnummer === "string" ? o.postnummer.trim() : "",
    ort: typeof o.ort === "string" ? o.ort.trim() : "",
    referens: typeof o.referens === "string" ? o.referens.trim() : "",
  };
}

function lasUndertecknare(
  body: unknown,
): { namn: string; epost: string }[] {
  if (!Array.isArray(body)) return [];
  return body
    .map((rad) => {
      if (!rad || typeof rad !== "object") return null;
      const o = rad as { namn?: unknown; epost?: unknown };
      const namn = typeof o.namn === "string" ? o.namn.trim() : "";
      const epost = typeof o.epost === "string" ? o.epost.trim() : "";
      if (!namn && !epost) return null;
      return { namn, epost };
    })
    .filter((rad): rad is { namn: string; epost: string } => rad !== null)
    .slice(0, 2);
}

/**
 * Efter signerat avtal: fakturaunderlag till ekonomi och bekräftelse till personal.
 * Föreningen ser inte den här åtgärden som en egen knapp.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const behorighet = await harStyrelseBehorighet(req, id);
  if (!behorighet.ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      foreningsNamn?: string;
      organisationsnummer?: string;
      faktura?: unknown;
      antalLagenheter?: number;
      undertecknare?: unknown;
    };
    const resultat = await meddelaSigneratKundavtal({
      foreningsNamn: body.foreningsNamn?.trim() || "Föreningen",
      organisationsnummer: body.organisationsnummer?.trim() ?? "",
      faktura: lasFaktura(body.faktura),
      antalLagenheter: Number(body.antalLagenheter) || 0,
      undertecknare: lasUndertecknare(body.undertecknare),
    });
    if (!resultat.ok) {
      return NextResponse.json({ fel: resultat.meddelande }, { status: 502 });
    }
    return NextResponse.json({ meddelande: resultat.meddelande });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skicka beskedet." },
      { status: 400 },
    );
  }
}
