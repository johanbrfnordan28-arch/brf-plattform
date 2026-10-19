import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningGrunduppgifterPanel } from "@/components/forening/ForeningGrunduppgifterPanel";
import { ForeningInloggningsPanel } from "@/components/forening/ForeningInloggningsPanel";
import { ForeningSakerhetskopieringPanel } from "@/components/forening/ForeningSakerhetskopieringPanel";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

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
      intro="Uppgifterna ni angav när föreningen skapades ligger här. Ändra eller komplettera vid behov — då synkas det till underhållsplan, lägenhetsregister, pris och avtal."
    >
      <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5">
        <p className="text-sm font-semibold text-primary-dark">
          Från testförening till kund
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            <strong>Identitet och grunduppgifter</strong> — namn,
            organisationsnummer, adress, styrelse och antal lägenheter fylls i
            när föreningen skapas och synkas hit och till{" "}
            <Link
              href="/forening/underhallsplan#grund"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              underhållsplanen
            </Link>
            . Saknas något kompletterar ni här — inte på övriga sidor.
          </li>
          <li>
            <strong>Inloggning</strong> — se vilka som har konto och när de
            loggat in. Bara du ser ditt eget lösenord.
          </li>
          <li>
            <strong>Teckna avtal</strong> —{" "}
            <Link
              href="/forening/teckna-avtal"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              öppna sidan Teckna avtal
            </Link>{" "}
            eller scrolla hit nedan. Två personer signerar med BankID.
            Prövoperiod 30 dagar utan uppsägningstid; därefter årsavtal 1 år med
            6 månaders uppsägning och KPI-justering. Utan tecknat avtal raderas
            föreningen efter prövoperioden.
          </li>
          <li>
            <strong>Säkerhetskopiering</strong> — under{" "}
            <Link
              href="/forening/uppgifter#sakerhetskopiering"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              Föreningsuppgifter
            </Link>
            . Spara regelbundet och tryck Återställ om data försvinner.
          </li>
        </ol>
      </div>

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
