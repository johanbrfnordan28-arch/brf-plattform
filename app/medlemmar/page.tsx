import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";

export const metadata: Metadata = {
  title: "Renoveringshistorik & rutiner — BRF Företag",
  description:
    "Renoveringshistorik per lägenhet, tydliga rutiner och strukturerad anmälan för styrelse och medlemmar.",
};

export default function MedlemmarPage() {
  return (
    <ModulePage
      title="Renoveringshistorik & rutiner"
      icon="📋"
      intro="Samlad historik över renoveringar, tydliga rutiner för vad som gäller vid olika åtgärder — och en strukturerad anmälan så styrelsen får rätt underlag i tid."
    >
      <ContentSection title="Renoveringshistorik">
        <p>
          Se vad som gjorts i lägenheten över tid — dokument, datum och status.
          Historiken hjälper styrelsen och medlemmen att slippa gissa vad som
          redan är godkänt eller utfört.
        </p>
      </ContentSection>

      <ContentSection title="Rutiner vid renovering">
        <p>
          Tydliga rutiner för olika åtgärder: målning, slipning av golv, badrum,
          kök, flytt av kök/badrum, ändrad planlösning eller håltagning i bärande
          vägg. Grundkrav ingår alltid; checklistan byggs på tills medlemmen får
          klartecken att påbörja.
        </p>
      </ContentSection>

      <ContentSection title="Anmälan och mallar">
        <p>
          Medlemmen vet vad som krävs innan start, laddar ner mallar och laddar
          upp bevis (försäkring, entreprenör). Styrelsen får anmälningar i samma
          format och ser status per lägenhet — mindre ad hoc-e-post.
        </p>
      </ContentSection>

      <ContentSection title="Lägenhetsarkiv efter inloggning">
        <p>
          Mappar per lägenhet, full renoveringshistorik och uppladdade dokument
          finns i den inloggade föreningssidan under samma modul.
        </p>
        <Link
          href="/styrelse-login"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Logga in för lägenhetsarkiv
        </Link>
      </ContentSection>
    </ModulePage>
  );
}
