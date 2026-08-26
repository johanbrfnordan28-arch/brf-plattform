import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { NavetUpphandlingLista } from "@/components/upphandling/NavetUpphandlingLista";
import {
  arInramadUpphandlingsGrupp,
  upphandlingsGrupper,
} from "@/components/upphandling/kategorier";

export const metadata: Metadata = {
  title: "Upphandling — Styrelse-Navet",
  description:
    "Aktuella upphandlingar via Styrelse-Navet. Begränsad info publikt — underlag och anbud endast för inbjudna entreprenörer.",
};

export default function UpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling via Styrelse-Navet"
      icon="📋"
      intro="Här kan föreningar och entreprenörer se aktuella upphandlingar. Fullständigt förfrågningsunderlag och anbud är endast för inbjudna, godkända entreprenörer — utan publik kontakt till föreningen."
    >
      <ContentSection title="Aktuella upphandlingar">
        <NavetUpphandlingLista />
      </ContentSection>

      <ContentSection title="Så fungerar det">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            Styrelse-Navet publicerar ett förfrågningsunderlag. Publikt syns
            endast en kort beskrivning — ingen kontaktinformation.
          </li>
          <li>
            Vi bjuder in godkända entreprenörer via mejl med unik länk till
            underlaget.
          </li>
          <li>
            Inbjudna lämnar anbud till oss. Föreningen ser inte råa anbud —
            vi hanterar dem manuellt och återkopplar.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Kategorier">
        <div className="mt-2 space-y-6">
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
    </ModulePage>
  );
}
