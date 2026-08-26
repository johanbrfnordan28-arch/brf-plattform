import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const BOSTADSRATTSLAGEN_URL =
  "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bostadsrattslag-1991614_sfs-1991-614/";

const BOVERKET_UNDERHALLSPLAN_URL =
  "https://www.boverket.se/sv/ekonomiska-planer/ekonomisk-plan/teknisk-underhallsplan/";

const underhallsplanFilm = guideFilmer.find((f) => f.id === "underhallsplan")!;

export const metadata: Metadata = {
  title: `Underhållsplan — ${BRF_NAVET_NAMN}`,
  description:
    "Få hjälp att ta fram eller uppdatera föreningens underhållsplan — grunduppgifter, renoveringshistorik och komponentregister samlat.",
};

export default function UnderhallsplanPage() {
  return (
    <ModulePage
      title="Underhållsplan"
      icon="🔧"
      intro="I föreningens egen portal bygger styrelsen eller styrelsens ombud upp underhållsplanen steg för steg: grunduppgifter, komponenter, tidigare renoveringar, kostnader och bildstöd samlas på ett ställe."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted">
          Ni kan få hjälp med att ta fram en ny underhållsplan eller uppdatera er
          befintliga. Det som behövs är grunduppgifter om fastigheten och en
          överskådlig beskrivning av utförda renoveringar. Rätt sak på rätt plats
          — det hjälper vi till med när ni{" "}
          <Link
            href="/#intro-film"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            hör av er och får prisuppgift
          </Link>
          .
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={underhallsplanFilm} />
      </div>

      <ContentSection title="Grunduppgifter först">
        <p>
          Styrelsen lägger in grunduppgifter som boarea, lokalyta, antal lägenheter,
          byggår, tomtstorlek, antal våningar och uppvärmning — det som behövs för
          att föreningen ska kunna påbörja planen.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Boarea och lokalyta (m²)</li>
          <li>Antal lägenheter och byggår</li>
          <li>Tomtstorlek</li>
          <li>Antal våningar och byggnader</li>
          <li>Adress (fler kan läggas till vid behov)</li>
          <li>Fastighetsbeteckning, uppvärmning och ventilationssystem</li>
        </ul>
      </ContentSection>

      <ContentSection title="Komponentregister">
        <p>
          Därefter skapas ett register över fastighetens delar — fasad (fönster och dörrar),
          tak, trapphus, källare, tvättstuga, VVS (undercentral, radiatorer, stambyte),
          stammar, mark och gård (cykelförråd, soprum), ventilation, hiss med flera.
          Systemet föreslår vanliga komponenter som styrelsen kan lägga till eller ta bort.
        </p>
      </ContentSection>

      <ContentSection title="Utförda renoveringar">
        <p>
          Historik över genomförda arbeten kopplas till komponentregistret. I första hand
          hämtas kostnader och årtal från föreningens ekonomiska förvaltare; styrelsen
          kan komplettera med egna poster. Det ger ett bättre underlag för framtida
          underhåll och utgifter i föreningens årsbudget.
        </p>
      </ContentSection>

      <ContentSection title="Bildstöd och analys">
        <p>
          Bilder laddas upp per komponent, till exempel tak och fasad. Systemet kan ge
          ett förslag på typ och synliga brister — men det är alltid föreningen som
          avgör om analysen stämmer innan underhåll planeras.
        </p>
      </ContentSection>

      <ContentSection title="Lagkrav och innehåll">
        <p>
          Lagkravet på teknisk underhållsplan gäller för nyproducerade och nyombildade
          bostadsrättsföreningar från och med 1 januari 2024 — se{" "}
          <a
            href={BOSTADSRATTSLAGEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            bostadsrättslagen (3 kap. 1 a §)
          </a>
          .
        </p>
        <p>
          Vad den tekniska underhållsplanen ska innehålla och hur den ska utformas
          framgår på{" "}
          <a
            href={BOVERKET_UNDERHALLSPLAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            Boverkets webbplats
          </a>
          .
        </p>
      </ContentSection>
    </ModulePage>
  );
}
