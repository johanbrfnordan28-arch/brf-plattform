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
      intro={`${antalForeningsHuvudmappar} huvudmappar: Styrelse Arkiv (protokoll, årsstämma, nyckel kvittenser), besiktningar (brandskydd), hiss (besiktning, service, reparationer och upphandling), service (undercentral), ventilation (OVK och sotning) samt tioårsbesiktningar (energi och radon).`}
    >
      <ContentSection title="Styrelsens bibliotek" plain>
        <ForeningsinformationBibliotek />
      </ContentSection>

      <ContentSection title="Koppling till underhållsplan">
        <p>
          Hissen har en egen huvudmapp, service och undercentral ligger mellan hiss
          och ventilation, OVK och sotning under ventilation samt energideklaration
          och radon under tioårsbesiktningar. Mapparna kompletterar uppgifterna i
          underhållsplanens besiktningar och budget. Här sparar styrelsen protokoll
          och handlingar. Från OVK, energideklaration och radon skapas
          upphandlingen. Hisservice, reparation enligt felrapport och ny hiss
          skapas i hissmappen, med anbudsformulär enligt ABT-06. Underlaget flyttas till
          upphandlingsmodulen, och den signerade beställningen ligger kvar i
          samma mapp.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
