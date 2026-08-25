import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { StyrelseGuiderModul } from "@/components/guider/StyrelseGuiderModul";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Tips och råd")),
    description:
      "Korta filmer om portalens alla funktioner — lär er använda verktyget effektivt på under 10 minuter.",
  };
}

export default function ForeningGuiderPage() {
  return (
    <ModulePage
      title="Tips och råd"
      icon="🎬"
      intro="Lär er använda portalen på under 10 minuter — korta filmer per funktion och praktiska råd för upphandling, rondering och kontakt med entreprenörer. Dela länken med nya styrelseledamöter."
    >
      <TipsPanel tips={tips.guider} />
      <ContentSection title="Filmer och råd" plain>
        <StyrelseGuiderModul />
      </ContentSection>
    </ModulePage>
  );
}
