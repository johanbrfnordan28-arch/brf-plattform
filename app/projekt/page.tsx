import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { standardUndermappar } from "@/components/projekt/projekt";

export const metadata: Metadata = {
  title: "Projekt — BRF Företag",
  description: "Projektmappar för styrelse och entreprenad.",
};

export default function ProjektPage() {
  return (
    <ModulePage
      title="Projekt"
      icon="📐"
      intro="Strukturerade projektmappar med årtal — protokoll, underlag, ritningar, kontrakt och besiktningar samlade per projekt."
    >
      <ContentSection title="Undermappar i varje projekt">
        <ul className="list-disc space-y-2 pl-5 text-foreground">
          {standardUndermappar.map((m) => (
            <li key={m.id}>
              <span className="font-medium">{m.titel}</span>
              <span className="text-muted"> — {m.beskrivning}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="I föreningens miljö">
        <p>
          Efter inloggning skapar styrelsen projekt med årtal, laddar upp dokument
          och kan lägga till egna undermappar. Avslutade projekt ligger kvar — äldre
          år sorteras längre ner.
        </p>
        <Link
          href="/styrelse-login"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Logga in för projekthantering
        </Link>
      </ContentSection>
    </ModulePage>
  );
}
