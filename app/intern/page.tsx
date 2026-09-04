import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
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
      intro="Intern inloggning för er egen organisation. Känslig upphandlingsinformation och anbud hanteras här — inte på föreningssidan."
    >
      <ContentSection title="Upphandling via Styrelse-Navet">
        <p className="mb-4 text-sm text-muted">
          Skapa upphandling, ladda upp underlag, mejla inbjudan och ta emot anbud
          på en låst sida. Anbudsgivare ser varken inbjudna eller andras anbud.
        </p>
        <Link
          href="/intern/upphandling"
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Öppna intern upphandling
        </Link>
      </ContentSection>

      <ContentSection title="Föreningspublicerade upphandlingar (äldre flöde)">
        <p className="mb-4 text-sm text-muted">
          Upphandlingar publicerade från föreningsmodulen. Anbud här är
          demo/internt — styrelsen ser dem inte.
        </p>
        <InternUpphandlingModul />
      </ContentSection>

      <ContentSection title="Känslig upphandlingsinformation">
        <p>
          Inkomna anbud och inbjudningslistor syns endast internt. Styrelsen och
          övriga anbudsgivare får inte se råa anbud eller vilka som är inbjudna.
        </p>
      </ContentSection>
    </ModulePage>
  );
}
