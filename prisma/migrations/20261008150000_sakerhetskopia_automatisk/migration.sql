-- AlterTable
ALTER TABLE "ForeningSakerhetskopia" ADD COLUMN "automatisk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "innehallHash" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "ForeningSakerhetskopia_foreningId_automatisk_exportedAt_idx" ON "ForeningSakerhetskopia"("foreningId", "automatisk", "exportedAt");
