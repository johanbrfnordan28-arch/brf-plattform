import type { Metadata } from "next";
import { ArshjulModul } from "@/components/arshjul/ArshjulModul";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Årshjul")),
    description:
      "Årshjulet ger översikt och gör planeringen av styrelsearbetet mer överskådlig — med påminnelser flera år framåt.",
  };
}

export default function ForeningArshjulPage() {
  return (
    <ModulePage
      title="Årshjul"
      icon="📅"
      intro="Årshjulet ger en tydlig översikt över året. Planeringen av styrelsearbetet blir mer överskådlig — med påminnelser för stämma, OVK, bokslut och egna uppgifter. Importera besiktningar från underhållsplanen så inget glöms bort."
    >
      <ContentSection title="Styrelsens årshjul" plain>
        <ArshjulModul />
      </ContentSection>
    </ModulePage>
  );
}
