-- DropTable (ersätter enkla PlattformMal)
DROP TABLE IF EXISTS "PlattformMal";

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlattformInstallning" (
    "id" TEXT NOT NULL,
    "varningTestAntal" INTEGER NOT NULL DEFAULT 25,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,
    "uppdateradAvEpost" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PlattformInstallning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlattformMalRad" (
    "id" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "titel" TEXT NOT NULL DEFAULT '',
    "malAntal" INTEGER NOT NULL,
    "tidpunkt" TIMESTAMP(3) NOT NULL,
    "uppfylld" BOOLEAN NOT NULL DEFAULT false,
    "uppfylldTidpunkt" TIMESTAMP(3),
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skapadAvEpost" TEXT NOT NULL DEFAULT '',
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlattformMalRad_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PlattformMalRad_typ_aktiv_idx" ON "PlattformMalRad"("typ", "aktiv");
CREATE INDEX IF NOT EXISTS "PlattformMalRad_tidpunkt_idx" ON "PlattformMalRad"("tidpunkt");
