import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { JuridikModul } from "@/components/juridik/JuridikModul";

export const metadata: Metadata = {
  title: "Juridik — BRF Företag",
  description:
    "Gemensamt juridikbibliotek med vägledande domar och råd för BRF-styrelser.",
};

export default function JuridikPage() {
  return (
    <ModulePage
      title="Juridik"
      icon="⚖️"
      intro="Ett gemensamt bibliotek för alla föreningar på plattformen: vägledande domar, tips inför möten och råd om att hålla nere kostnader vid tvister. Styrelsen fattar beslut i sin förening — innehållet här är underlag, inte juridisk rådgivning."
    >
      <ContentSection title="Bibliotek" plain>
        <JuridikModul />
      </ContentSection>

      <ContentSection title="Koppling till upphandling">
        <p>
          Juridikmodulen stödjer styrelsen när avtal ska tecknas, ansvar fördelas
          och underhålls- eller entreprenadavtal ska förstås — i linje med
          upphandlings- och underhållsplaneringen.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
