import type { Metadata } from "next";
import { EntreprenorVarningar } from "@/components/entreprenorer/EntreprenorVarningar";
import { FragaOmEntreprenorPanel } from "@/components/entreprenorer/FragaOmEntreprenorPanel";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Entreprenörer — Styrelse-Navet",
  description:
    "Fråga Styrelse-Navet om entreprenör. Föreningen ansvarar för uppdraget.",
};

export default function EntreprenorerPage() {
  return (
    <ModulePage
      title="Entreprenörer"
      icon="🏗️"
      intro="Styrelse-Navet har goda erfarenheter av entreprenörer vi tipsar om. Föreningen ansvarar för uppdraget som entreprenören anlitas för. Mejla oss om ni vill fråga."
    >
      <EntreprenorVarningar />
      <FragaOmEntreprenorPanel />
    </ModulePage>
  );
}
