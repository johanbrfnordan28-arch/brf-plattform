-- AlterTable
ALTER TABLE "Konto" ADD COLUMN "losenordKuvert" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Konto" ADD COLUMN "senasteInloggning" DATETIME;
