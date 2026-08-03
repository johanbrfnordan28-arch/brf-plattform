import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningDataAdmin } from "@/components/forening/ForeningDataAdmin";
import { ForeningProfilFormular } from "@/components/forening/ForeningProfilFormular";
import { InloggningsBehorigheterPanel } from "@/components/forening/InloggningsBehorigheterPanel";
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
        <p className="text-sm font-semibold text-primary-dark">
          Börja här — föreningsuppgifter
        </p>
        <p className="mt-2 text-sm text-muted">
          Fyll i namn, kontaktperson, e-post och adress. När uppgifterna är
          sparade kommer ni direkt till portalen vid nästa inloggning — den här
          sidan visas bara igen om något saknas.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-foreground">
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

      <InloggningsBehorigheterPanel />

      <ForeningDataAdmin />
    </ModulePage>
  );
}
