-- CreateTable
CREATE TABLE IF NOT EXISTS "StyrelsemassaLead" (
    "id" TEXT NOT NULL,
    "foreningsNamn" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "epostNyckel" TEXT NOT NULL,
    "kontaktperson" TEXT NOT NULL DEFAULT '',
    "telefon" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'lank_skickad',
    "foreningId" TEXT,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testSkapadTidpunkt" TIMESTAMP(3),
    "mejlSkickad" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StyrelsemassaLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StyrelsemassaLead_epostNyckel_idx" ON "StyrelsemassaLead"("epostNyckel");
CREATE INDEX IF NOT EXISTS "StyrelsemassaLead_status_idx" ON "StyrelsemassaLead"("status");
CREATE INDEX IF NOT EXISTS "StyrelsemassaLead_skapadTidpunkt_idx" ON "StyrelsemassaLead"("skapadTidpunkt");
