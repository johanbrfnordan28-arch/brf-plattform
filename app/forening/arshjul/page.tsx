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
      intro="Styrelsemöten, möteskedja från projektering till garantibesiktning, OVK, sotning, energideklaration och radon — med 50 års framförhållning. Möten i en serie numreras och kan utökas, utan lösa dubbletter i listan."
    >
      <ContentSection title="Styrelsens årshjul" plain>
        <ArshjulModul />
      </ContentSection>
    </ModulePage>
  );
}
