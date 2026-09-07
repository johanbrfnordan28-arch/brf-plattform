import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { ProjektModul } from "@/components/projekt/ProjektModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

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
      intro="En mapp per projekt — kontrakt, ritningar, protokoll och garantidokument samlade på rätt ställe. Garantibesiktningsmodulen påminner er i rätt tid."
    >
      <TipsPanel tips={tips.projekt} />
      <ContentSection title="Projektbibliotek" plain>
        <ProjektModul />
      </ContentSection>
    </ModulePage>
  );
}
