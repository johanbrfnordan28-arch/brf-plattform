-- CreateTable
CREATE TABLE "OffertForfragan" (
    "id" TEXT NOT NULL,
    "foreningsNamn" TEXT NOT NULL,
    "kontaktperson" TEXT NOT NULL,
    "oonskadKontaktId" TEXT NOT NULL DEFAULT 'offert',
    "epost" TEXT NOT NULL,
    "telefon" TEXT NOT NULL DEFAULT '',
    "antalLagenheter" TEXT NOT NULL DEFAULT '',
    "tjanster" TEXT[],
    "meddelande" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ny',
    "internAnteckning" TEXT NOT NULL DEFAULT '',
    "senastOffertSkickad" TIMESTAMP(3),
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffertForfragan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OffertForfragan_epost_idx" ON "OffertForfragan"("epost");

-- CreateIndex
CREATE INDEX "OffertForfragan_skapadTidpunkt_idx" ON "OffertForfragan"("skapadTidpunkt");

-- CreateIndex
CREATE INDEX "OffertForfragan_uppdateradTidpunkt_idx" ON "OffertForfragan"("uppdateradTidpunkt");
