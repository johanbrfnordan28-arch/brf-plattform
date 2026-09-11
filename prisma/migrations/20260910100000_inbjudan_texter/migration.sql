-- Inbjudningstexter i plattformsinställning + källspårning på mässa-leads
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMassaNamn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMassaHuvudsidaRubrik" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMassaHuvudsidaIntro" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMassaMejlAmne" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMassaMejlMall" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanPersonligMejlAmne" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanPersonligMejlMall" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMejlaLankRubrik" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlattformInstallning" ADD COLUMN IF NOT EXISTS "inbjudanMejlaLankIntro" TEXT NOT NULL DEFAULT '';

ALTER TABLE "StyrelsemassaLead" ADD COLUMN IF NOT EXISTS "kalla" TEXT NOT NULL DEFAULT 'massa_sjalv';
ALTER TABLE "StyrelsemassaLead" ADD COLUMN IF NOT EXISTS "inbjudenAvNamn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "StyrelsemassaLead" ADD COLUMN IF NOT EXISTS "inbjudenAvEpost" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "StyrelsemassaLead_kalla_idx" ON "StyrelsemassaLead"("kalla");
