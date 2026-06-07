import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Skapa vår förening — BRF Företag",
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
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Steg 1 — Skapa föreningens sida
        </h2>
        <SkapaForeningPanel visaSnabbstart />
      </div>
    </ModulePage>
  );
}
