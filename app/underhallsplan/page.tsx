import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Underhållsplan — BRF Företag",
  description:
    "Bygg upp föreningens underhållsplan med grunduppgifter, komponentregister, historik och bildstöd.",
};

export default function UnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhållsplan"
      icon="🔧"
      intro="I föreningens egen portal bygger styrelsen eller styrelsens ombud upp underhållsplanen steg för steg: grunduppgifter, komponenter, tidigare renoveringar, kostnader och bildstöd samlas på ett ställe."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Interaktiv underhållsplan
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Den här sidan beskriver funktionerna. Själva verktyget — wizard med
          komponentregister, budget och bildstöd — finns i{" "}
          <strong className="font-medium text-foreground">Grundmall föreningar</strong>{" "}
          efter inloggning.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/styrelse-login"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Logga in (demo)
          </Link>
          <Link
            href="/forening/underhallsplan"
            className="inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Gå direkt till verktyget
          </Link>
        </div>
      </div>

      <ContentSection title="Grunduppgifter först">
        <p>
          Styrelsen lägger in grunduppgifter som boarea, lokalyta, antal lägenheter,
          byggår, tomtstorlek, antal våningar och uppvärmning — det som behövs för
          att föreningen ska kunna påbörja planen.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Boarea och lokalyta (m²)</li>
          <li>Antal lägenheter och byggår</li>
          <li>Tomtstorlek</li>
          <li>Antal våningar och byggnader</li>
          <li>Adress (fler kan läggas till vid behov)</li>
          <li>Fastighetsbeteckning, uppvärmning och ventilationssystem</li>
        </ul>
      </ContentSection>

      <ContentSection title="Komponentregister">
        <p>
          Därefter skapas ett register över fastighetens delar — fasad (fönster och dörrar),
          tak, trapphus, källare, tvättstuga, VVS (undercentral, radiatorer, stambyte),
          stammar, mark och gård (cykelförråd, soprum), ventilation, hiss med flera.
          Systemet föreslår vanliga komponenter som styrelsen kan lägga till eller ta bort.
        </p>
      </ContentSection>

      <ContentSection title="Utförda renoveringar">
        <p>
          Historik över genomförda arbeten kopplas till komponentregistret. I första hand
          hämtas kostnader och årtal från föreningens ekonomiska förvaltare; styrelsen
          kan komplettera med egna poster. Det ger ett bättre underlag för framtida
          underhåll och utgifter i föreningens årsbudget.
        </p>
      </ContentSection>

      <ContentSection title="Bildstöd och analys">
        <p>
          Bilder laddas upp per komponent, till exempel tak och fasad. Systemet kan ge
          ett förslag på typ och synliga brister — men det är alltid föreningen som
          avgör om analysen stämmer innan underhåll planeras.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
