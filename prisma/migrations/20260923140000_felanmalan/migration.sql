-- CreateTable
CREATE TABLE "FelanmalanArende" (
    "id" TEXT NOT NULL,
    "foreningId" TEXT NOT NULL,
    "arendeNummer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inkommen',
    "prioritet" TEXT NOT NULL DEFAULT 'normal',
    "orsak" TEXT NOT NULL DEFAULT 'annat',
    "rubrik" TEXT NOT NULL,
    "beskrivning" TEXT NOT NULL,
    "medlemNamn" TEXT NOT NULL,
    "medlemEpost" TEXT NOT NULL,
    "medlemTelefon" TEXT NOT NULL DEFAULT '',
    "lagenhetsnummer" TEXT NOT NULL DEFAULT '',
    "debiteringKan" BOOLEAN NOT NULL DEFAULT false,
    "debiteringAnteckning" TEXT NOT NULL DEFAULT '',
    "nyckelPlats" TEXT NOT NULL DEFAULT '',
    "boendeEjHemma" BOOLEAN NOT NULL DEFAULT false,
    "tilldeladRoll" TEXT NOT NULL DEFAULT 'forvaltare',
    "vidareEpost" TEXT NOT NULL DEFAULT '',
    "historik" JSONB NOT NULL DEFAULT '[]',
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FelanmalanArende_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FelanmalanArende_foreningId_status_idx" ON "FelanmalanArende"("foreningId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FelanmalanArende_foreningId_arendeNummer_key" ON "FelanmalanArende"("foreningId", "arendeNummer");

-- AddForeignKey
ALTER TABLE "FelanmalanArende" ADD CONSTRAINT "FelanmalanArende_foreningId_fkey" FOREIGN KEY ("foreningId") REFERENCES "Forening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
