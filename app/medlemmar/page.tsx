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
      intro="Samlad historik över renoveringar, tydliga rutiner för vad som gäller — och en strukturerad anmälan så styrelsen får rätt underlag i tid."
    >
      <ContentSection title="Renoveringshistorik">
        <p>
          Se vad som gjorts i lägenheten över tid — dokument, datum och status.
          Historiken hjälper styrelsen och medlemmen att slippa gissa vad som redan
          är godkänt eller utfört.
        </p>
      </ContentSection>

      <ContentSection title="Rutiner vid renovering">
        <p>
          Tydliga rutiner för olika åtgärder: målning, slipning av golv, badrum,
          kök, flytt av kök eller badrum, ändrad planlösning och håltagning i
          bärande vägg. Grundkrav gäller alltid; checklistan byggs på tills
          medlemmen får klartecken att påbörja.
        </p>
      </ContentSection>

      <ContentSection title="Anmälan och underlag">
        <p>
          Medlemmen vet vad som krävs innan start, laddar ner mallar och laddar
          upp underlag — försäkring, entreprenör och egenkontroller. Styrelsen får
          anmälningar i samma format och ser status per lägenhet, utan löst
          e-postutbyte.
        </p>
      </ContentSection>

      <ContentSection title="Lägenhetsarkiv efter inloggning">
        <p>
          Mappar per lägenhet, full renoveringshistorik och uppladdade dokument
          finns i den inloggade föreningssidan — under samma modul som
          renoveringsanmälan.
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
