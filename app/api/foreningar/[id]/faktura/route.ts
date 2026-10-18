import { NextResponse } from "next/server";
import { skickaMejl } from "@/lib/auth/mejl";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import {
  arFakturaUppgifterKlara,
  byggFakturaMejl,
  kvartalsperiod,
  type ForeningFakturaUppgifter,
} from "@/lib/forening-faktura";
import { beraknaPris } from "@/lib/prislista";

function lasFaktura(body: unknown): ForeningFakturaUppgifter | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Partial<ForeningFakturaUppgifter>;
  if (typeof o.epost !== "string") return null;
  return {
    epost: o.epost.trim(),
    adress: typeof o.adress === "string" ? o.adress.trim() : "",
    postnummer: typeof o.postnummer === "string" ? o.postnummer.trim() : "",
    ort: typeof o.ort === "string" ? o.ort.trim() : "",
    referens: typeof o.referens === "string" ? o.referens.trim() : "",
  };
}

/** Skickar kvartalsfaktura till föreningens fakturamottagare. */
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
    };
    const faktura = lasFaktura(body.faktura);
    if (!faktura || !arFakturaUppgifterKlara(faktura)) {
      return NextResponse.json(
        { fel: "Ange fakturaadress och e-post dit fakturan ska skickas." },
        { status: 400 },
      );
    }
    const antal = Number(body.antalLagenheter);
    const pris = beraknaPris(antal);
    if (!pris) {
      return NextResponse.json(
        {
          fel:
            antal > 100
              ? "För mer än 100 lägenheter tar vi fram offert — kontakta oss."
              : "Ange antal lägenheter i grunduppgifterna innan fakturan skickas.",
        },
        { status: 400 },
      );
    }

    const namn = body.foreningsNamn?.trim() || "Föreningen";
    const period = kvartalsperiod();
    const mejl = byggFakturaMejl({
      foreningsNamn: namn,
      organisationsnummer: body.organisationsnummer?.trim() ?? "",
      faktura,
      pris,
      periodEtikett: period.etikett,
    });
    const resultat = await skickaMejl({
      till: faktura.epost,
      amne: mejl.amne,
      brodtext: mejl.brodtext,
    });

    return NextResponse.json({
      mejlVia: resultat.via,
      meddelande: mejlSkickades(resultat.via)
        ? `Fakturan för ${period.etikett} har skickats till ${faktura.epost}.`
        : resultat.fel
          ? `Fakturan sparades men mejlet levererades inte: ${resultat.fel}`
          : `Fakturan sparades. Mejlet kunde inte skickas automatiskt till ${faktura.epost}.`,
    });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skicka fakturan." },
      { status: 400 },
    );
  }
}
