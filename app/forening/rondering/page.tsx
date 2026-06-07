import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { RonderingDokument } from "@/components/rondering/RonderingDokument";
import { RonderingModul } from "@/components/rondering/RonderingModul";
import { RonderingSidKarta } from "@/components/rondering/RonderingSidKarta";
import { SigneringSchemaGrundmallInfo } from "@/components/rondering/SigneringSchemaGrundmallInfo";
import { BifogaSchemaUpphandlingPanel } from "@/components/rondering/BifogaSchemaUpphandlingPanel";
import { RonderingSigneringStyrelse } from "@/components/rondering/RonderingSigneringStyrelse";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Rondering & avvikelser")),
    description:
      "Checklistor för rondering och städning, avvikelserapporter, signering och dokument.",
  };
}

export default function ForeningRonderingPage() {
  return (
    <ModulePage
      title="Rondering & avvikelser"
      icon="✅"
      intro="Börja med månadsschemat för fastighetsskötare och städ (bocka i moment). Därefter checklistor, dokument och signeringslänkar till entreprenör."
    >
      <RonderingSidKarta />

      <ContentSection title="1. Månadssignering — justera schema" plain>
        <SigneringSchemaGrundmallInfo />
        <div className="mt-6">
          <RonderingSigneringStyrelse />
        </div>
      </ContentSection>

      <ContentSection title="2. Checklistor och avvikelser" plain>
        <div id="checklistor" className="scroll-mt-24">
          <RonderingModul />
        </div>
      </ContentSection>

      <ContentSection title="3. Bifoga schema vid upphandling" plain>
        <BifogaSchemaUpphandlingPanel />
      </ContentSection>

      <ContentSection title="4. Dokument — rondering och städ" plain>
        <RonderingDokument />
      </ContentSection>
    </ModulePage>
  );
}
