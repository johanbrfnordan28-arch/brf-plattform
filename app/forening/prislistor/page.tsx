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
      intro="Lägg in och uppdatera prislistor från era leverantörer. Prisposter kan kopplas till underhållsåtgärder i era planer för bättre kostnadsuppskattningar."
    >
      <PrislistorModul />
    </ModulePage>
  );
}
