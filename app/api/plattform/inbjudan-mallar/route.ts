import { NextResponse } from "next/server";
import { databasArKonfigurerad } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import {
  listaPersonligaInbjudanMallar,
  skapaPersonligInbjudanMall,
  uppdateraPersonligInbjudanMall,
  taBortPersonligInbjudanMall,
} from "@/lib/inbjudan-mall-server";

async function kravPlattform() {
  const session = await lasSession();
  if (!session || session.typ !== "PLATTFORM") return null;
  return session;
}

export async function GET() {
  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  if (!databasArKonfigurerad()) {
    return NextResponse.json({ demoLage: true, mallar: [] });
  }

  try {
    const mallar = await listaPersonligaInbjudanMallar(session.epost);
    return NextResponse.json({ mallar });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ladda mallar." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Mallar sparas när DATABASE_URL är satt i Vercel." },
      { status: 503 },
    );
  }

  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      titel?: string;
      avsandareNamn?: string;
      mejlAmne?: string;
      mejlMall?: string;
      arStandard?: boolean;
    };

    const mall = await skapaPersonligInbjudanMall({
      agareEpost: session.epost,
      titel: body.titel ?? "",
      avsandareNamn: body.avsandareNamn,
      mejlAmne: body.mejlAmne ?? "",
      mejlMall: body.mejlMall ?? "",
      arStandard: body.arStandard,
    });

    return NextResponse.json({ ok: true, mall });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte skapa mall." },
      { status: 400 },
    );
  }
}

export async function PUT(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Mallar sparas när DATABASE_URL är satt i Vercel." },
      { status: 503 },
    );
  }

  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      titel?: string;
      avsandareNamn?: string;
      mejlAmne?: string;
      mejlMall?: string;
      arStandard?: boolean;
    };

    if (!body.id?.trim()) {
      return NextResponse.json({ fel: "Ange mall-id." }, { status: 400 });
    }

    const mall = await uppdateraPersonligInbjudanMall({
      id: body.id.trim(),
      agareEpost: session.epost,
      titel: body.titel,
      avsandareNamn: body.avsandareNamn,
      mejlAmne: body.mejlAmne,
      mejlMall: body.mejlMall,
      arStandard: body.arStandard,
    });

    return NextResponse.json({ ok: true, mall });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte uppdatera mall." },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!databasArKonfigurerad()) {
    return NextResponse.json(
      { fel: "Mallar sparas när DATABASE_URL är satt i Vercel." },
      { status: 503 },
    );
  }

  const session = await kravPlattform();
  if (!session) {
    return NextResponse.json({ fel: "Endast plattformsadmin." }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ fel: "Ange mall-id." }, { status: 400 });
    }

    await taBortPersonligInbjudanMall({ id, agareEpost: session.epost });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ta bort mall." },
      { status: 400 },
    );
  }
}
