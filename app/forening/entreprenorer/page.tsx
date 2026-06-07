import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { EntreprenorerRegister } from "@/components/entreprenorer/EntreprenorerRegister";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Entreprenörer")),
    description:
      "Sök, betygsätt och hantera godkända entreprenörer i föreningens register.",
  };
}

export default function ForeningEntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Sök entreprenör för ert projekt bland godkända företag. Vi tar referenser på företagen i registret — vi rekommenderar även att ni tar egna referenser innan ni väljer."
    >
      <ContentSection title="Sök entreprenör för ert projekt" plain>
        <EntreprenorerRegister />
      </ContentSection>
    </ModulePage>
  );
}
