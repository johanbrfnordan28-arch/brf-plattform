import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningGrunduppgifterPanel } from "@/components/forening/ForeningGrunduppgifterPanel";
import { ForeningInloggningsPanel } from "@/components/forening/ForeningInloggningsPanel";
import { ForeningProfilFormular } from "@/components/forening/ForeningProfilFormular";
import { ForeningSakerhetskopieringPanel } from "@/components/forening/ForeningSakerhetskopieringPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";
import { KUND_LOGIN_KNAPP_RUBRIK } from "@/lib/forening-kund";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Föreningsuppgifter")),
    description:
      "Identitet, grunduppgifter, styrelse med BankID, inloggningar och godkännande av avtal.",
  };
}

export default function ForeningUppgifterPage() {
  return (
    <ModulePage
      title="Föreningsuppgifter"
      icon="🏠"
      intro="Här fyller styrelsen i föreningens identitet och grunduppgifter. Adresser, lägenheter och våningar kopieras till underhållsplanen. BankID kopplas på styrelsens medlemmar."
    >
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">
          Från testförening till kund
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            <strong>Identitet</strong> — namn och organisationsnummer (ofta
            redan ifyllda vid uppstart) plus e-post.
          </li>
          <li>
            <strong>Grunduppgifter</strong> — adresser, postnummer, ort, antal
            lägenheter/våningar och styrelse. Synkas till{" "}
            <Link
              href="/forening/underhallsplan#grund"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              underhållsplanen
            </Link>
            .
          </li>
          <li>
            <strong>Inloggning</strong> — se vilka som har konto och när de
            loggat in. Bara du ser ditt eget lösenord.
          </li>
          <li>
            <strong>Godkänn avtal</strong> — längst ned. Då blir ni kund och
            loggar in via «{KUND_LOGIN_KNAPP_RUBRIK}» på Styrelse-Navet.
          </li>
          <li>
            <strong>Säkerhetskopiering</strong> — ladda ner er data regelbundet.
            Ansvaret för backup ligger hos föreningen.
          </li>
        </ol>
      </div>

      <ForeningProfilFormular />

      <ForeningGrunduppgifterPanel />

      <ForeningSakerhetskopieringPanel />

      <div id="inloggning" className="scroll-mt-24">
        <ForeningInloggningsPanel />
      </div>

      <div id="avtal" className="scroll-mt-24">
        <ForeningAvtalPanel />
      </div>
    </ModulePage>
  );
}
