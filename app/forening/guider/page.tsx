import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { StyrelseGuiderModul } from "@/components/guider/StyrelseGuiderModul";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Guider & tips")),
    description:
      "Korta AI-filmer om portalens funktioner samt tips om upphandling och entreprenörer.",
  };
}

export default function ForeningGuiderPage() {
  return (
    <ModulePage
      title="Guider & tips"
      icon="🎬"
      intro="Lär känna portalen med korta filmer och få stöd i vardagen — upphandling, moduler och kontakt med entreprenörer."
    >
      <ContentSection title="Kunskap för styrelsen" plain>
        <StyrelseGuiderModul />
      </ContentSection>
    </ModulePage>
  );
}
