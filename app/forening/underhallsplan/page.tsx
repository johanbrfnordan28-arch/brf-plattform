import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { UnderhallsplanReklam } from "@/components/pris/UnderhallsplanReklam";
import { UnderhallsplanWizard } from "@/components/underhallsplan/UnderhallsplanWizard";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Underhåll")),
    description:
      "Bygg föreningens underhållsplan steg för steg — komponentregister, renoveringshistorik, besiktningar och 50-årsbudget.",
  };
}

export default function ForeningUnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhåll"
      icon="🔧"
      intro="Här skapar ni föreningens egen underhållsplan — översiktlig och anpassad för er fastighet. Styrelsen styr innehållet fritt. Komponentregistret innehåller avskrivningstider som underlag till K3. Summeringen är klar till styrelsemötet."
    >
      <UnderhallsplanReklam lage="forening" kompakt />
      <TipsPanel tips={tips.underhallsplan} />
      <UnderhallsplanWizard />
    </ModulePage>
  );
}
