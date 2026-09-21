-- AlterTable
ALTER TABLE "Konto" ADD COLUMN "personnummerNyckel" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Konto_personnummerNyckel_key" ON "Konto"("personnummerNyckel");
