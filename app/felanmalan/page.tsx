import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: `Felanmälan för medlemmar — ${BRF_NAVET_NAMN}`,
  description:
    "Medlemmar anmäler fel som mejl och ärende — förvaltaren prioriterar och skickar vidare till entreprenör eller fastighetsskötare.",
};

export default function FelanmalanInfoPage() {
  return (
    <ModulePage
      title="Felanmälan"
      icon="📨"
      intro="Ersätter den tidigare modulen Energi & drift. Fokus ligger på att medlemmar enkelt kan anmäla fel som förvaltaren driver vidare — med ärendenummer, prioritet, orsak och historik."
    >
      <ContentSection title="Så fungerar det">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            Medlemmen fyller i rubrik, beskrivning, lägenhet och kontaktuppgifter.
          </li>
          <li>
            Ärende skapas med nummer (t.ex. FM-2026-0001) och mejl går till
            föreningens förvaltare/styrelse.
          </li>
          <li>
            Förvaltaren sätter prioritet, orsak och status — och kan mejla
            vidare till entreprenör eller fastighetsskötare.
          </li>
          <li>
            Tillträde och debitering: medlemmen kan ange nyckel/plats och om
            debitering kan bli aktuell om ingen är hemma.
          </li>
          <li>All hantering loggas i ärendehistoriken.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Kom igång">
        <p className="text-sm text-muted">
          Modulen finns i er förenings miljö under{" "}
          <strong className="text-foreground">Felanmälan</strong> när ni skapat
          er test- eller kundförening.
        </p>
        <Link
          href={PROVA_GRATIS_PATH}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Skapa förening och prova
        </Link>
      </ContentSection>
    </ModulePage>
  );
}
