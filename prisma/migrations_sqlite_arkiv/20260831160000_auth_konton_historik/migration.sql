-- AlterTable
ALTER TABLE "Forening" ADD COLUMN "avtalBankidTidpunkt" DATETIME;
ALTER TABLE "Forening" ADD COLUMN "avtalBankidNamn" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Konto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "epost" TEXT NOT NULL,
    "epostNyckel" TEXT NOT NULL,
    "namn" TEXT NOT NULL DEFAULT '',
    "losnordHash" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "skapadTidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Konto_epostNyckel_key" ON "Konto"("epostNyckel");

CREATE TABLE "ForeningMedlem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foreningId" TEXT NOT NULL,
    "kontoId" TEXT NOT NULL,
    "roll" TEXT NOT NULL,
    "skapadTidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForeningMedlem_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForeningMedlem_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ForeningMedlem_foreningId_kontoId_key" ON "ForeningMedlem"("foreningId", "kontoId");
CREATE INDEX "ForeningMedlem_kontoId_idx" ON "ForeningMedlem"("kontoId");

CREATE TABLE "LosnordAterstallning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kontoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "utgar" DATETIME NOT NULL,
    "anvand" BOOLEAN NOT NULL DEFAULT false,
    "skapadTidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LosnordAterstallning_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "LosnordAterstallning_tokenHash_key" ON "LosnordAterstallning"("tokenHash");
CREATE INDEX "LosnordAterstallning_kontoId_idx" ON "LosnordAterstallning"("kontoId");

CREATE TABLE "InloggningsHistorik" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kontoId" TEXT,
    "epost" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "foreningId" TEXT,
    "lyckad" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "tidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InloggningsHistorik_kontoId_fkey" FOREIGN KEY ("kontoId") REFERENCES "Konto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InloggningsHistorik_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "InloggningsHistorik_tidpunkt_idx" ON "InloggningsHistorik"("tidpunkt");
CREATE INDEX "InloggningsHistorik_epost_idx" ON "InloggningsHistorik"("epost");

CREATE TABLE "MejlOutbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "till" TEXT NOT NULL,
    "amne" TEXT NOT NULL,
    "brodtext" TEXT NOT NULL,
    "skickadVia" TEXT NOT NULL DEFAULT 'outbox',
    "skapadTidpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
