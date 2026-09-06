import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { UnderhallsplanProffsUpplysning } from "@/components/underhallsplan/UnderhallsplanProffsUpplysning";

export const metadata: Metadata = {
  title: "Underhållsplan — Styrelse-Navet",
  description:
    "Professionellt framtagen underhållsplan som blir ett levande dokument för styrelse och förvaltare — överskådlig för kommande styrelser.",
};

export default function UnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhållsplan"
      icon="🔧"
      intro="Underhållsplanen bör tas fram av en professionell part. I föreningens portal blir den sedan ett levande arbetsdokument där styrelse eller förvaltare lägger till och tar bort komponenter — så planen håller för nästa styrelse."
    >
      <UnderhallsplanProffsUpplysning />

      <div className="mt-6 rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Interaktiv underhållsplan
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Den här sidan beskriver funktionerna. Själva verktyget — wizard med
          komponentregister, budget och bildstöd — finns på föreningssidan efter
          inloggning.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/styrelse-login"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Logga in
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
          Styrelsen eller förvaltaren lägger in grunduppgifter som boarea,
          lokalyta, antal lägenheter, byggår, tomtstorlek, antal våningar och
          uppvärmning — det som behövs för att planen ska spegla er fastighet.
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

      <ContentSection title="Komponentregister — lägg till och ta bort">
        <p>
          Registret över fastighetens delar — fasad, fönster och dörrar, tak,
          trapphus, källare, VVS, ventilation, hiss med mera — anpassas till er.
          Föreslagna komponenter kan aktiveras, inaktiveras eller tas bort helt.
          Egna huvudkomponenter (t.ex. solceller) läggs till vid behov. Målet är
          en plan som bara innehåller det som behövs — enkel att följa för
          kommande styrelse.
        </p>
      </ContentSection>

      <ContentSection title="Utförda renoveringar">
        <p>
          Historik över genomförda arbeten kopplas till komponentregistret. I
          första hand hämtas kostnader och årtal från ekonomisk förvaltare;
          styrelsen kan komplettera. Det ger bättre underlag för framtida
          underhåll och årsbudget.
        </p>
      </ContentSection>

      <ContentSection title="Slutprodukt för nästa styrelse">
        <p>
          Summeringen (slutsidan) ger översikt: avsättning, tidsaxel, budget per
          år, register och checklista. Skriv ut eller spara som PDF inför
          styrelsemöte — så nästa mandatperiod får en tydlig utgångspunkt.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
