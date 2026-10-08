import { NextResponse } from "next/server";
import { arGiltigEpost } from "@/lib/auth/epost";
import { skickaMejl } from "@/lib/auth/mejl";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import {
  arGiltigOrsak,
  arGiltigPrioritet,
  FELANMALAN_MAXLANGD,
} from "@/lib/felanmalan/felanmalan-typer";
import {
  felanmalanMottagare,
  kontrolleraSkrapskydd,
  listaFelanmalan,
  skapaFelanmalan,
  SkrapskyddFel,
} from "@/lib/felanmalan/felanmalan-server";
import {
  byggFelanmalanKvittoMejl,
  byggFelanmalanMejl,
} from "@/lib/felanmalan/felanmalan-mejl";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";

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
  if (!(await harStyrelseBehorighet(req, id)).ok) {
    return NextResponse.json({ fel: "Saknar behörighet." }, { status: 403 });
  }
  const arenden = await listaFelanmalan(id);
  return NextResponse.json({ arenden });
}

type NyFelanmalanBody = {
  rubrik?: string;
  beskrivning?: string;
  medlemNamn?: string;
  medlemEpost?: string;
  medlemTelefon?: string;
  lagenhetsnummer?: string;
  prioritet?: string;
  orsak?: string;
  debiteringKan?: boolean;
  debiteringAnteckning?: string;
  nyckelPlats?: string;
  boendeEjHemma?: boolean;
  /** Dolt fält — fylls bara i av robotar. */
  webbplats?: string;
};

function forLangtFalt(body: NyFelanmalanBody): string | null {
  const falt: [keyof typeof FELANMALAN_MAXLANGD, string, string | undefined][] = [
    ["rubrik", "Rubriken", body.rubrik],
    ["beskrivning", "Beskrivningen", body.beskrivning],
    ["medlemNamn", "Namnet", body.medlemNamn],
    ["medlemEpost", "E-postadressen", body.medlemEpost],
    ["medlemTelefon", "Telefonnumret", body.medlemTelefon],
    ["lagenhetsnummer", "Lägenhetsnumret", body.lagenhetsnummer],
    ["nyckelPlats", "Nyckel/passage", body.nyckelPlats],
    ["debiteringAnteckning", "Kommentaren om debitering", body.debiteringAnteckning],
  ];
  for (const [nyckel, etikett, varde] of falt) {
    if ((varde?.trim().length ?? 0) > FELANMALAN_MAXLANGD[nyckel]) {
      return `${etikett} får vara högst ${FELANMALAN_MAXLANGD[nyckel]} tecken.`;
    }
  }
  return null;
}

async function skickaUtanAttStoppa(
  meddelande: Parameters<typeof skickaMejl>[0],
): Promise<void> {
  try {
    await skickaMejl(meddelande);
  } catch (e) {
    console.error("[felanmalan] Mejl misslyckades:", e);
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      {
        fel: "Felanmälan sparas när databasen är konfigurerad. Kontakta styrelsen direkt.",
      },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as NyFelanmalanBody;

    if (body.webbplats?.trim()) {
      return NextResponse.json(
        { fel: "Kunde inte skicka felanmälan." },
        { status: 400 },
      );
    }
    if (!body.rubrik?.trim() || !body.beskrivning?.trim()) {
      return NextResponse.json(
        { fel: "Ange rubrik och beskrivning av felet." },
        { status: 400 },
      );
    }
    if (!body.medlemNamn?.trim() || !body.medlemEpost?.trim()) {
      return NextResponse.json(
        { fel: "Ange namn och e-post så vi kan återkoppla." },
        { status: 400 },
      );
    }
    if (!arGiltigEpost(body.medlemEpost.trim().toLowerCase())) {
      return NextResponse.json(
        { fel: "Ange en giltig e-postadress." },
        { status: 400 },
      );
    }
    const forLangt = forLangtFalt(body);
    if (forLangt) {
      return NextResponse.json({ fel: forLangt }, { status: 400 });
    }

    await kontrolleraSkrapskydd(id, body.medlemEpost);

    const prioritet =
      body.prioritet && arGiltigPrioritet(body.prioritet)
        ? body.prioritet
        : "normal";
    const orsak =
      body.orsak && arGiltigOrsak(body.orsak) ? body.orsak : "ovrigt";

    const arende = await skapaFelanmalan({
      foreningId: id,
      rubrik: body.rubrik,
      beskrivning: body.beskrivning,
      medlemNamn: body.medlemNamn,
      medlemEpost: body.medlemEpost,
      medlemTelefon: body.medlemTelefon,
      lagenhetsnummer: body.lagenhetsnummer,
      prioritet,
      orsak,
      debiteringKan: body.debiteringKan,
      debiteringAnteckning: body.debiteringAnteckning,
      nyckelPlats: body.nyckelPlats,
      boendeEjHemma: body.boendeEjHemma,
    });

    const forening = await prisma.forening.findUnique({ where: { id } });
    const foreningsNamn = forening?.namn ?? "Föreningen";
    const mottagare = forening ? felanmalanMottagare(forening) : [];
    const reserv = process.env.FELANMALAN_FALLBACK_EPOST?.trim();
    if (mottagare.length === 0 && reserv) mottagare.push(reserv);

    const bas =
      process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ??
      new URL(req.url).origin;
    const styrelseMejl = byggFelanmalanMejl({
      foreningsNamn,
      arende,
      styrelsePanelUrl: `${bas}/forening/felanmalan`,
    });
    const kvitto = byggFelanmalanKvittoMejl({
      foreningsNamn,
      arende,
      jourTelefon: forening?.felanmalanJourTelefon ?? "",
      jourText: forening?.felanmalanJourText ?? "",
    });

    await Promise.all([
      ...mottagare.map((till) =>
        skickaUtanAttStoppa({
          till,
          amne: styrelseMejl.amne,
          brodtext: styrelseMejl.brodtext,
          replyTo: arende.medlemEpost,
        }),
      ),
      skickaUtanAttStoppa({
        till: arende.medlemEpost,
        amne: kvitto.amne,
        brodtext: kvitto.brodtext,
        ...(forening?.epost ? { replyTo: forening.epost } : {}),
      }),
    ]);

    return NextResponse.json({ ok: true, arende });
  } catch (e) {
    if (e instanceof SkrapskyddFel) {
      return NextResponse.json({ fel: e.message }, { status: 429 });
    }
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa ärendet." },
      { status: 400 },
    );
  }
}
