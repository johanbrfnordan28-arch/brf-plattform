import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { UnderhallsplanReklam } from "@/components/pris/UnderhallsplanReklam";
import { UnderhallsplanProffsUpplysning } from "@/components/underhallsplan/UnderhallsplanProffsUpplysning";
import { UnderhallsplanWizard } from "@/components/underhallsplan/UnderhallsplanWizard";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Underhåll")),
    description:
      "Professionellt framtagen underhållsplan som blir ett levande dokument — komponentregister, historik, besiktningar och budgetunderlag för er förening.",
  };
}

export default function ForeningUnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhåll"
      icon="🔧"
      intro="Underhållsplanen bör tas fram av en professionell part. Därefter är den ett levande dokument där styrelse eller förvaltare lägger till och tar bort komponenter, så planen förblir överskådlig för nästa styrelse."
    >
      <UnderhallsplanProffsUpplysning />
      <div className="mt-6">
        <UnderhallsplanReklam lage="forening" kompakt />
      </div>
      <div className="mt-6">
        <TipsPanel tips={tips.underhallsplan} />
      </div>
      <div className="mt-8">
        <UnderhallsplanWizard />
      </div>
    </ModulePage>
  );
}
