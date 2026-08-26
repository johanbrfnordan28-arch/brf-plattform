import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { BegarPubliceringLista } from "@/components/upphandling/BegarPubliceringLista";
import { InternNavetUpphandlingPanel } from "@/components/upphandling/InternNavetUpphandlingPanel";
import { InternUpphandlingModul } from "@/components/upphandling/InternUpphandlingModul";

export const metadata: Metadata = {
  title: "Intern portal — Styrelse-Navet",
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
      <ContentSection title="Navet-upphandling — inbjudan och anbud">
        <p className="mb-4 text-sm text-muted">
          Publicerade uppdrag på Styrelse-Navet. Bjud in godkända entreprenörer via
          mejl (unik länk till underlaget) och ta emot anbud här — syns inte för
          föreningen.
        </p>
        <InternNavetUpphandlingPanel />
      </ContentSection>

      <ContentSection title="Inkomna publiceringsförfrågningar">
        <p className="mb-4 text-sm text-muted">
          Förfrågningar från landningssidan (&quot;Begär publicering&quot;). Hanteras
          manuellt innan ni publicerar underlag och bjuder in entreprenörer.
        </p>
        <BegarPubliceringLista />
      </ContentSection>

      <ContentSection title="Föreningspublicerade upphandlingar (äldre flöde)">
        <p className="mb-4 text-sm text-muted">
          Upphandlingar publicerade från föreningsmodulen. Anbud här är demo/internt —
          styrelsen ser dem inte.
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
