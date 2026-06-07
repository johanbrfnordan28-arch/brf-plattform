import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Rondering & avvikelser — BRF Företag",
  description:
    "Schema, checklistor, signering och avvikelser för städning och fastighetsskötsel.",
};

export default function RonderingPage() {
  return (
    <ModulePage
      title="Rondering & avvikelser"
      icon="✅"
      intro="När både styrelsen och entreprenören ser vad som ska ingå i rondering och städning blir uppföljningen enklare. Utfört arbete signeras i portalen och avvikelser rapporteras på föreningens sida."
    >
      <ContentSection title="Tydligt vad som ska ingå">
        <p>
          Det glöms ofta bort exakt vilka moment som ska ingå. I portalen finns
          färdiga checklistor för utvändig och invändig rondering samt städning —
          från tak och fasad till trapphus, tvättstuga och soprum.
        </p>
      </ContentSection>

      <ContentSection title="Signering efter utfört arbete">
        <p>
          När ronderingen eller städningen är utförd signerar entreprenören
          enkelt på föreningens sida. Styrelsen kan se när arbetet är gjort, vem
          som signerat och om något behöver följas upp.
        </p>
      </ContentSection>

      <ContentSection title="Avvikelser och kontroll">
        <p>
          Avvikelser rapporteras separat för rondering (utvändigt/invändigt) och
          städning — med plats, allvarlighet och uppföljningsstatus. Signeringar
          och historik finns på samma ställe.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
