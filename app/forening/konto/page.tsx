import type { Metadata } from "next";
import { ForeningKontoPanel } from "@/components/auth/ForeningKontoPanel";
import { ModuleBackLink } from "@/components/ModuleBackLink";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Konto")),
    description: "Visa, spara och byt ditt lösenord till Styrelse-Navet.",
  };
}

export default function ForeningKontoPage() {
  return (
    <ModulePage
      title="Konto"
      icon="🔑"
      intro="Spara och visa ditt lösenord, eller byt det — samlat på ett ställe för dig som är inloggad i styrelsen."
    >
      <ForeningKontoPanel />
      <div className="mt-6">
        <ModuleBackLink />
      </div>
    </ModulePage>
  );
}
