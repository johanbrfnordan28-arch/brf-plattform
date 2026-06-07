import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { UpphandlingSidaInnehall } from "@/components/upphandling/UpphandlingDokument";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Upphandling")),
    description:
      "Entreprenad, konsulter och fastighetsförvaltning — komplett underlag, publicering och anbudsutvärdering.",
  };
}

export default function ForeningUpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Bygg förfrågningsunderlag per kategori. För Städning och Fastighetsskötsel kan scheman hämtas från rondering med standardvillkor (vite, ID06, entreprenör). Två styrelseledamöter godkänner publicering och beslut."
    >
      <UpphandlingSidaInnehall />
    </ModulePage>
  );
}
