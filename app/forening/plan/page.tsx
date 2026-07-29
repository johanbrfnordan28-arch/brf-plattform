import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { PlanListaModul } from "@/components/plan/PlanListaModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Åtgärdsplan")),
    description:
      "En enkel åtgärds- och kostnadsöversikt — grundmall efter byggnadsperiod, komponenter, åtgärder och priser från leverantörer.",
  };
}

export default function ForeningPlanPage() {
  return (
    <ModulePage
      title="Åtgärdsplan"
      icon="📋"
      intro="En enkel arbetsyta för komponenter, åtgärder och kostnader. Välj byggnadsperiod på grundmallen så fylls typiska komponenter och åtgärder i automatiskt — sedan skapar ni egna åtgärdsplaner därifrån och kopplar priser från leverantörer."
    >
      <div className="mb-6 rounded-xl border border-primary/25 bg-[#eef6f0]/60 p-4 text-sm text-foreground">
        <p className="font-semibold text-primary-dark">
          Åtgärdsplan eller Underhållsplan?
        </p>
        <p className="mt-1 text-muted">
          <strong>Åtgärdsplan</strong> (den här sidan) är en enkel lista över
          komponenter, åtgärder och kostnader. Behöver ni en komplett{" "}
          <strong>50-årsbudget</strong> med besiktningar och diagram klar för
          stämman — använd{" "}
          <Link
            href="/forening/underhallsplan"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            Underhållsplan
          </Link>{" "}
          i stället.
        </p>
      </div>
      <TipsPanel tips={tips.plan} />
      <PlanListaModul />
    </ModulePage>
  );
}
