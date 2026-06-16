import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { MinPlanModul } from "@/components/plan/MinPlanModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Vår plan")),
    description:
      "Skapa och redigera föreningens underhållsplan — lägg till eller ta bort komponenter.",
  };
}

export default function ForeningPlanPage() {
  return (
    <ModulePage
      title="Vår plan"
      icon="📋"
      intro="Här skapar ni föreningens underhållsplan. Lägg till de komponenter fastigheten har — t.ex. Fasad, Tak, VVS och Balkonger — och ta bort de som inte är relevanta."
    >
      <MinPlanModul />
    </ModulePage>
  );
}
