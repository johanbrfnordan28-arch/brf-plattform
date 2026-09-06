-- CreateTable
CREATE TABLE "Forening" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namn" TEXT NOT NULL,
    "namnNyckel" TEXT NOT NULL,
    "organisationsnummer" TEXT NOT NULL DEFAULT '',
    "epost" TEXT NOT NULL DEFAULT '',
    "postadress" TEXT NOT NULL DEFAULT '',
    "ort" TEXT NOT NULL DEFAULT '',
    "kontaktperson" TEXT NOT NULL DEFAULT '',
    "grundinfoPaborjad" BOOLEAN NOT NULL DEFAULT false,
    "avtalGodkant" BOOLEAN NOT NULL DEFAULT false,
    "avtalGodkantTidpunkt" DATETIME,
    "accessNyckelHash" TEXT NOT NULL,
    "skapadTidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Forening_namnNyckel_key" ON "Forening"("namnNyckel");
