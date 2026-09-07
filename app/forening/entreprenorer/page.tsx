import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { EntreprenorerRegister } from "@/components/entreprenorer/EntreprenorerRegister";
import { EntreprenorVarningar } from "@/components/entreprenorer/EntreprenorVarningar";
import { HusEntreprenorLista } from "@/components/entreprenorer/HusEntreprenorLista";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Entreprenörer")),
    description:
      "Egna rekommenderade entreprenörer och centralt register — sök, lägg till och ta bort.",
  };
}

export default function ForeningEntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Samla rekommenderade entreprenörer i er egen lista, och sök bland företag vi rekommenderar centralt. Kontrollera alltid referenser och beställ skriftligt innan ni anlitar någon."
    >
      <TipsPanel tips={tips.entreprenorer} />
      <EntreprenorVarningar />
      <ContentSection title="Er lista — sök och hantera" plain>
        <HusEntreprenorLista />
      </ContentSection>
      <ContentSection title="Rekommenderade entreprenörer (centralt)" plain>
        <EntreprenorerRegister
          visaVarningar={false}
          kanLaggTillIHusLista
          sokRubrik="Sök i det centrala registret"
          sokIngress="Företag vi har referenser på. Lägg till i er lista om ni vill spara dem hos er — ta fortfarande egna referenser innan ni beställer."
        />
      </ContentSection>
    </ModulePage>
  );
}
