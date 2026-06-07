import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { PubliceradeUpphandlingarPanel } from "@/components/upphandling/PubliceradeUpphandlingarPanel";
import {
  arInramadUpphandlingsGrupp,
  upphandlingsGrupper,
} from "@/components/upphandling/kategorier";

export const metadata: Metadata = {
  title: "Upphandling — BRF Företag",
  description:
    "Publicerade upphandlingar från BRF-föreningar — titel, ort, kategori och sista anbudsdag.",
};

export default function UpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Styrelsen publicerar uppdrag från föreningssidan. Här syns aktuella upphandlingar med sista anbudsdag — anbudsinnehåll visas inte publikt."
    >
      <ContentSection title="Publicerade upphandlingar">
        <PubliceradeUpphandlingarPanel />
      </ContentSection>

      <ContentSection title="Så fungerar det">
        <p>
          Föreningen bygger en upphandling med beskrivning, anbudsformulär och
          kontraktsformulär — enkelt (max tre dokument) eller utökat med AF,
          ritning och bilagor. Med knappen <strong>Upphandla</strong> syns
          uppdraget publikt med titel, ort, kategori och sista anbudsdag — utan
          att anbud visas.
        </p>
        <p>
          Entreprenörer med godkänt konto lämnar anbud i er standardiserade
          formulär. Under anbudstiden är innehållet låst; utvärdering sker först
          efter deadline.
        </p>
      </ContentSection>

      <ContentSection title="Kategorier efter typ">
        <p>
          Välj kategori när upphandlingen skapas. Per kategori finns plats för
          projektbeskrivning, underlag, anbudsformulär och fler dokument — med
          mallar från föreningens dokumentbank.
        </p>
        <div className="mt-4 space-y-6">
          {upphandlingsGrupper.map((grupp) => (
            <div
              key={grupp.id}
              className={
                arInramadUpphandlingsGrupp(grupp.id)
                  ? "rounded-xl border-2 border-dashed border-primary/30 bg-[#eef6f0]/40 p-4"
                  : ""
              }
            >
              <h3 className="text-sm font-semibold text-foreground">{grupp.titel}</h3>
              <p className="mt-1 text-xs text-muted">{grupp.beskrivning}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {grupp.kategorier.map((name) => (
                  <li
                    key={name}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Enkel eller komplicerad upphandling">
        <p>
          <strong>Enkel:</strong> beskrivning, anbudsformulär, kontraktsformulär.
        </p>
        <p>
          <strong>Komplicerad:</strong> utökat paket med administrativa föreskrifter,
          ritningar och bilagor — ofta vid stambyte, fasad och större byggprojekt.
        </p>
        <p>
          Föreningen kan driva upphandlingen själv eller med inhyrd projektledare
          som ingår i tjänsten.
        </p>
      </ContentSection>

      <ContentSection title="Behörighet och sekretess">
        <p>
          Upphandlingsdelen är känslig. Inkomna anbud och offerter ska inte vara
          synliga för alla anställda, entreprenörer eller styrelser. Informationen
          hanteras i den interna portalen och släpps vidare först när ni väljer att
          dela den med rätt mottagare.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
