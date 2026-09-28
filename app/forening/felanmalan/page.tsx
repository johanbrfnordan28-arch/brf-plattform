import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { FelanmalanModul } from "@/components/felanmalan/FelanmalanModul";
import { TipsPanel } from "@/components/TipsPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Felanmälan")),
    description:
      "Medlemmar anmäler fel — förvaltaren hanterar ärenden med nummer, prioritet och historik.",
  };
}

export default function ForeningFelanmalanPage() {
  return (
    <ModulePage
      title="Felanmälan"
      icon="📨"
      intro="Styrelse och förvaltare hanterar inkomna felanmälan här. Medlemmar använder medlemsportalen på startsidan — de ser inte historik eller andra ärenden."
    >
      <TipsPanel tips={tips.felanmalan} />
      <FelanmalanModul />
    </ModulePage>
  );
}
