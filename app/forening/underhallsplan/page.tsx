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
      intro="Bygg er underhållsplan steg för steg. Börja med grunduppgifter — boarea, lägenheter och adresser låser upp alla beräkningar och AI-stöd. Slutsidan genererar en 50-årsbudget klar för stämman."
    >
      <TipsPanel tips={tips.underhallsplan} />
      <UnderhallsplanWizard />
    </ModulePage>
  );
}
