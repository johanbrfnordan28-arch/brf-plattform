import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { PlanEditorModul } from "@/components/plan/PlanEditorModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { GRUNDMALL_PLAN_ID } from "@/components/plan/plan-lager";

interface Props {
  params: Promise<{ planId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { planId } = await params;
  const rubrik =
    planId === GRUNDMALL_PLAN_ID ? "Redigera grundmall" : "Redigera plan";
  return {
    ...(await foreningModulMetadata(rubrik)),
    description: "Redigera planens komponenter, underhållsåtgärder och metadata.",
  };
}

export default async function PlanEditorPage({ params }: Props) {
  const { planId } = await params;
  const rubrik =
    planId === GRUNDMALL_PLAN_ID ? "Redigera grundmall" : "Redigera plan";
  const intro =
    planId === GRUNDMALL_PLAN_ID
      ? "Grundmallen används som startpunkt när nya underhållsplaner skapas. Lägg till de komponenter och åtgärder som de flesta nya planer bör innehålla."
      : "Lägg till och ta bort komponenter, planera underhållsåtgärder och koppla prislistor från leverantörer.";

  return (
    <ModulePage title={rubrik} icon="📋" intro={intro}>
      <PlanEditorModul planId={planId} />
    </ModulePage>
  );
}
