import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { JuridikModul } from "@/components/juridik/JuridikModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

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
      intro="Vägledande domar och råd från det centrala biblioteket — plus egna mappar där er styrelse sparar ärenden som bara ni ser. Förstå vägledningen i tid så sparar både styrelse och medlemmar pengar om tvist skulle uppstå. Materialet ersätter inte juridisk rådgivning."
    >
      <TipsPanel tips={tips.juridik} />
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
