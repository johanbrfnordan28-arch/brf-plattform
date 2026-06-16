import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { ForeningsDokumentbank } from "@/components/dokumentbank/ForeningsDokumentbank";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Dokumentbank")),
    description:
      "Skapa kopior av mallar för upphandling, juridik, avtal och styrelsearbete — ladda ned och hantera föreningens dokument.",
  };
}

export default function ForeningDokumentbankPage() {
  return (
    <ModulePage
      title="Dokumentbank"
      icon="📁"
      intro="Skapa kopior av färdiga mallar för upphandling, avtal, juridik och styrelsearbete. Mallarna kan laddas ned som textfiler och anpassas för er förening."
    >
      <ForeningsDokumentbank />
    </ModulePage>
  );
}
