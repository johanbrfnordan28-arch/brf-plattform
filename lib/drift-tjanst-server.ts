import type { Prisma } from "@prisma/client";
import { databasArKonfigurerad, prisma } from "@/lib/db";
import { kastaOmForeningBorttagen } from "@/lib/forening-borttag-server";
import { normaliseraDriftState } from "@/lib/drift-tjanst-logik";
import type { DriftState } from "@/components/rondering/drift-avtal-typer";

export async function lasDriftTjanstState(
  foreningId: string,
): Promise<DriftState | null> {
  if (!databasArKonfigurerad()) return null;
  const rad = await prisma.forening.findUnique({
    where: { id: foreningId },
    select: { driftTjanst: true, borttagenTidpunkt: true, namn: true },
  });
  if (!rad) return null;
  kastaOmForeningBorttagen(rad);
  if (rad.driftTjanst == null) return null;
  return normaliseraDriftState(rad.driftTjanst);
}

export async function sparaDriftTjanstState(
  foreningId: string,
  state: DriftState,
): Promise<DriftState> {
  if (!databasArKonfigurerad()) {
    throw new Error("Databasen är inte konfigurerad.");
  }
  const rad = await prisma.forening.findUnique({
    where: { id: foreningId },
    select: { id: true, borttagenTidpunkt: true, namn: true },
  });
  if (!rad) throw new Error("Föreningen hittades inte.");
  kastaOmForeningBorttagen(rad);
  const normaliserad = normaliseraDriftState(state);
  await prisma.forening.update({
    where: { id: foreningId },
    data: { driftTjanst: normaliserad as Prisma.InputJsonValue },
  });
  return normaliserad;
}
