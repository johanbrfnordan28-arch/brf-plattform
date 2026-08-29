import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * SQLite-sökväg måste fungera både för `prisma migrate` (relativt prisma/)
 * och Next.js (relativt projektroten). Postgres-URL:er lämnas orörda.
 */
function normaliseraDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  if (!raw.startsWith("file:")) return raw;

  const fil = raw.slice("file:".length);
  if (path.isAbsolute(fil)) return raw;

  const kandidater = [
    path.resolve(process.cwd(), fil),
    path.resolve(process.cwd(), "prisma", path.basename(fil)),
    path.resolve(process.cwd(), fil.replace(/^\.\//, "")),
  ];

  for (const kandidat of kandidater) {
    if (fs.existsSync(kandidat)) {
      return `file:${kandidat}`;
    }
  }

  return `file:${path.resolve(process.cwd(), "prisma", path.basename(fil))}`;
}

const resolvedUrl = normaliseraDatabaseUrl();
if (resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Prisma-klient (en instans i dev för att undvika för många anslutningar). */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function databasArKonfigurerad(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
