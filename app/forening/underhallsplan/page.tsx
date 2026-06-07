import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { UnderhallsplanWizard } from "@/components/underhallsplan/UnderhallsplanWizard";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Underhållsplan")),
    description:
      "Grunduppgifter och komponentregister för föreningens underhållsplan.",
  };
}

export default function ForeningUnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhållsplan"
      icon="🔧"
      intro="Börja med steg 1 Grunduppgifter (boarea, lägenheter, adresser) — spara innan du går vidare. Styrelsens kontakt hämtas från Föreningsuppgifter."
    >
      <UnderhallsplanWizard />
    </ModulePage>
  );
}
