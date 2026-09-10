-- Personliga inbjudningsmallar per personal
CREATE TABLE IF NOT EXISTS "PersonligInbjudanMall" (
    "id" TEXT NOT NULL,
    "agareEpost" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "avsandareNamn" TEXT NOT NULL DEFAULT '',
    "mejlAmne" TEXT NOT NULL,
    "mejlMall" TEXT NOT NULL,
    "arStandard" BOOLEAN NOT NULL DEFAULT false,
    "skapadTidpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uppdateradTidpunkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonligInbjudanMall_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PersonligInbjudanMall_agareEpost_idx" ON "PersonligInbjudanMall"("agareEpost");
CREATE INDEX IF NOT EXISTS "PersonligInbjudanMall_agareEpost_arStandard_idx" ON "PersonligInbjudanMall"("agareEpost", "arStandard");

ALTER TABLE "StyrelsemassaLead" ADD COLUMN IF NOT EXISTS "inbjudanMallId" TEXT;
ALTER TABLE "StyrelsemassaLead" ADD COLUMN IF NOT EXISTS "inbjudanMallTitel" TEXT NOT NULL DEFAULT '';
