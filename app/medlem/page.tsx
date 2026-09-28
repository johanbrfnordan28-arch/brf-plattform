import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { MedlemFelanmalanPortal } from "@/components/felanmalan/MedlemFelanmalanPortal";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Medlemsportal — felanmälan — ${BRF_NAVET_NAMN}`,
  description:
    "Medlemmar anmäler fel till sin förening utan styrelseinloggning. Historik hanteras av styrelsen och förvaltaren.",
};

export default function MedlemPage() {
  return (
    <ModulePage
      title="Medlemsportal"
      icon="🏠"
      intro="Här kan boende anmäla fel till sin förening. Ni behöver inte styrelse- eller förvaltarinloggning — sök er förening och skicka in ärendet. Ärendenummer får ni direkt. Status och historik ser bara styrelsen och förvaltaren inne i föreningens miljö."
    >
      <MedlemFelanmalanPortal />
      <p className="mt-10 text-center text-xs text-muted">
        <Link href="/" className="font-medium text-primary-dark underline hover:no-underline">
          Tillbaka till Styrelse-Navet
        </Link>
      </p>
    </ModulePage>
  );
}
