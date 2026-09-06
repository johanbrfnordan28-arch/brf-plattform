import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { OffertForfraganForm } from "@/components/offert/OffertForfraganForm";
import { ABK_09_KORT, ABK_09_LANG } from "@/lib/abk-09";
import {
  OFFENTLIGA_KONTAKT_EPOSTER,
  PLATTFORM_STOD_EPOST,
  plattformStodMailto,
} from "@/lib/plattform-stod";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: "Offert — Styrelse-Navet",
  description:
    "Begär offert på teknisk förvaltning, underhållsplan, projektledning, besiktning, skadeutredning och upphandling — enligt ABK 09 utan avvikelser.",
};

export default function OffertPage() {
  return (
    <ModulePage
      title="Offert"
      icon="💬"
      intro="Begär offert på teknisk förvaltning, underhållsplan och övriga konsulttjänster. Priset beror på fastigheten och omfattningen — ni får alltid en offert."
    >
      <ContentSection title="Avtal — ABK 09">
        <p>{ABK_09_LANG}</p>
        <p className="mt-2 text-sm text-muted">{ABK_09_KORT}</p>
      </ContentSection>

      <ContentSection title="Vad ni kan begära offert på">
        <ul className="list-disc space-y-2 pl-5">
          <li>Teknisk förvaltning till fördelaktigt pris</li>
          <li>Professionell underhållsplan — ordinarie 24 000 kr, 12 000 kr vid plattformsavtal (kan köpas senare)</li>
          <li>Projektledning</li>
          <li>Skadeutredning</li>
          <li>Besiktning</li>
          <li>Upphandling</li>
        </ul>
      </ContentSection>

      <OffertForfraganForm />

      <ContentSection title="Alternativ: mejla direkt">
        <p>
          Ni kan också mejla oss direkt. Ange förening, ungefärlig storlek och
          vad ni vill ha hjälp med.
        </p>
        <ul className="mt-4 space-y-2">
          {OFFENTLIGA_KONTAKT_EPOSTER.map((k) => (
            <li key={k.epost}>
              <a
                href={plattformStodMailto(
                  "Styrelse-Navet — offertförfrågan",
                  "Hej!\n\nFörening:\nAntal lägenheter:\nVi vill ha offert på:\n\n",
                  k.epost,
                )}
                className="inline-flex rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0]"
              >
                Mejla {k.epost}
              </a>
              <span className="ml-2 text-sm text-muted">({k.etikett})</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Primär supportadress: {PLATTFORM_STOD_EPOST}
        </p>
        <div className="mt-4">
          <Link
            href={PROVA_GRATIS_PATH}
            className="inline-flex text-sm font-medium text-primary-dark underline hover:no-underline"
          >
            Prova plattformen gratis →
          </Link>
        </div>
      </ContentSection>
    </ModulePage>
  );
}
