import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { HusEntreprenorLista } from "@/components/entreprenorer/HusEntreprenorLista";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Entreprenörer")),
    description:
      "Lista entreprenörer som känner huset — egna kontakter för er förening.",
  };
}

export default function ForeningEntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Här samlar ni bra entreprenörer som känner huset sedan tidigare. Listan är er egen — lägg till namn, kontaktuppgifter och en kort anteckning."
    >
      <ContentSection title="Er lista" plain>
        <HusEntreprenorLista />
      </ContentSection>
    </ModulePage>
  );
}
