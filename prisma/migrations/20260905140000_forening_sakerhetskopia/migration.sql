-- CreateTable
CREATE TABLE IF NOT EXISTS "ForeningSakerhetskopia" (
    "id" TEXT NOT NULL,
    "foreningId" TEXT NOT NULL,
    "foreningsNamn" TEXT NOT NULL,
    "filnamn" TEXT NOT NULL,
    "exportedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "antalNycklar" INTEGER NOT NULL DEFAULT 0,
    "storlekBytes" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "skapadAvEpost" TEXT NOT NULL DEFAULT '',
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForeningSakerhetskopia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ForeningSakerhetskopia_foreningId_skapadTidpunkt_idx" ON "ForeningSakerhetskopia"("foreningId", "skapadTidpunkt");
CREATE INDEX IF NOT EXISTS "ForeningSakerhetskopia_foreningsNamn_idx" ON "ForeningSakerhetskopia"("foreningsNamn");

ALTER TABLE "ForeningSakerhetskopia" DROP CONSTRAINT IF EXISTS "ForeningSakerhetskopia_foreningId_fkey";
ALTER TABLE "ForeningSakerhetskopia" ADD CONSTRAINT "ForeningSakerhetskopia_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
