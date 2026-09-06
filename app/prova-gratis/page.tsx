import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Skapa vår förening — Styrelse-Navet",
  description:
    "Styrelsen skapar er förenings sida och kan prova plattformen gratis i 30 dagar.",
};

/** Bokmärkesadress — endast sidan för att skapa föreningen. */
export default function ProvaGratisPage() {
  return (
    <ModulePage
      title="Skapa vår förening"
      icon="🏠"
      intro="Här skapar styrelsen er egen föreningssida. Fyll i namn, kontaktuppgifter och tryck på Skapa förening."
    >
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Skapa föreningens sida
        </h2>
        <SkapaForeningPanel />
      </div>
    </ModulePage>
  );
}
