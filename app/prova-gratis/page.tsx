import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Skapa vår förening — Styrelse-Navet",
  description:
    "Styrelsen skapar er förenings sida och kan prova plattformen gratis i 30 dagar.",
};

/** Bokmärkesadress — skapa förening direkt. */
export default function ProvaGratisPage() {
  return (
    <ModulePage
      title="Skapa vår förening"
      icon="🏠"
      intro="Här startar styrelsen. Fyll i uppgifterna nedan så skapas er förenings sida — ni kan prova plattformen gratis i 30 dagar."
    >
      <div className="mx-auto max-w-xl">
        <SkapaForeningPanel />
      </div>
    </ModulePage>
  );
}
