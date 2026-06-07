import type { Metadata } from "next";
import { ForeningAktiveraKlient } from "@/components/forening/ForeningAktiveraKlient";
import { genereraForeningAktiveraInlineScript } from "@/lib/forening-aktivera-inline";

export const metadata: Metadata = {
  title: "Aktiverar er förening — BRF Företag",
  robots: "noindex",
};

/** Mellanlandning efter skapande — sparar förening innan huvudsidan laddas (Safari). */
export default function ForeningAktiveraPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: genereraForeningAktiveraInlineScript() }}
      />
      <ForeningAktiveraKlient />
    </>
  );
}
