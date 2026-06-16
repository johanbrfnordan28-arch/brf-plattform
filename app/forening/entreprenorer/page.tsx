import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { EntreprenorerRegister } from "@/components/entreprenorer/EntreprenorerRegister";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Entreprenörer")),
    description:
      "Hitta, betygsätt och skicka anbudsförfrågan till godkända entreprenörer — allt på ett ställe.",
  };
}

export default function ForeningEntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Hitta rätt entreprenör, skicka anbudsförfrågan och betygsätt efter avslutat jobb. Lägg till era egna kontakter och håll leverantörslistan uppdaterad för er förening."
    >
      <TipsPanel tips={tips.entreprenorer} />
      <ContentSection title="Sök och hantera entreprenörer" plain>
        <EntreprenorerRegister kanRedigera />
      </ContentSection>
    </ModulePage>
  );
}
