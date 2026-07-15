import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { JuridikModul } from "@/components/juridik/JuridikModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Juridik — ${BRF_NAVET_NAMN}`,
  description:
    "Vägledande domar och avgöranden för BRF-styrelser — samlat per ämne från grundmodulen.",
};

export default function JuridikPage() {
  return (
    <ModulePage
      title="Juridik"
      icon="⚖️"
      intro="Vägledande domar och avgöranden som byggs i grundmodulen och visas här för alla besökare. Materialet är underlag inför styrelsebeslut — inte juridisk rådgivning."
    >
      <ContentSection title="Domarbibliotek" plain>
        <JuridikModul publik />
      </ContentSection>
    </ModulePage>
  );
}
