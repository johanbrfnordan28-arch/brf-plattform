import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { UnderhallsplanWizard } from "@/components/underhallsplan/UnderhallsplanWizard";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Underhållsplan")),
    description:
      "Bygg föreningens underhållsplan steg för steg — komponentregister, renoveringshistorik, besiktningar och 50-årsbudget.",
  };
}

export default function ForeningUnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhållsplan"
      icon="🔧"
      intro="Här skapar ni föreningens egen underhållsplan — enkel, överskådlig och anpassad för er. Börja med adresser och grunduppgifter (fasader kommer när byggnader lagts in). Styrelsen ändrar fritt i er plan; den centrala grundmallen uppdateras bara centralt, och ni kan importera saknade delar till er plan. Slutsidan ger en 50-årsbudget klar för stämman."
    >
      <TipsPanel tips={tips.underhallsplan} />
      <UnderhallsplanWizard />
    </ModulePage>
  );
}
