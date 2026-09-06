import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { MessanSkickaLankForm } from "@/components/styrelsemassa/MessanSkickaLankForm";

export const metadata: Metadata = {
  title: "Skapa vår förening — Styrelse-Navet",
  description:
    "Styrelsen skapar er förenings sida och kan prova plattformen gratis i 30 dagar — eller få en länk mejlad.",
};

/** Bokmärkesadress — skapa förening direkt eller få länk mejlad. */
export default function ProvaGratisPage() {
  return (
    <ModulePage
      title="Skapa vår förening"
      icon="🏠"
      intro="Här startar styrelsen. Skapa er förening direkt — eller be om en länk mejlad så ni kan fundera i lugn och ro."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Skapa föreningens sida nu
          </h2>
          <SkapaForeningPanel />
        </div>
        <MessanSkickaLankForm />
      </div>
    </ModulePage>
  );
}
