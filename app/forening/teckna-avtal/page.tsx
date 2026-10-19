import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TecknaAvtalSida } from "@/components/forening/TecknaAvtalSida";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Teckna avtal")),
    description:
      "Teckna årsavtal med BankID och bli kund — samma funktioner ni redan har, utan att föreningen raderas efter prövoperioden.",
  };
}

export default function ForeningTecknaAvtalPage() {
  return (
    <ModulePage
      title="Teckna avtal"
      icon="✍️"
      intro="En knapp hit, två BankID-signaturer — sedan är ni kund och behåller alla funktioner."
    >
      <TecknaAvtalSida />
    </ModulePage>
  );
}
