import type { Metadata } from "next";
import Link from "next/link";
import { ApartmentArchiveDemo } from "@/components/lagenhetsarkiv/ApartmentArchiveDemo";
import { RenoveringsAnmalan } from "@/components/medlemmar/RenoveringsAnmalan";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { foreningModulMetadata } from "@/lib/forening-metadata-server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await foreningModulMetadata("Medlemmar")),
    description:
      "Medlemmar, renoveringar och lägenhetsarkiv för styrelsen.",
  };
}

export default function ForeningMedlemmarPage() {
  return (
    <ModulePage
      title="Medlemmar"
      icon="👥"
      intro="Hantera medlemmar, renoveringsärenden och lägenhetsarkiv — allt samlat i föreningens inloggade miljö."
    >
      <ContentSection title="För medlem och styrelse">
        <p>
          Medlemmen vet vad som krävs innan start, laddar ner mallar och laddar upp
          bevis. Styrelsen får anmälningar i samma format och ser status per
          lägenhet.
        </p>
      </ContentSection>

      <ContentSection title="Mallbibliotek och utskick">
        <p>
          Mallar för kontrakt, försäkringsbevis, egenkontroller och anmälan.
          Styrelsen kan skicka ut påminnelser till medlemmar som planerar
          renovering.
        </p>
      </ContentSection>

      <section id="renoveringar" className="scroll-mt-24">
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Renoveringar</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Styrelsen väljer vilken renovering medlemmen planerar — då byggs en
            checklista med grundkrav och tillägg per typ. Grundkraven omfattar
            bland annat att ventiler ska vara täckta och att byggdamm inte sprids till
            grannlägenheter eller föreningens ventilationssystem. När allt är
            godkänt kan medlemmen få klartecken att påbörja.
          </p>

          <div className="mt-8">
            <RenoveringsAnmalan />
          </div>

          <div id="lagenhetsarkiv" className="mt-10 scroll-mt-24 border-t border-border pt-8">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Lägenhetsarkiv
            </h3>
            <ApartmentArchiveDemo />
          </div>
        </article>
      </section>

      <p>
        <Link
          href="/forening"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Tillbaka till Styrelseflow
        </Link>
      </p>
    </ModulePage>
  );
}
