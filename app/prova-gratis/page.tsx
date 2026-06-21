import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Skapa vår förening — Styrelsenavet",
  description:
    "Styrelsen skapar er förenings sida och kan prova plattformen gratis i 30 dagar.",
};

/** Bokmärkesadress i Safari — endast sidan för att skapa föreningen. */
export default function ProvaGratisPage() {
  return (
    <ModulePage
      title="Skapa vår förening"
      icon="🏠"
      intro="Här skapar styrelsen er egen föreningssida (kopia av grundmallen). Fyll i namn, bocka i bekräftelsen och tryck på den gröna knappen nedan."
    >
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            Steg 1 — Skapa föreningens sida
          </h2>
          <Link
            href="/#provperioder"
            className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Visa pågående provperioder
          </Link>
        </div>
        <SkapaForeningPanel visaSnabbstart />
      </div>
    </ModulePage>
  );
}
