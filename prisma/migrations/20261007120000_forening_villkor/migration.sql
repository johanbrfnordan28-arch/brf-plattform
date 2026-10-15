-- AlterTable
ALTER TABLE "Forening" ADD COLUMN "villkorVersion" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Forening" ADD COLUMN "villkorGodkantTidpunkt" TIMESTAMP(3);
ALTER TABLE "Forening" ADD COLUMN "villkorGodkantAvEpost" TEXT NOT NULL DEFAULT '';
