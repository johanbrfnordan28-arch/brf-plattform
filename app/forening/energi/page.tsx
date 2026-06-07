import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { EnergiModul } from "@/components/energi/EnergiModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Energi & drift")),
    description:
      "Energisparande åtgärder för värme och belysning — kopplat till underhållsplanens tekniska livslängd.",
  };
}

export default function ForeningEnergiPage() {
  return (
    <ModulePage
      title="Energi & drift"
      icon="⚡"
      intro="Värmesystem och belysning påverkar både driftkostnad och hur länge komponenter håller. Här skiljer vi teknisk livslängd (stora byten i underhållsplanen) från energiåtgärder som ger effekt tidigare."
    >
      <EnergiModul />
    </ModulePage>
  );
}
