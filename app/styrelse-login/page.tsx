import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { TestForeningLista } from "@/components/forening/TestForeningLista";

export const metadata: Metadata = {
  title: "Logga in styrelse — BRF Företag",
  description: "Logga in på er testförening eller skapa en ny.",
};

export default function StyrelseLoginPage() {
  return (
    <ModulePage
      title="Logga in styrelse"
      icon="🔐"
      intro="Logga in på er testförening med knappen nedan, eller skapa en ny. Alla föreningar sparas separat i webbläsaren."
    >
      {/* Befintliga testföreningar — primär login */}
      <TestForeningLista />

      <ContentSection title="Skapa ny förening" id="skapa-forening" plain>
        <p className="mb-4 text-sm text-muted">
          Fyll i föreningens namn och tryck på den gröna knappen.
        </p>
        <SkapaForeningPanel visaSnabbstart />
      </ContentSection>

      <ContentSection title="Demo-inloggning">
        <p>
          I den riktiga versionen verifieras användaren med lösenord eller BankID.
          I prototypen kan du gå direkt till föreningens sida genom knappen nedan.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/investerare"
            className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Investerardemo (rekommenderat)
          </Link>
          <Link
            href="/forening"
            className="inline-flex rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Gå till Styrelseflow
          </Link>
        </div>
      </ContentSection>
    </ModulePage>
  );
}
