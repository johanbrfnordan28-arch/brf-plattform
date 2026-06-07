import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { ProjektModul } from "@/components/projekt/ProjektModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Projekt")),
    description:
      "Projektmappar med årtal, underlag, ritningar, kontrakt och besiktningar.",
  };
}

export default function ForeningProjektPage() {
  return (
    <ModulePage
      title="Projekt"
      icon="📐"
      intro="Samla dokument per projekt och år. Skapa nytt projekt när ett är klart, eller lägg in handlingar för äldre projekt — de sorteras med nyaste år först."
    >
      <ContentSection title="Projektbibliotek" plain>
        <ProjektModul />
      </ContentSection>
    </ModulePage>
  );
}
