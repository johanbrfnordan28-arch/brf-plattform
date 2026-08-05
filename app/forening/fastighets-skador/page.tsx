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
      intro="Dokumentation, historik och spårbarhet är avgörande när skador inträffar — och långt efteråt. Här registrerar styrelsen skador, går igenom checklistan och sparar uppföljningen per förening."
    >
      <ContentSection title="Vägledning, checklista och register" plain>
        <FastighetsSkadorModul />
      </ContentSection>
    </ModulePage>
  );
}
