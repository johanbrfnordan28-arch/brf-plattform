import type { Metadata } from "next";
import { ArshjulModul } from "@/components/arshjul/ArshjulModul";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

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
      intro="Planera styrelsearbetet året runt och se långsiktiga datum — OVK, stämma, bokslut och egna påminnelser. Importera besiktningar från underhållsplanen så inget ligger tio år fram utan att synas."
    >
      <ContentSection title="Styrelsens kalender" plain>
        <ArshjulModul />
      </ContentSection>
    </ModulePage>
  );
}
