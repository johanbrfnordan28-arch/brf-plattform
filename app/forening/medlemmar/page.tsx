import type { Metadata } from "next";
import { ApartmentArchiveDemo } from "@/components/lagenhetsarkiv/ApartmentArchiveDemo";
import { RenoveringsAnmalan } from "@/components/medlemmar/RenoveringsAnmalan";
import { OppnaStangSektion } from "@/components/OppnaStangSektion";
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
      intro="Öppna lägenhetsarkivet med den gröna plusknappen. Välj sedan en adress, ett våningsplan eller alla lägenheter. Renoveringar och överenskommelser hanteras under samma modul."
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

      <OppnaStangSektion
        id="lagenhetsarkiv"
        titel="Lägenhetsarkiv"
        intro="Arkivet är hopfällt. Öppna det här, och välj sedan en adress, ett våningsplan eller alla lägenheter. Varje grupp öppnas med den gröna knappen och fälls ihop med den röda. Sök i rullgardinen när du letar efter en viss lägenhet."
      >
        <ApartmentArchiveDemo />
      </OppnaStangSektion>

      <OppnaStangSektion
        id="renoveringar"
        titel="Renoveringar"
        intro="Styrelsen väljer lägenhet (lägenhetsnummer), bygger checklista utifrån föreningens grundmall och skapar renoveringsmappar i lägenhetsarkivet. Datum sparas för framtida uppföljning. När checklistan är klar mejlas ombyggnadsavtalet till medlemmarna i lägenheten för BankID-signering — signerat avtal sparas i lägenhetens mapp."
      >
        <RenoveringsAnmalan />
      </OppnaStangSektion>

      <div className="mt-4">
        <ModuleBackLink />
      </div>
    </ModulePage>
  );
}
