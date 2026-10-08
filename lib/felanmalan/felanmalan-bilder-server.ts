import { del, get, list, put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";
import {
  FELANMALAN_BILDER,
  parseBilder,
  type FelanmalanBildRad,
} from "@/lib/felanmalan/felanmalan-typer";

export class BildFel extends Error {}

export function bildlagringArKonfigurerad(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim(),
  );
}

const FILTYPER: { contentType: string; filandelse: string; magi: number[] }[] = [
  { contentType: "image/jpeg", filandelse: "jpg", magi: [0xff, 0xd8, 0xff] },
  { contentType: "image/png", filandelse: "png", magi: [0x89, 0x50, 0x4e, 0x47] },
  { contentType: "image/webp", filandelse: "webp", magi: [0x52, 0x49, 0x46, 0x46] },
];

function kannIgenFiltyp(bytes: Uint8Array) {
  return FILTYPER.find((t) => t.magi.every((b, i) => bytes[i] === b)) ?? null;
}

export type InkommenBild = { bytes: Uint8Array; typ: (typeof FILTYPER)[number] };

/** Kontrollerar antal, storlek och att filerna verkligen är bilder — innan ärendet skapas. */
export async function valideraBilder(filer: File[]): Promise<InkommenBild[]> {
  if (filer.length === 0) return [];
  if (!bildlagringArKonfigurerad()) {
    throw new BildFel("Bilder kan inte tas emot just nu. Skicka felanmälan utan bilder.");
  }
  if (filer.length > FELANMALAN_BILDER.maxAntal) {
    throw new BildFel(`Högst ${FELANMALAN_BILDER.maxAntal} bilder per felanmälan.`);
  }
  const bilder: InkommenBild[] = [];
  for (const fil of filer) {
    if (fil.size > FELANMALAN_BILDER.maxBytes) {
      throw new BildFel("En av bilderna är för stor.");
    }
    const bytes = new Uint8Array(await fil.arrayBuffer());
    const typ = kannIgenFiltyp(bytes);
    if (!typ) {
      throw new BildFel("Bara bilder i formaten JPG, PNG eller WebP kan bifogas.");
    }
    bilder.push({ bytes, typ });
  }
  return bilder;
}

function bildPrefix(foreningId: string): string {
  return `felanmalan/${foreningId}/`;
}

/** Laddar upp bilderna privat och kopplar dem till ärendet. Returnerar antal sparade. */
export async function sparaBilderPaArende(opts: {
  foreningId: string;
  arendeId: string;
  bilder: InkommenBild[];
}): Promise<number> {
  const sparade: FelanmalanBildRad[] = [];
  for (const bild of opts.bilder) {
    const id = skapaId("bild");
    const pathname = `${bildPrefix(opts.foreningId)}${opts.arendeId}/${id}.${bild.typ.filandelse}`;
    try {
      await put(pathname, Buffer.from(bild.bytes), {
        access: "private",
        contentType: bild.typ.contentType,
        addRandomSuffix: false,
      });
      sparade.push({
        id,
        pathname,
        contentType: bild.typ.contentType,
        storlekBytes: bild.bytes.byteLength,
      });
    } catch (e) {
      console.error("[felanmalan] Bilduppladdning misslyckades:", e);
    }
  }
  if (sparade.length > 0) {
    await prisma.felanmalanArende.update({
      where: { id: opts.arendeId },
      data: { bilder: sparade as unknown as Prisma.InputJsonValue },
    });
  }
  return sparade.length;
}

export async function hamtaArendeBild(opts: {
  foreningId: string;
  arendeId: string;
  bildId: string;
}) {
  const arende = await prisma.felanmalanArende.findFirst({
    where: { id: opts.arendeId, foreningId: opts.foreningId },
    select: { bilder: true },
  });
  const bild = parseBilder(arende?.bilder).find((b) => b.id === opts.bildId);
  if (!bild || !bild.pathname.startsWith(bildPrefix(opts.foreningId))) return null;
  const resultat = await get(bild.pathname, { access: "private" });
  return resultat?.statusCode === 200 ? { bild, stream: resultat.stream } : null;
}

/** Tar bort alla felanmälningsbilder för en förening (vid permanent radering). */
export async function raderaForeningensBilder(foreningId: string): Promise<void> {
  if (!bildlagringArKonfigurerad() || !foreningId) return;
  let cursor: string | undefined;
  do {
    const sida = await list({ prefix: bildPrefix(foreningId), cursor, limit: 1000 });
    if (sida.blobs.length > 0) {
      await del(sida.blobs.map((b) => b.pathname));
    }
    cursor = sida.hasMore ? sida.cursor : undefined;
  } while (cursor);
}
