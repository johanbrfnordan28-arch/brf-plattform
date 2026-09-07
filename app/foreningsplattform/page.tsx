import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModuleCard } from "@/components/ModuleCard";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Föreningsplattform — BRF Företag",
  description:
    "Kopierbar grundmall för föreningar med dokument, avtal, upphandlingar och struktur.",
};

const associationModules = [
  {
    title: "Upphandling",
    description:
      "Skapa underlag, publicera upphandling och låt godkända entreprenörer lämna anbud.",
    href: "/upphandling",
    icon: "📋",
  },
  {
    title: "Underhållsplan",
    description:
      "Bygg komponentregister, renoveringshistorik och framtida planering för fastigheten.",
    href: "/underhallsplan",
    icon: "🔧",
  },
  {
    title: "Dokument & avtal",
    description:
      "Samla AF-delar, avtal, mallar, protokoll och viktiga styrelsedokument.",
    href: "/foreningsplattform",
    icon: "📄",
  },
  {
    title: "Rondering & avvikelser",
    description:
      "Följ upp städning och fastighetsskötsel med checklistor, signering och avvikelser.",
    href: "/rondering",
    icon: "✅",
  },
  {
    title: "Juridik",
    description:
      "Hitta vägledande domar och stöd när styrelsen ska hantera vanliga ärenden.",
    href: "/juridik",
    icon: "⚖️",
  },
  {
    title: "Medlemmar",
    description:
      "Hantera renoveringsanmälningar, utskick och information till medlemmar.",
    href: "/medlemmar",
    icon: "👥",
  },
];

export default function ForeningsplattformPage() {
  return (
    <ModulePage
      title="Föreningsplattform"
      icon="🏢"
      intro="Föreningssidan skapas först efter accepterad offert. Styrelsen loggar sedan in med BankID via Logga in — utan att någon kundlista visas publikt."
    >
      <ContentSection title="Flödet för styrelsen">
        <p>
          Styrelsen börjar på vår publika sida. När offert är accepterad skapas
          föreningens egen sida. Behöriga personer loggar in med BankID via
          Logga in. Styrelsen styr själva vilka som får logga in. Support och
          anställda har en separat väg in för att hjälpa till — kundkatalogen
          exponeras aldrig.
        </p>
      </ContentSection>

      <ContentSection title="Grundmall för varje förening">
        <p>
          När en förening ansluts skapas en egen sida med samma grundstruktur.
          Därefter kan sidan anpassas med föreningens uppgifter, dokument,
          kontaktpersoner, roller och valda moduler. Målet är att styrelsen snabbt
          ska få en tydlig och användbar portal utan att behöva bygga allt från
          början.
        </p>
      </ContentSection>

      <ContentSection title="Funktioner styrelsen känner igen">
        <p>
          Föreningens egen sida ska kännas igen från originalsidan, men innehållet
          visas i föreningens egna miljö. Styrelsen får samma huvudfunktioner,
          anpassade med föreningens dokument, roller och ärenden.
        </p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {associationModules.map((mod) => (
            <ModuleCard key={mod.title} {...mod} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Dokument och mallar">
        <p>
          Plattformen kan innehålla färdiga mallar och uppladdade dokument, till
          exempel administrativa föreskrifter, avtalsmallar, anbudsformulär,
          kontraktsformulär, tekniska beskrivningar, ritningar och bilagor.
          Dokumenten kan användas som underlag vid upphandling, renovering,
          förvaltning och styrelsearbete.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>AF-delar och upphandlingsmallar</li>
          <li>Avtal och kontraktsmallar</li>
          <li>Beskrivningar, formulär och bilagor</li>
          <li>Protokoll, policies och styrelsedokument</li>
        </ul>
      </ContentSection>

      <ContentSection title="Lägenhetsmappar och renoveringshistorik">
        <p>
          På föreningssidan ska styrelsen enkelt kunna skapa en mapp för varje
          lägenhet. Varje lägenhetsmapp får en grundstruktur med tre dokumentsidor,
          till exempel anmälningar, beslut och slutdokument. Om föreningen behöver
          mer struktur ska styrelsen kunna lägga till fler undermappar.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Skapa ny lägenhetsmapp</li>
          <li>Skapa undermapp för renovering eller annat ärende</li>
          <li>Ta bort mapp när den skapats fel eller inte längre ska användas</li>
          <li>Flytta upp nya renoveringsmappar så de senaste ärendena syns först</li>
        </ul>
        <p>
          Vid en renovering kan styrelsen eller medlemmen skapa en särskild
          undermapp i lägenheten. Nya renoveringsmappar lägger sig överst så att
          aktuella ärenden alltid syns först. Där samlas anmälan, godkännanden,
          ritningar, entreprenörsuppgifter, bilder, intyg och slutdokument.
        </p>
        <p>
          Även gamla utförda renoveringar kan läggas in i efterhand. När någon i
          framtiden bygger om finns historiken kvar och styrelsen kan se vad som
          redan är gjort, när det gjordes och vilka dokument som hör till. Allt
          blir då spårbart över tid.
        </p>
        <p>
          I den riktiga lösningen nås lägenhetsarkivet först efter att styrelsen
          har loggat in på föreningens egen sida.
        </p>
      </ContentSection>

      <ContentSection title="Struktur för styrelsen">
        <p>
          Föreningssidan ska hjälpa styrelsen att förstå var informationen hör
          hemma. Dokument kan sorteras efter område, exempelvis upphandling,
          underhållsplan, ekonomi, juridik, rondering, medlemmar och
          renoveringsarkiv. Det gör sidan enkel att kopiera till nya föreningar
          men ändå möjlig att anpassa.
        </p>
      </ContentSection>

      <ContentSection title="Roller och åtkomst">
        <p>
          Styrelsen kan ha åtkomst till hela föreningssidan, medan entreprenörer,
          ombud, projektledare eller ekonomisk förvaltare kan få begränsad åtkomst
          till de delar de behöver. Det gör att rätt personer kan bidra med
          information utan att allt blir öppet för alla.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
