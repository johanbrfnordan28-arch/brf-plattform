import type { Forening } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normaliseraEpost } from "@/lib/auth/epost";
import { tillDto, type ForeningServerDto } from "@/lib/forening-server";

export type ForeningBorttagDto = ForeningServerDto & {
  borttagenTidpunkt: string | null;
  borttagenAvEpost: string;
};

function tillBorttagDto(rad: Forening): ForeningBorttagDto {
  return {
    ...tillDto(rad),
    borttagenTidpunkt: rad.borttagenTidpunkt?.toISOString() ?? null,
    borttagenAvEpost: rad.borttagenAvEpost,
  };
}

export async function flyttaForeningTillBorttagna(opts: {
  foreningId: string;
  avEpost: string;
}): Promise<ForeningBorttagDto> {
  const rad = await prisma.forening.findUnique({
    where: { id: opts.foreningId },
  });
  if (!rad) throw new Error("Föreningen hittades inte.");
  if (rad.borttagenTidpunkt) {
    throw new Error("Föreningen är redan borttagen.");
  }

  const uppdaterad = await prisma.forening.update({
    where: { id: opts.foreningId },
    data: {
      borttagenTidpunkt: new Date(),
      borttagenAvEpost: normaliseraEpost(opts.avEpost),
    },
  });

  return tillBorttagDto(uppdaterad);
}

export async function aterstallBorttagenForening(
  foreningId: string,
): Promise<ForeningBorttagDto> {
  const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
  if (!rad) throw new Error("Föreningen hittades inte.");
  if (!rad.borttagenTidpunkt) {
    throw new Error("Föreningen är inte borttagen.");
  }

  const uppdaterad = await prisma.forening.update({
    where: { id: foreningId },
    data: {
      borttagenTidpunkt: null,
      borttagenAvEpost: "",
    },
  });

  return tillBorttagDto(uppdaterad);
}

/** Permanent radering — kräver att föreningen redan ligger i borttagna. */
export async function raderaForeningPermanent(foreningId: string): Promise<void> {
  const rad = await prisma.forening.findUnique({ where: { id: foreningId } });
  if (!rad) return;
  if (!rad.borttagenTidpunkt) {
    throw new Error(
      "Flytta föreningen till borttagna först — permanent radering kräver det steget.",
    );
  }

  const medlemmar = await prisma.foreningMedlem.findMany({
    where: { foreningId },
    select: { kontoId: true },
  });

  await prisma.foreningMedlem.deleteMany({ where: { foreningId } });
  await prisma.inloggningsHistorik.deleteMany({ where: { foreningId } });
  await prisma.forening.delete({ where: { id: foreningId } });

  for (const m of medlemmar) {
    const kvar = await prisma.foreningMedlem.count({
      where: { kontoId: m.kontoId },
    });
    if (kvar === 0) {
      await prisma.losnordAterstallning.deleteMany({
        where: { kontoId: m.kontoId },
      });
      await prisma.inloggningsHistorik.deleteMany({
        where: { kontoId: m.kontoId },
      });
      const konto = await prisma.konto.findUnique({
        where: { id: m.kontoId },
      });
      if (konto?.typ === "STYRELSE") {
        await prisma.konto.delete({ where: { id: m.kontoId } });
      }
    }
  }
}

export function arForeningBorttagen(rad: {
  borttagenTidpunkt: Date | null;
}): boolean {
  return rad.borttagenTidpunkt != null;
}

export function kastaOmForeningBorttagen(rad: {
  borttagenTidpunkt: Date | null;
  namn?: string;
}): void {
  if (arForeningBorttagen(rad)) {
    const namn = rad.namn?.trim();
    throw new Error(
      namn
        ? `Föreningen «${namn}» är borttagen och kan inte användas. Kontakta plattformsadmin om detta är fel.`
        : "Föreningen är borttagen och kan inte användas.",
    );
  }
}
