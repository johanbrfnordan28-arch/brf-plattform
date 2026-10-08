import { prisma } from "@/lib/db";
import { lasSession } from "@/lib/auth/session";
import { verifieraAccessNyckel } from "@/lib/forening-server";
import { skapaId } from "@/lib/auth/session";
import {
  FORENING_BACKUP_FORMAT,
  FORENING_BACKUP_VERSION,
  filnamnForBackup,
  type ForeningBackup,
} from "@/lib/forening-backup";
import { beraknaInnehallHash } from "@/lib/forening-innehall-hash";

const MAX_PAYLOAD_BYTES = 4_500_000;
const MAX_KOPIOR_PER_FORENING = 30;
/** En automatisk kopia per dag — så här många dagar bakåt sparas. */
const MAX_AUTOMATISKA_KOPIOR = 14;

export type SakerhetskopiaListaRad = {
  id: string;
  foreningsNamn: string;
  filnamn: string;
  exportedAt: string;
  antalNycklar: number;
  storlekBytes: number;
  skapadTidpunkt: string;
  skapadAvEpost: string;
  automatisk: boolean;
};

export type AutoKopiaInfo = {
  id: string;
  innehallHash: string;
  exportedAt: string;
  antalNycklar: number;
  skapadAvEpost: string;
};

export type SparaAutoKopiaResultat =
  | { status: "sparad" | "oforandrad"; senaste: AutoKopiaInfo }
  | { status: "konflikt"; senaste: AutoKopiaInfo };

export async function kravForeningBehorighet(
  req: Request,
  foreningId: string,
): Promise<{ ok: true; epost: string } | { ok: false; status: number; fel: string }> {
  const session = await lasSession();
  if (session?.typ === "PLATTFORM") {
    return { ok: true, epost: session.epost };
  }
  if (session?.typ === "STYRELSE" && session.foreningId === foreningId) {
    return { ok: true, epost: session.epost };
  }

  const accessNyckel =
    req.headers.get("x-access-nyckel") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (accessNyckel) {
    const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
    if (rad && verifieraAccessNyckel(accessNyckel, rad.accessNyckelHash)) {
      return { ok: true, epost: session?.epost || rad.epost || "" };
    }
  }

  return {
    ok: false,
    status: 403,
    fel: "Du saknar behörighet till denna förenings säkerhetskopior.",
  };
}

export function parsaBackupPayload(raw: unknown): ForeningBackup | string {
  if (!raw || typeof raw !== "object") return "Ogiltig säkerhetskopia.";
  const o = raw as Record<string, unknown>;
  if (o.format !== FORENING_BACKUP_FORMAT) {
    return "Filen är inte en Styrelse-Navet-säkerhetskopia.";
  }
  if (o.version !== FORENING_BACKUP_VERSION) {
    return "Säkerhetskopians version stöds inte.";
  }
  if (typeof o.foreningId !== "string" || !o.foreningId.trim()) {
    return "Säkerhetskopian saknar förenings-id.";
  }
  if (typeof o.exportedAt !== "string") {
    return "Säkerhetskopian saknar datum.";
  }
  if (!o.keys || typeof o.keys !== "object" || Array.isArray(o.keys)) {
    return "Säkerhetskopian saknar data.";
  }
  return {
    format: FORENING_BACKUP_FORMAT,
    version: FORENING_BACKUP_VERSION,
    exportedAt: o.exportedAt,
    foreningId: o.foreningId.trim(),
    profil:
      o.profil && typeof o.profil === "object"
        ? (o.profil as ForeningBackup["profil"])
        : null,
    keys: o.keys as Record<string, string>,
  };
}

export async function listaSakerhetskopior(
  foreningId: string,
): Promise<SakerhetskopiaListaRad[]> {
  const rader = await prisma.foreningSakerhetskopia.findMany({
    where: { foreningId },
    orderBy: { exportedAt: "desc" },
    select: {
      id: true,
      foreningsNamn: true,
      filnamn: true,
      exportedAt: true,
      antalNycklar: true,
      storlekBytes: true,
      skapadTidpunkt: true,
      skapadAvEpost: true,
      automatisk: true,
    },
  });
  return rader.map((r) => ({
    id: r.id,
    foreningsNamn: r.foreningsNamn,
    filnamn: r.filnamn,
    exportedAt: r.exportedAt.toISOString(),
    antalNycklar: r.antalNycklar,
    storlekBytes: r.storlekBytes,
    skapadTidpunkt: r.skapadTidpunkt.toISOString(),
    skapadAvEpost: r.skapadAvEpost,
    automatisk: r.automatisk,
  }));
}

export async function sparaSakerhetskopia(opts: {
  foreningId: string;
  backup: ForeningBackup;
  epost: string;
}): Promise<SakerhetskopiaListaRad> {
  const data = await forberedKopiaData(opts);
  const rad = await prisma.foreningSakerhetskopia.create({
    data: { id: skapaId("bak"), ...data },
  });

  // Behåll senaste N manuella kopior
  const alla = await prisma.foreningSakerhetskopia.findMany({
    where: { foreningId: opts.foreningId, automatisk: false },
    orderBy: { exportedAt: "desc" },
    select: { id: true },
  });
  const over = alla.slice(MAX_KOPIOR_PER_FORENING);
  if (over.length > 0) {
    await prisma.foreningSakerhetskopia.deleteMany({
      where: { id: { in: over.map((x) => x.id) } },
    });
  }

  return {
    id: rad.id,
    foreningsNamn: rad.foreningsNamn,
    filnamn: rad.filnamn,
    exportedAt: rad.exportedAt.toISOString(),
    antalNycklar: rad.antalNycklar,
    storlekBytes: rad.storlekBytes,
    skapadTidpunkt: rad.skapadTidpunkt.toISOString(),
    skapadAvEpost: rad.skapadAvEpost,
    automatisk: rad.automatisk,
  };
}

async function forberedKopiaData(opts: {
  foreningId: string;
  backup: ForeningBackup;
  epost: string;
}) {
  if (opts.backup.foreningId !== opts.foreningId) {
    throw new Error("Säkerhetskopian tillhör en annan förening.");
  }
  const forening = await prisma.forening.findUnique({
    where: { id: opts.foreningId },
    select: { namn: true },
  });
  if (!forening) {
    throw new Error("Föreningen finns inte på servern ännu. Synka profilen först.");
  }

  const payloadText = JSON.stringify(opts.backup);
  const storlekBytes = Buffer.byteLength(payloadText, "utf8");
  if (storlekBytes > MAX_PAYLOAD_BYTES) {
    throw new Error("Säkerhetskopian är för stor att spara på servern.");
  }
  const exportedAt = new Date(opts.backup.exportedAt);
  if (Number.isNaN(exportedAt.getTime())) {
    throw new Error("Ogiltigt datum i säkerhetskopian.");
  }

  return {
    foreningId: opts.foreningId,
    foreningsNamn:
      opts.backup.profil?.namn?.trim() || forening.namn || opts.foreningId,
    filnamn: filnamnForBackup(opts.backup),
    exportedAt,
    version: opts.backup.version,
    antalNycklar: Object.keys(opts.backup.keys).length,
    storlekBytes,
    payload: opts.backup as object,
    skapadAvEpost: opts.epost,
    innehallHash: await beraknaInnehallHash(opts.backup.keys),
  };
}

function svenskDag(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
}

const AUTO_INFO_SELECT = {
  id: true,
  innehallHash: true,
  exportedAt: true,
  antalNycklar: true,
  skapadAvEpost: true,
} as const;

function tillAutoInfo(rad: {
  id: string;
  innehallHash: string;
  exportedAt: Date;
  antalNycklar: number;
  skapadAvEpost: string;
}): AutoKopiaInfo {
  return { ...rad, exportedAt: rad.exportedAt.toISOString() };
}

export async function hamtaSenasteAutoKopia(
  foreningId: string,
): Promise<AutoKopiaInfo | null> {
  const rad = await prisma.foreningSakerhetskopia.findFirst({
    where: { foreningId, automatisk: true },
    orderBy: { exportedAt: "desc" },
    select: AUTO_INFO_SELECT,
  });
  return rad ? tillAutoInfo(rad) : null;
}

/**
 * Sparar webbläsarens läge som dagens automatiska kopia.
 * `basHash` är den version webbläsaren senast hämtade eller sparade — skiljer
 * den sig från serverns senaste har någon annan sparat emellan (konflikt).
 */
export async function sparaAutoKopia(opts: {
  foreningId: string;
  backup: ForeningBackup;
  epost: string;
  basHash: string | null;
  tvinga: boolean;
}): Promise<SparaAutoKopiaResultat> {
  const data = await forberedKopiaData(opts);
  const senaste = await prisma.foreningSakerhetskopia.findFirst({
    where: { foreningId: opts.foreningId, automatisk: true },
    orderBy: { exportedAt: "desc" },
    select: { ...AUTO_INFO_SELECT, skapadTidpunkt: true },
  });

  if (senaste) {
    if (senaste.innehallHash === data.innehallHash) {
      return { status: "oforandrad", senaste: tillAutoInfo(senaste) };
    }
    if (!opts.tvinga && opts.basHash !== senaste.innehallHash) {
      return { status: "konflikt", senaste: tillAutoInfo(senaste) };
    }
  }

  const skrivsOverVidKonflikt =
    senaste && opts.tvinga && opts.basHash !== senaste.innehallHash;
  if (skrivsOverVidKonflikt) {
    // Den andra webbläsarens version ska gå att återställa.
    await prisma.foreningSakerhetskopia.update({
      where: { id: senaste.id },
      data: { automatisk: false },
    });
  }

  const rad =
    senaste &&
    !skrivsOverVidKonflikt &&
    svenskDag(senaste.skapadTidpunkt) === svenskDag(new Date())
      ? await prisma.foreningSakerhetskopia.update({
          where: { id: senaste.id },
          data: { ...data, automatisk: true },
          select: AUTO_INFO_SELECT,
        })
      : await prisma.foreningSakerhetskopia.create({
          data: { id: skapaId("auto"), ...data, automatisk: true },
          select: AUTO_INFO_SELECT,
        });

  const automatiska = await prisma.foreningSakerhetskopia.findMany({
    where: { foreningId: opts.foreningId, automatisk: true },
    orderBy: { exportedAt: "desc" },
    select: { id: true },
  });
  const over = automatiska.slice(MAX_AUTOMATISKA_KOPIOR);
  if (over.length > 0) {
    await prisma.foreningSakerhetskopia.deleteMany({
      where: { id: { in: over.map((x) => x.id) } },
    });
  }

  return { status: "sparad", senaste: tillAutoInfo(rad) };
}

export async function hamtaSakerhetskopiaPayload(
  foreningId: string,
  backupId: string,
): Promise<ForeningBackup> {
  const rad = await prisma.foreningSakerhetskopia.findFirst({
    where: { id: backupId, foreningId },
  });
  if (!rad) throw new Error("Säkerhetskopian hittades inte.");
  const parsad = parsaBackupPayload(rad.payload);
  if (typeof parsad === "string") throw new Error(parsad);
  return parsad;
}

export async function taBortSakerhetskopia(
  foreningId: string,
  backupId: string,
): Promise<void> {
  const resultat = await prisma.foreningSakerhetskopia.deleteMany({
    where: { id: backupId, foreningId },
  });
  if (resultat.count === 0) {
    throw new Error("Säkerhetskopian hittades inte.");
  }
}
