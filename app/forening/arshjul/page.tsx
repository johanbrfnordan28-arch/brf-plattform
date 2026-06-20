import type { Metadata } from "next";
import { ArshjulModul } from "@/components/arshjul/ArshjulModul";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Årshjul & kalender")),
    description:
      "Styrelsens årshjul med påminnelser — årliga uppgifter och besiktningar flera år framåt.",
  };
}

export default function ForeningArshjulPage() {
  return (
    <ModulePage
      title="Årshjul & kalender"
      icon="📅"
      intro="Planera hela styrelseåret i förväg — OVK, stämma, bokslut och besiktningar med påminnelse i rätt tid. Slipp glömma deadlines som kostar föreningen pengar."
    >
      <TipsPanel tips={tips.arshjul} />
      <ContentSection title="Styrelsens kalender" plain>
        <ArshjulModul />
      </ContentSection>
    </ModulePage>
  );
}
