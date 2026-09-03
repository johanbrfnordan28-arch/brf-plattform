import { PrismaClient } from "@prisma/client";

/**
 * Prisma mot Supabase/Postgres.
 * Sätt DATABASE_URL (+ DIRECT_URL för migrate) i .env / Vercel.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** True när en Postgres-URL är konfigurerad (inte tom / placeholder). */
export function databasArKonfigurerad(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  return (
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://")
  );
}
