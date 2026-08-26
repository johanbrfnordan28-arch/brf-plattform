import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { TipsPanel } from "@/components/TipsPanel";
import { ForeningsDokumentbank } from "@/components/dokumentbank/ForeningsDokumentbank";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { tips } from "@/lib/tips-data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Dokumentbank")),
    description:
      "Ladda ned och anpassa mallar för upphandling, avtal och styrelsearbete — spara era kopior med status och notering.",
  };
}

export default function ForeningDokumentbankPage() {
  return (
    <ModulePage
      title="Dokumentbank"
      icon="📁"
      intro="Välj en mall, skapa er kopia och ladda ned som textfil — klar att fylla i och anpassa. Namnge kopian med projektnamnet så att ni hittar rätt dokument nästa gång."
    >
      <TipsPanel tips={tips.dokumentbank} />
      <ForeningsDokumentbank />
    </ModulePage>
  );
}
