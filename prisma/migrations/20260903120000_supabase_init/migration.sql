-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Forening" (
    "id" TEXT NOT NULL,
    "namn" TEXT NOT NULL,
    "namnNyckel" TEXT NOT NULL,
    "organisationsnummer" TEXT NOT NULL DEFAULT '',
    "epost" TEXT NOT NULL DEFAULT '',
    "postadress" TEXT NOT NULL DEFAULT '',
    "ort" TEXT NOT NULL DEFAULT '',
    "postnummer" TEXT NOT NULL DEFAULT '',
    "kontaktperson" TEXT NOT NULL DEFAULT '',
    "grundinfoPaborjad" BOOLEAN NOT NULL DEFAULT false,
    "avtalGodkant" BOOLEAN NOT NULL DEFAULT false,
    "avtalGodkantTidpunkt" TIMESTAMP(3),
    "avtalBankidTidpunkt" TIMESTAMP(3),
    "avtalBankidNamn" TEXT NOT NULL DEFAULT '',
    "accessNyckelHash" TEXT NOT NULL,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Konto" (
    "id" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "epostNyckel" TEXT NOT NULL,
    "namn" TEXT NOT NULL DEFAULT '',
    "losnordHash" TEXT NOT NULL,
    "losenordKuvert" TEXT NOT NULL DEFAULT '',
    "typ" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "senasteInloggning" TIMESTAMP(3),
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Konto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForeningMedlem" (
    "id" TEXT NOT NULL,
    "foreningId" TEXT NOT NULL,
    "kontoId" TEXT NOT NULL,
    "roll" TEXT NOT NULL,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForeningMedlem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LosnordAterstallning" (
    "id" TEXT NOT NULL,
    "kontoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "utgar" TIMESTAMP(3) NOT NULL,
    "anvand" BOOLEAN NOT NULL DEFAULT false,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LosnordAterstallning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InloggningsHistorik" (
    "id" TEXT NOT NULL,
    "kontoId" TEXT,
    "epost" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "foreningId" TEXT,
    "lyckad" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "tidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InloggningsHistorik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MejlOutbox" (
    "id" TEXT NOT NULL,
    "till" TEXT NOT NULL,
    "amne" TEXT NOT NULL,
    "brodtext" TEXT NOT NULL,
    "skickadVia" TEXT NOT NULL DEFAULT 'outbox',
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MejlOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Forening_namnNyckel_key" ON "Forening"("namnNyckel");

-- CreateIndex
CREATE UNIQUE INDEX "Konto_epostNyckel_key" ON "Konto"("epostNyckel");

-- CreateIndex
CREATE INDEX "ForeningMedlem_kontoId_idx" ON "ForeningMedlem"("kontoId");

-- CreateIndex
CREATE UNIQUE INDEX "ForeningMedlem_foreningId_kontoId_key" ON "ForeningMedlem"("foreningId", "kontoId");

-- CreateIndex
CREATE UNIQUE INDEX "LosnordAterstallning_tokenHash_key" ON "LosnordAterstallning"("tokenHash");

-- CreateIndex
CREATE INDEX "LosnordAterstallning_kontoId_idx" ON "LosnordAterstallning"("kontoId");

-- CreateIndex
CREATE INDEX "InloggningsHistorik_tidpunkt_idx" ON "InloggningsHistorik"("tidpunkt");

-- CreateIndex
CREATE INDEX "InloggningsHistorik_epost_idx" ON "InloggningsHistorik"("epost");

-- AddForeignKey
ALTER TABLE "ForeningMedlem" ADD CONSTRAINT "ForeningMedlem_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForeningMedlem" ADD CONSTRAINT "ForeningMedlem_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LosnordAterstallning" ADD CONSTRAINT "LosnordAterstallning_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InloggningsHistorik" ADD CONSTRAINT "InloggningsHistorik_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InloggningsHistorik" ADD CONSTRAINT "InloggningsHistorik_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening"("id") ON DELETE SET NULL ON UPDATE CASCADE;

