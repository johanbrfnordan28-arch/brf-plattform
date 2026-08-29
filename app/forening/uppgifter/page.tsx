import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningProfilFormular } from "@/components/forening/ForeningProfilFormular";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { KUND_LOGIN_KNAPP_RUBRIK } from "@/lib/forening-kund";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Föreningsuppgifter")),
    description:
      "Kontakt, identifiering och godkännande av avtal för styrelsens förening.",
  };
}

export default function ForeningUppgifterPage() {
  return (
    <ModulePage
      title="Föreningsuppgifter"
      icon="🏠"
      intro="Här fyller styrelsen i kontaktuppgifter och kan godkänna avtalet så föreningen blir kund. Uppgifterna används i dokument, städschema, egenkontroller, upphandling och underhållsplanen — alltid isolerade till er förening."
    >
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">
          Från testförening till kund
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            <strong>Spara föreningsuppgifter</strong> — fyll i formuläret och
            tryck Spara.
          </li>
          <li>
            <strong>Godkänn avtal</strong> — längst ned på sidan. Då blir ni
            kund och loggar in via «{KUND_LOGIN_KNAPP_RUBRIK}» på Styrelse-Navet.
          </li>
          <li>
            <strong>Fastighetens grunduppgifter</strong> — boarea, lägenheter
            och adresser i{" "}
            <Link
              href="/forening/underhallsplan#grund"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              underhållsplanen steg 1
            </Link>
            .
          </li>
        </ol>
      </div>

      <ForeningProfilFormular />

      <div id="avtal" className="scroll-mt-24">
        <ForeningAvtalPanel />
      </div>
    </ModulePage>
  );
}
