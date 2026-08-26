import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { PubliceradeUpphandlingarPanel } from "@/components/upphandling/PubliceradeUpphandlingarPanel";
import {
  arInramadUpphandlingsGrupp,
  upphandlingsGrupper,
} from "@/components/upphandling/kategorier";

export const metadata: Metadata = {
  title: "Upphandling — Styrelse-Navet",
  description:
    "Publicerade upphandlingar från BRF-föreningar — titel, ort, kategori och sista anbudsdag. Anbud hanteras manuellt av oss.",
};

export default function UpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling"
      icon="📋"
      intro="Aktuella uppdrag som publicerats via Styrelse-Navet. Anbud och offerter visas inte här — de hanteras manuellt av oss."
    >
      <ContentSection title="Publicerade upphandlingar">
        <PubliceradeUpphandlingarPanel />
      </ContentSection>

      <ContentSection title="Så fungerar det">
        <p>
          Föreningen begär publicering via landningssidan eller föreningsmodulen.
          Vi bjuder in entreprenörer till underlaget. Anbud fylls i och kommer till
          oss — ingen på föreningssidan ser inkomna anbud.
        </p>
        <p>
          I början sköts inbjudan och anbudshantering manuellt. När utvärderingen är
          klar återkopplar vi till styrelsen utan att öppna anbudsöversikten i
          föreningsvyn.
        </p>
      </ContentSection>

      <ContentSection title="Kategorier efter typ">
        <p>
          Välj kategori när upphandlingen skapas. Per kategori finns plats för
          projektbeskrivning, underlag och övriga dokument.
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

      <ContentSection title="Behörighet och sekretess">
        <p>
          Inkomna anbud och offerter syns inte för styrelsen, entreprenörer eller
          publikt. Informationen hanteras av oss och delas vidare först när ni
          väljer det.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
