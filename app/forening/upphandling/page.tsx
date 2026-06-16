import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { ForenadUpphandlingModul } from "@/components/upphandling/ForenadUpphandlingModul";
import { UpphandlingSidaInnehall } from "@/components/upphandling/UpphandlingDokument";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Upphandling")),
    description:
      "Förenklad och fullständig upphandling — OVK, energideklaration, radon, entreprenad och fastighetsförvaltning.",
  };
}

export default function ForeningUpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Förenklad upphandling för enklare ärenden och obligatoriska kontroller. Fullständig upphandling med förfrågningsunderlag, publicering och anbudsutvärdering finns nedan."
    >
      <ContentSection title="Förenklad upphandling" plain>
        <p className="mb-5 text-sm text-muted">
          Hantera obligatoriska kontroller och enklare beställningar utan fullständigt
          förfrågningsunderlag. Grunduppgifter hämtas automatiskt från underhållsplanen.
        </p>
        <ForenadUpphandlingModul />
      </ContentSection>

      <ContentSection title="Fullständig upphandling">
        <p className="mb-4 text-sm text-muted">
          Bygg förfrågningsunderlag per kategori. För Städning och Fastighetsskötsel
          kan scheman hämtas från rondering med standardvillkor (vite, ID06,
          entreprenör). Två styrelseledamöter godkänner publicering och beslut.
        </p>
        <UpphandlingSidaInnehall />
      </ContentSection>
    </ModulePage>
  );
}
