import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { EntreprenorVarningar } from "@/components/entreprenorer/EntreprenorVarningar";
import { FragaOmEntreprenorPanel } from "@/components/entreprenorer/FragaOmEntreprenorPanel";
import { HusEntreprenorLista } from "@/components/entreprenorer/HusEntreprenorLista";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Entreprenörer")),
    description:
      "Egna entreprenörer med de uppgifter föreningen behöver, och mejl till Styrelse-Navet om ni vill fråga om en entreprenör.",
  };
}

export default function ForeningEntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Spara entreprenörer som föreningen anlitar, med de uppgifter ni behöver. Vill ni fråga Styrelse-Navet om en entreprenör mejlar ni oss. Föreningen ansvarar för uppdraget."
    >
      <TipsPanel tips={tips.entreprenorer} />
      <EntreprenorVarningar />
      <ContentSection title="Er lista" plain>
        <HusEntreprenorLista />
      </ContentSection>
      <ContentSection title="Fråga Styrelse-Navet" plain>
        <FragaOmEntreprenorPanel />
      </ContentSection>
    </ModulePage>
  );
}
