import { NextResponse } from "next/server";
import { del, get } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { harStyrelseBehorighet } from "@/lib/auth/styrelse-behorighet";
import {
  arGiltigFilSokvag,
  blobArKonfigurerad,
  MAX_FORENING_FIL_BYTE,
  TILLATNA_FIL_TYPER,
} from "@/lib/forening-filer-server";

type Ctx = { params: Promise<{ id: string }> };

async function kontrollera(
  req: Request,
  ctx: Ctx,
): Promise<{ ok: true; id: string } | { ok: false; svar: NextResponse }> {
  if (!blobArKonfigurerad()) {
    return {
      ok: false,
      svar: NextResponse.json(
        { fel: "Fillagringen är inte konfigurerad." },
        { status: 503 },
      ),
    };
  }
  const { id } = await ctx.params;
  const beh = await harStyrelseBehorighet(req, id);
  if (!beh.ok) {
    return {
      ok: false,
      svar: NextResponse.json(
        { fel: "Du saknar behörighet till föreningens filer." },
        { status: 403 },
      ),
    };
  }
  return { ok: true, id };
}

function sokvagFranUrl(req: Request): string {
  return new URL(req.url).searchParams.get("pathname") ?? "";
}

/** Ger klienten en kortlivad token för direktuppladdning till Blob. */
export async function POST(req: Request, ctx: Ctx) {
  const k = await kontrollera(req, ctx);
  if (!k.ok) return k.svar;

  try {
    const body = (await req.json()) as HandleUploadBody;
    const svar = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!arGiltigFilSokvag(k.id, pathname)) {
          throw new Error("Ogiltig sökväg för föreningens filer.");
        }
        return {
          allowedContentTypes: TILLATNA_FIL_TYPER,
          maximumSizeInBytes: MAX_FORENING_FIL_BYTE,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(svar);
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte förbereda uppladdningen." },
      { status: 400 },
    );
  }
}

export async function GET(req: Request, ctx: Ctx) {
  const k = await kontrollera(req, ctx);
  if (!k.ok) return k.svar;
  const pathname = sokvagFranUrl(req);
  if (!pathname) return NextResponse.json({ ok: true });
  if (!arGiltigFilSokvag(k.id, pathname)) {
    return NextResponse.json({ fel: "Ogiltig sökväg." }, { status: 400 });
  }

  const res = await get(pathname, { access: "private" });
  if (!res || res.statusCode !== 200) {
    return NextResponse.json({ fel: "Filen finns inte." }, { status: 404 });
  }
  return new NextResponse(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType || "application/octet-stream",
      "Content-Length": String(res.blob.size),
      "Content-Disposition": res.blob.contentDisposition,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
    },
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const k = await kontrollera(req, ctx);
  if (!k.ok) return k.svar;
  const pathname = sokvagFranUrl(req);
  if (!arGiltigFilSokvag(k.id, pathname)) {
    return NextResponse.json({ fel: "Ogiltig sökväg." }, { status: 400 });
  }
  try {
    await del(pathname);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { fel: e instanceof Error ? e.message : "Kunde inte ta bort filen." },
      { status: 500 },
    );
  }
}
