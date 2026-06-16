import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { PlanListaModul } from "@/components/plan/PlanListaModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Vår plan")),
    description:
      "Skapa och hantera föreningens underhållsplaner — grundmall anpassad efter byggnadsperiod, komponenter och underhållsåtgärder.",
  };
}

export default function ForeningPlanPage() {
  return (
    <ModulePage
      title="Vår plan"
      icon="📋"
      intro="Här hanterar ni föreningens underhållsplaner. Välj byggnadsperiod på grundmallen så fylls typiska komponenter och åtgärder i automatiskt — sedan skapar ni era egna planer därifrån."
    >
      <TipsPanel tips={tips.plan} />
      <PlanListaModul />
    </ModulePage>
  );
}
