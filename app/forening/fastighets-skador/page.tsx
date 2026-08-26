import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { FastighetsSkadorModul } from "@/components/fastighets-skador/FastighetsSkadorModul";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Fastighetsskador")),
    description:
      "Dokumentera skador med checklista, försäkringsvägledning och spårbar historik per förening.",
  };
}

export default function ForeningFastighetsSkadorPage() {
  return (
    <ModulePage
      title="Fastighetsskador"
      icon="🩹"
      intro="När skador uppstår behövs både snabb handling och tydliga spelregler. Här finns vägledning om försäkring, jäv, extern hjälp och stämma — plus checklista och historik per förening."
    >
      <ContentSection title="Vägledning, checklista och register" plain>
        <FastighetsSkadorModul />
      </ContentSection>
    </ModulePage>
  );
}
