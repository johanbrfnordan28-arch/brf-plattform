import type { Metadata } from "next";
import { ApartmentArchiveDemo } from "@/components/lagenhetsarkiv/ApartmentArchiveDemo";
import { RenoveringsAnmalan } from "@/components/medlemmar/RenoveringsAnmalan";
import { ContentSection } from "@/components/ContentSection";
import { ModuleBackLink } from "@/components/ModuleBackLink";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Medlemmar")),
    description:
      "Lägenhetsarkiv, överenskommelser och renoveringar för styrelsen och medlemmarna.",
  };
}

export default function ForeningMedlemmarPage() {
  return (
    <ModulePage
      title="Medlemmar & lägenhetsarkiv"
      icon="👥"
      intro="Börja i lägenhetsarkivet högst upp — öppna en lägenhet, fyll i uppgifter och spara. Renoveringar och överenskommelser hanteras under samma modul."
    >
      <ContentSection title="Så fungerar modulen">
        <p>
          Styrelsen bygger upp ett lägenhetsarkiv med sammanställning, grunduppgifter
          och flera renoveringsmappar per lägenhet (även historiska). När en medlem
          renoverar sammanställs en överenskommelse som mejlas till styrelsen först,
          därefter till medlemmen som signerar med BankID — dokumentet sparas i
          lägenhetens arkiv.
        </p>
      </ContentSection>

      <section id="lagenhetsarkiv" className="scroll-mt-24">
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Lägenhetsarkiv</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Sammanställning av alla skapade lägenheter högst upp. Per lägenhet syns
            år och typ av renovering. Flera mappar kan läggas till — inklusive
            äldre renoveringar i efterhand. Signerade överenskommelser ligger i
            respektive mapp.
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

      <div className="mt-4">
        <ModuleBackLink />
      </div>
    </ModulePage>
  );
}
