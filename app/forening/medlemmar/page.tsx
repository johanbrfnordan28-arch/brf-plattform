import type { Metadata } from "next";
import { ApartmentArchiveDemo } from "@/components/lagenhetsarkiv/ApartmentArchiveDemo";
import { RenoveringsAnmalan } from "@/components/medlemmar/RenoveringsAnmalan";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Medlemmar")),
    description:
      "Lägenhetsarkiv, renoveringshistorik och anmälningar för styrelsen och medlemmarna.",
  };
}

export default function ForeningMedlemmarPage() {
  return (
    <ModulePage
      title="Medlemmar"
      icon="👥"
      intro="Lägenhetsuppgifter, renoveringshistorik och anmälningar samlade på ett ställe — med tydliga krav innan medlemmen får påbörja."
    >
      <ContentSection title="Så fungerar modulen">
        <p>
          Styrelsen bygger upp ett lägenhetsarkiv med grunduppgifter och dokument per
          lägenhet. När en medlem planerar renovering väljer styrelsen typ av åtgärd — då
          skapas en checklista med grundkrav och tillägg. Medlemmen ser samma krav,
          laddar upp underlag och får klartecken när allt är godkänt.
        </p>
      </ContentSection>

      <section id="lagenhetsarkiv" className="scroll-mt-24">
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Lägenhetsarkiv</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Välj lägenhet ovan — panelen{" "}
            <strong className="font-medium text-foreground">
              Lägenhetsuppgifter & tekniska installationer
            </strong>{" "}
            visas direkt under lägenhetslistan med statusöversikt, rum, besiktning
            och installationer. Skapa renoveringsmappar längre ned i samma vy.
          </p>

          <div className="mt-8">
            <ApartmentArchiveDemo />
          </div>
        </article>
      </section>

      <section id="renoveringar" className="scroll-mt-24">
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Renoveringar</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Välj vilken renovering medlemmen planerar — då byggs en checklista med
            grundkrav och tillägg per typ. Grundkraven omfattar bland annat att ventiler
            ska vara täckta och att byggdamm inte sprids till grannlägenheter eller
            föreningens ventilationssystem. När alla punkter är godkända kan medlemmen
            få klartecken att påbörja.
          </p>

          <div className="mt-8">
            <RenoveringsAnmalan />
          </div>
        </article>
      </section>

    </ModulePage>
  );
}
