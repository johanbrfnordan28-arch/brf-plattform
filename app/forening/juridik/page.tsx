import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { JuridikModul } from "@/components/juridik/JuridikModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Juridik")),
    description:
      "Gemensamt juridikbibliotek med domar, tips och råd — underlag inför styrelsebeslut.",
  };
}

export default function ForeningJuridikPage() {
  return (
    <ModulePage
      title="Juridik"
      icon="⚖️"
      intro="Gemensamt bibliotek för alla föreningar: vägledande domar, tips inför möten med medlemmar och juridiskt ombud, samt råd för att minska kostnader vid tvister. Styrelsen i er förening fattar alltid besluten — materialet här är underlag, inte juridisk rådgivning."
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
