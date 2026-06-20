import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { PlanListaModul } from "@/components/plan/PlanListaModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Vår plan")),
    description:
      "Skapa och hantera föreningens underhållsplaner — grundmall, komponenter och åtgärder.",
  };
}

export default function ForeningPlanPage() {
  return (
    <ModulePage
      title="Vår plan"
      icon="📋"
      intro="Här hanterar ni föreningens underhållsplaner. Redigera grundmallen, skapa nya planer och lägg till komponenter och underhållsåtgärder."
    >
      <PlanListaModul />
    </ModulePage>
  );
}
