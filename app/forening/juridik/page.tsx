import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { JuridikModul } from "@/components/juridik/JuridikModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Juridik")),
    description:
      "Vägledande domar per flik — underlag inför styrelsebeslut. I grundmodulen kan ni bygga ut biblioteket.",
  };
}

export default function ForeningJuridikPage() {
  return (
    <ModulePage
      title="Juridik"
      icon="⚖️"
      intro="Vägledande domar från det gemensamma biblioteket — plus egna mappar där er styrelse sparar ärenden som bara ni ser. I grundmodulen kan ni lägga till flikar och domar som sedan syns på BRF Navet. Materialet ersätter inte juridisk rådgivning."
    >
      <ContentSection title="Bibliotek" plain>
        <JuridikModul />
      </ContentSection>
    </ModulePage>
  );
}
