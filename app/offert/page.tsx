import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { KontaktEpostLista } from "@/components/KontaktEpostLista";
import { ModulePage } from "@/components/ModulePage";
import { OffertForfraganForm } from "@/components/offert/OffertForfraganForm";
import { ABK_09_KORT, ABK_09_LANG } from "@/lib/abk-09";
import {
  OFFERT_EPOST,
  offertMailto,
} from "@/lib/offert-mejl";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import {
  formatKampanjDatum,
  UNDERHALLSPLAN_FRAN_PRIS_KR,
  UNDERHALLSPLAN_KAMPANJ_GALLER_TOM,
  UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT,
  underhallsplanKampanjPrisFran,
} from "@/lib/underhallsplan-kampanj";
import { formatKr } from "@/lib/prislista";

export const metadata: Metadata = {
  title: "Offert — Styrelse-Navet",
  description:
    "Begär offert på teknisk förvaltning, projektledning, besiktning, skadeutredning och upphandling — enligt ABK 09 utan avvikelser.",
};

export default function OffertPage() {
  return (
    <ModulePage
      title="Offert"
      icon="💬"
      intro="Begär offert på underhållsplan, teknisk förvaltning och övriga konsulttjänster. Priset beror på fastigheten och omfattningen — fasta priser eller löpande debitering. Förfrågan mejlas till teamet via formuläret."
    >
      <ContentSection title="Avtal — ABK 09">
        <p>{ABK_09_LANG}</p>
        <p className="mt-2 text-sm text-muted">{ABK_09_KORT}</p>
      </ContentSection>

      <ContentSection title="Vad ni kan begära offert på">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Underhållsplan — ordinarie från {formatKr(UNDERHALLSPLAN_FRAN_PRIS_KR)}{" "}
            exkl. moms (kampanj {UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT}&nbsp;%
            t.o.m. {formatKampanjDatum(UNDERHALLSPLAN_KAMPANJ_GALLER_TOM)} — från{" "}
            {formatKr(underhallsplanKampanjPrisFran())})
          </li>
          <li>Teknisk förvaltning till fördelaktigt pris</li>
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
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={offertMailto(
              "Styrelse-Navet — offertförfrågan",
              "Hej!\n\nFörening:\nAntal lägenheter:\nVi vill ha offert på:\n\n",
            )}
            className="inline-flex rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0]"
          >
            Mejla {OFFERT_EPOST}
          </a>
          <Link
            href={PROVA_GRATIS_PATH}
            className="inline-flex text-sm font-medium text-primary-dark underline hover:no-underline"
          >
            Prova plattformen gratis →
          </Link>
        </div>
      </ContentSection>

      <ContentSection title="Kontakt">
        <p className="text-sm text-muted">
          Hör av er — vi svarar och guidar er vid frågor om plattformen,
          support eller offert.
        </p>
        <KontaktEpostLista className="mt-3" />
      </ContentSection>
    </ModulePage>
  );
}
