import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { PrislistorModul } from "@/components/prislistor/PrislistorModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Prislistor")),
    description:
      "Hantera prislistor från leverantörer — lägg till och uppdatera priser per åtgärdstyp.",
  };
}

export default function ForeningPrislistorPage() {
  return (
    <ModulePage
      title="Leverantörsprislistor"
      icon="💰"
      intro="Lägg in priser från era leverantörer och koppla dem direkt till underhållsåtgärder i planen — kostnadsuppskattningar uppdateras automatiskt utan manuell uträkning."
    >
      <PrislistorModul />
    </ModulePage>
  );
}
