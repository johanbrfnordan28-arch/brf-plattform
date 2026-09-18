-- Soft-delete för föreningar i plattformsadmin
ALTER TABLE "Forening" ADD COLUMN IF NOT EXISTS "borttagenTidpunkt" TIMESTAMP(3);
ALTER TABLE "Forening" ADD COLUMN IF NOT EXISTS "borttagenAvEpost" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "Forening_borttagenTidpunkt_idx" ON "Forening"("borttagenTidpunkt");
