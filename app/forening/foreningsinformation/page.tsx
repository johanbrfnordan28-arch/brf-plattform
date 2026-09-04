import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ForeningsinformationBibliotek } from "@/components/foreningsinformation/ForeningsinformationBibliotek";
import { antalForeningsHuvudmappar } from "@/components/foreningsinformation/mappar";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Styrning och Dokument")),
    description:
      "Styrelsearkiv, stadgar, protokoll, årsstämma och övriga styrelsedokument.",
  };
}

export default function ForeningForeningsinformationPage() {
  return (
    <ModulePage
      title="Styrning och Dokument"
      icon="📁"
      intro={`${antalForeningsHuvudmappar} huvudmappar: Styrelse Arkiv (protokoll, årsstämma, nyckel kvittenser), hiss (besiktningar), service (undercentral), ventilation (OVK och sotning) samt tioårsbesiktningar (energi och radon).`}
    >
      <ContentSection title="Styrelsens bibliotek" plain>
        <ForeningsinformationBibliotek />
      </ContentSection>

      <ContentSection title="Koppling till underhållsplan">
        <p>
          OVK och sotning under ventilation, service och undercentral mellan hiss
          och OVK, energideklaration och radon under tioårsbesiktningar —
          kompletterar uppgifterna i underhållsplanens besiktningar och budget.
          Här sparar styrelsen protokoll och handlingar.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
