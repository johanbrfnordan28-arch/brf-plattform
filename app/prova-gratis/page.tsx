import type { Metadata } from "next";
import { ModulePage } from "@/components/ModulePage";
import { SkapaEllerTestinloggning } from "@/components/forening/SkapaEllerTestinloggning";

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
      intro="Här startar styrelsen. Skapa föreningen, eller logga in på testföreningen om den redan finns. Provperioden är 30 dagar. Knappen Logga in i menyn är för föreningar som har tecknat avtal."
    >
      <div className="mx-auto max-w-xl">
        <SkapaEllerTestinloggning />
      </div>
    </ModulePage>
  );
}
