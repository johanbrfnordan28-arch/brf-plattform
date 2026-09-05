-- CreateTable
CREATE TABLE IF NOT EXISTS "PlattformMal" (
    "id" TEXT NOT NULL,
    "malAvtal" INTEGER NOT NULL DEFAULT 10,
    "malTest" INTEGER NOT NULL DEFAULT 20,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,
    "uppdateradAvEpost" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PlattformMal_pkey" PRIMARY KEY ("id")
);
