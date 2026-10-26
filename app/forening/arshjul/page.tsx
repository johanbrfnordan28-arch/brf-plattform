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
      intro="Styrelsemöten med ordinarie möte, konstituerande möte och överlämning till ny styrelse, plus stämma, OVK och möteskedja. Varje del börjar med ett möte — fler läggs till när de behövs, så listan hålls kort."
    >
      <ContentSection title="Styrelsens årshjul" plain>
        <ArshjulModul />
      </ContentSection>
    </ModulePage>
  );
}
