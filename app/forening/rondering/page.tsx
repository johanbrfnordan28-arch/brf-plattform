import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { RonderingDokument } from "@/components/rondering/RonderingDokument";
import { RonderingModul } from "@/components/rondering/RonderingModul";
import { RonderingSidKarta } from "@/components/rondering/RonderingSidKarta";
import { SigneringSchemaGrundmallInfo } from "@/components/rondering/SigneringSchemaGrundmallInfo";
import { BifogaSchemaUpphandlingPanel } from "@/components/rondering/BifogaSchemaUpphandlingPanel";
import { RonderingSigneringStyrelse } from "@/components/rondering/RonderingSigneringStyrelse";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

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
      intro="Strukturerad rondering med digital signering — månadsvis dokumentation av städ och fastighetsskötsel. Avvikelser registreras och följs upp tills de är åtgärdade."
    >
      <TipsPanel tips={tips.rondering} />
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
