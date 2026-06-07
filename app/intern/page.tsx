import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { InternUpphandlingModul } from "@/components/upphandling/InternUpphandlingModul";

export const metadata: Metadata = {
  title: "Intern portal — BRF Företag",
  description:
    "Intern inloggning för administration, behörigheter och känsliga uppgifter.",
};

export default function InternPage() {
  return (
    <ModulePage
      title="Intern portal"
      icon="🗂️"
      intro="Intern inloggning för er egen organisation. Här kan olika behörigheter styra vem som får se hela portalen och vem som bara får tillgång till vissa delar."
    >
      <ContentSection title="Upphandlingar och anbud (internt)">
        <p className="mb-4 text-sm text-muted">
          Inkomna anbud hanteras här — styrelsen ser dem inte. När utvärderingen är klar
          levereras den till föreningssidan för styrelsens beslut.
        </p>
        <InternUpphandlingModul />
      </ContentSection>

      <ContentSection title="Olika behörighetsnivåer">
        <p>
          Du kan ha en övergripande behörighet som ser alla föreningar,
          upphandlingar, inkomna anbud, offerter och inställningar. Andra
          anställda kan få begränsad åtkomst till de delar de behöver för sitt
          arbete.
        </p>
      </ContentSection>

      <ContentSection title="Känslig upphandlingsinformation">
        <p>
          Upphandlingar, inkomna anbud och offerter kan vara känsliga. Därför bör
          de inte visas för alla anställda, entreprenörer eller styrelser. Styrelsen
          får endast se materialet när ni väljer att släppa det vidare.
        </p>
      </ContentSection>

      <ContentSection title="Exempel på roller">
        <ul className="list-disc space-y-1 pl-5">
          <li>Systemansvarig: ser allt och kan hantera behörigheter.</li>
          <li>Intern medarbetare: ser endast tilldelade föreningar och arbetsområden.</li>
          <li>Styrelse: ser sin egen föreningssida och det material som är släppt till dem.</li>
          <li>Entreprenör: ser aktuella upphandlingar och sina egna inlämnade anbud.</li>
        </ul>
      </ContentSection>
    </ModulePage>
  );
}
