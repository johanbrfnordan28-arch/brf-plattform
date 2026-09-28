import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Guider & tips — ${BRF_NAVET_NAMN}`,
  description:
    "Korta filmer och råd om Styrelse-Navets moduler — lär er funktionerna innan ni skapar er förening.",
};

export default function GuiderPage() {
  return (
    <ModulePage
      title="Guider & tips"
      icon="🎬"
      intro="Korta filmer per modul och praktiska råd om upphandling, rondering och kontakt med entreprenörer. Här ser ni hur verktyget är uppbyggt — själva arbetsytan öppnas efter att styrelsen skapat er förening."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Förhandsvisning — inte hela portalen
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Filmerna visar upplägg och vanliga arbetsflöden. Era egna uppgifter,
          dokument och medlemsdata finns bara i er förenings miljö efter
          inloggning.
        </p>
      </div>

      <ContentSection title="Filmer per modul" plain>
        <div className="grid gap-6 lg:grid-cols-2">
          {guideFilmer.map((film) => (
            <KortGuideFilm key={film.id} film={film} />
          ))}
        </div>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Redo att prova?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening på några minuter — då får ni tillgång till alla
          filmer och moduler i er egen miljö.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#skapa-forening" className="brf-knapp-gron px-5 py-2.5 text-sm">
            Skapa er förening
          </Link>
          <Link
            href="/prova-gratis"
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Prova i testförening
          </Link>
        </div>
      </div>
    </ModulePage>
  );
}
