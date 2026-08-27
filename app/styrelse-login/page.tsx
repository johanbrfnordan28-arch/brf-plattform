import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { OppnaBefintligaForeningar } from "@/components/forening/OppnaBefintligaForeningar";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

export const metadata: Metadata = {
  title: "Logga in styrelse — Styrelse-Navet",
  description: "Öppna sparade föreningar eller skapa en ny testförening.",
};

export default function StyrelseLoginPage() {
  return (
    <ModulePage
      title="Logga in styrelse"
      icon="🔐"
      intro="Här öppnar ni era sparade föreningar — t.ex. Brf Sailor och Brf Nordan — eller skapar en ny. Föreningarna sparas i webbläsaren; växla mellan dem uppe till höger inne i Styrelseflow."
    >
      <ContentSection title="Öppna förening" plain>
        <OppnaBefintligaForeningar />
      </ContentSection>

      <ContentSection title="Skapa ny förening" id="skapa-forening" plain>
        <p className="mb-4 text-sm text-muted">
          Har ni ingen sparad förening i den här webbläsaren? Skapa en ny nedan.
          Ni kan ha flera föreningar och växla mellan dem i headern.
        </p>
        <SkapaForeningPanel visaSnabbstart />
      </ContentSection>

      <ContentSection title="Mer demo">
        <p className="text-sm text-muted">
          Investerarsidan har också genvägar till förifylld underhållsplan.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/investerare"
            className="inline-flex rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Investerardemo
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
