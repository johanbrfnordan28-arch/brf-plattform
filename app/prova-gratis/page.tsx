import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { TestForeningLista } from "@/components/forening/TestForeningLista";

export const metadata: Metadata = {
  title: "Skapa vår förening — BRF Företag",
  description:
    "Styrelsen skapar er föreningssida och loggar in direkt — gratis testperiod.",
};

/** Bokmärkesadress i Safari — skapa förening och logga in. */
export default function ProvaGratisPage() {
  return (
    <ModulePage
      title="Skapa vår förening"
      icon="🏠"
      intro="Styrelsen skapar er föreningssida och loggar in direkt. Befintliga testföreningar visas nedan — klicka på en knapp för att logga in."
    >
      {/* Befintliga testföreningar */}
      <TestForeningLista />

      {/* Skapa ny förening */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Skapa ny testförening
        </h2>
        <SkapaForeningPanel visaSnabbstart />
      </div>
    </ModulePage>
  );
}
