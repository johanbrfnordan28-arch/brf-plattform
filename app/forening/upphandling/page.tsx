import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { ForenadUpphandlingModul } from "@/components/upphandling/ForenadUpphandlingModul";
import { UpphandlingSidaInnehall } from "@/components/upphandling/UpphandlingDokument";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Upphandling")),
    description:
      "Förenklad upphandling för OVK och löpande kontroller. Fullständig upphandling med förfrågningsunderlag, publicering och spårbar anbudsutvärdering.",
  };
}

export default function ForeningUpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Hantera både enkla kontroller och stora entreprenader. Förenklad upphandling täcker obligatoriska kontroller — fullständig ger er professionella förfrågningsunderlag med spårbar anbudsutvärdering och styrelsebeslut."
    >
      <TipsPanel tips={tips.upphandling} />

      <ContentSection title="Förenklad upphandling" plain>
        <p className="mb-5 text-sm text-muted">
          OVK, energideklaration, radonmätning och egna ärenden — snabb hantering
          utan fullständigt förfrågningsunderlag. Grunduppgifter hämtas från
          underhållsplanen.
        </p>
        <ForenadUpphandlingModul />
      </ContentSection>

      <ContentSection title="Fullständig upphandling">
        <p className="mb-4 text-sm text-muted">
          Bygg professionella förfrågningsunderlag per kategori — från stambyte och
          fasadrenovering till städ och fastighetsskötsel. Scheman från Rondering kan
          bifogas direkt. Två styrelseledamöter godkänner publicering och beslut.
        </p>
        <UpphandlingSidaInnehall />
      </ContentSection>
    </ModulePage>
  );
}
