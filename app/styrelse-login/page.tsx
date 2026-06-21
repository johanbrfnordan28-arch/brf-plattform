import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { ForeningInloggningsLista } from "@/components/forening/ForeningInloggningsLista";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Logga in styrelse — Styrelsenavet",
  description: "Separat inloggning för föreningar och styrelser.",
};

export default function StyrelseLoginPage() {
  return (
    <ModulePage
      title="Logga in styrelse"
      icon="🔐"
      intro="Styrelsen kan skapa en eller flera förenings sidor och växla mellan dem. Plattformsuppdateringar slås ihop på alla föreningar utan att radera ifyllda uppgifter."
    >
      <ContentSection title="Pågående provperioder" id="provperioder" plain>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Har föreningen redan startat en provperiod i den här webbläsaren? Välj
          föreningen i listan nedan för att logga in direkt.
        </p>
        <ForeningInloggningsLista kompakt />
      </ContentSection>

      <ContentSection title="Starta ny provperiod" id="skapa-forening" plain>
        <p className="mb-4 text-sm text-muted">
          Tryck på den gröna knappen nedan för att skapa er föreningssida. Ni kan ha flera
          föreningar i samma webbläsare — de visas sedan under Pågående provperioder.
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
