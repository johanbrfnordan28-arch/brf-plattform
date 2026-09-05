import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import {
  PLATTFORM_STOD_EPOST,
  plattformStodMailto,
} from "@/lib/plattform-stod";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: "Offert — Styrelse-Navet",
  description:
    "Begär offert på teknisk förvaltning, projektledning, besiktning, skadeutredning och upphandling — fasta priser eller löpande debitering.",
};

export default function OffertPage() {
  return (
    <ModulePage
      title="Offert"
      icon="💬"
      intro="Begär offert på teknisk förvaltning och övriga tjänster. Priset beror på fastigheten och omfattningen — ni får fasta priser på offert eller kan välja löpande debitering."
    >
      <ContentSection title="Vad ni kan begära offert på">
        <ul className="list-disc space-y-2 pl-5">
          <li>Teknisk förvaltning till fördelaktigt pris</li>
          <li>Projektledning</li>
          <li>Skadeutredning</li>
          <li>Besiktning</li>
          <li>Upphandling</li>
        </ul>
        <p className="mt-4">
          Kostnaden anpassas efter er fastighet och hur mycket stöd ni behöver.
        </p>
      </ContentSection>

      <ContentSection title="Så begär ni offert">
        <p>
          Skicka ett mejl med föreningens namn, ungefärlig storlek (antal
          lägenheter) och vad ni vill ha hjälp med. Vi återkommer med förslag
          och pris.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={plattformStodMailto(
              "Styrelse-Navet — offertförfrågan",
              "Hej!\n\nFörening:\nAntal lägenheter:\nVi vill ha offert på:\n\n",
            )}
            className="brf-knapp-gron inline-flex px-5 py-2.5 text-sm"
          >
            Mejla offertförfrågan
          </a>
          <a
            href={`mailto:${PLATTFORM_STOD_EPOST}`}
            className="inline-flex rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0]"
          >
            {PLATTFORM_STOD_EPOST}
          </a>
        </div>
      </ContentSection>

      <ContentSection title="Prova plattformen först">
        <p>
          Vill ni se hur styrelsearbetet blir överskådligt i praktiken? Skapa
          en testförening gratis och utforska modulerna — offert på teknisk
          förvaltning kan ni begära när ni vill.
        </p>
        <Link
          href={PROVA_GRATIS_PATH}
          className="mt-4 inline-flex text-sm font-medium text-primary-dark underline hover:no-underline"
        >
          Prova gratis →
        </Link>
      </ContentSection>
    </ModulePage>
  );
}
