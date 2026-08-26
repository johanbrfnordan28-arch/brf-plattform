import type { Metadata } from "next";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { NavetUpphandlingLista } from "@/components/upphandling/NavetUpphandlingLista";

export const metadata: Metadata = {
  title: "Upphandling — Styrelse-Navet",
  description:
    "Aktuella upphandlingar via Styrelse-Navet. Begränsad info publikt — underlag och anbud endast för inbjudna entreprenörer.",
};

export default function UpphandlingPage() {
  return (
    <ModulePage
      title="Upphandling via Styrelse-Navet"
      icon="📋"
      intro="Här syns aktuella upphandlingar med begränsad information. Förfrågningsunderlag och anbud är låsta till inbjudna entreprenörer — anbudsgivare ser inte varandra."
    >
      <ContentSection title="Aktuella upphandlingar">
        <NavetUpphandlingLista />
      </ContentSection>

      <ContentSection title="Så fungerar det">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            Styrelse-Navet namnger upphandlingen och laddar upp förfrågningsunderlag
            på en intern, låst sida.
          </li>
          <li>
            Vi mejlar inbjudan till tänkbara entreprenörer med unik länk till
            underlaget. Oinbjudna ser endast den publika teasern.
          </li>
          <li>
            Inbjudna lämnar anbud till oss. Varken föreningen eller andra
            anbudsgivare ser inbjudna eller inlämnade anbud.
          </li>
        </ol>
      </ContentSection>
    </ModulePage>
  );
}
