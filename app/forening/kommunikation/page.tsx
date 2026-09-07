import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { KommunikationModul } from "@/components/kommunikation/KommunikationModul";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Kommunikation")),
    description:
      "Utskick till medlemmar, ärendehantering med spårbarhet och protokollreferens vid stängning.",
  };
}

export default function ForeningKommunikationPage() {
  return (
    <ModulePage
      title="Kommunikation"
      icon="✉️"
      intro="Hantera all kommunikation med föreningens medlemmar på ett ställe. Skicka riktade utskick, registrera inkommande ärenden och stäng dem med protokollreferens för full spårbarhet."
    >
      <KommunikationModul />
    </ModulePage>
  );
}
