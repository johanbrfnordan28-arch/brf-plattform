import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningProfilFormular } from "@/components/forening/ForeningProfilFormular";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Föreningsuppgifter")),
    description: "Kontakt och identifiering för styrelsens förening.",
  };
}

export default function ForeningUppgifterPage() {
  return (
    <ModulePage
      title="Föreningsuppgifter"
      icon="🏠"
      intro="Här fyller styrelsen i kontaktuppgifter. De används automatiskt i dokument, städschema, egenkontroller, upphandlingsunderlag och underhållsplanen."
    >
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">Två steg för nya kunder</p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            <strong>Styrelsens kontakt</strong> — fyll i formuläret nedan och spara.
          </li>
          <li>
            <strong>Fastighetens grunduppgifter</strong> — boarea, lägenheter och adresser i{" "}
            <Link
              href="/forening/underhallsplan#grund"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              underhållsplanen steg 1
            </Link>
            . Adressen föreslås från kontaktuppgifterna.
          </li>
        </ol>
      </div>

      <ForeningProfilFormular />
    </ModulePage>
  );
}
