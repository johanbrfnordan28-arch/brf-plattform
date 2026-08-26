import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { PlanListaModul } from "@/components/plan/PlanListaModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Enkel åtgärdslista")),
    description:
      "Enkel lista över komponenter, åtgärder och kostnader — utan 50-årsbudget. För komplett plan använd Underhållsplan.",
  };
}

export default function ForeningPlanPage() {
  return (
    <ModulePage
      title="Enkel åtgärdslista"
      icon="📋"
      intro="En enkel arbetsyta för komponenter, åtgärder och kostnader — utan 50-årsbudget, besiktningar och diagram. För komplett underhållsplan med avsättning och K3-underlag, använd Underhållsplan i menyn."
    >
      <div className="mb-6 rounded-xl border border-primary/25 bg-[#eef6f0]/60 p-4 text-sm text-foreground">
        <p className="font-semibold text-primary-dark">
          Inte samma sak som Underhållsplanen
        </p>
        <p className="mt-1 text-muted">
          Den här sidan är en enkel lista över komponenter, åtgärder och
          kostnader. Behöver ni en komplett{" "}
          <strong>50-årsbudget</strong> med besiktningar, kostnadsfört underhåll
          och diagram klar för stämman — använd{" "}
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
