import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const projektFilm = guideFilmer.find((f) => f.id === "projekt")!;

const forarbetePunkter = [
  {
    titel: "Projektbeskrivning",
    text: "Vad gäller projektet? Stambyte, fasad, tak eller annat — en kort modell som alla i styrelsen förstår.",
  },
  {
    titel: "Nuvarande status",
    text: "Hur ser läget ut idag? Skador, ålder, tidigare åtgärder och vad som redan är beslutat — enkelt och överskådligt.",
  },
  {
    titel: "Önskat slutresultat",
    text: "Hur ska det se ut när projektet är klart? Funktion, kvalitet och tidsram — så entreprenör och styrelse har samma bild.",
  },
] as const;

const hjalpMed = [
  "Strukturerad projektmapp med kontrakt, ritningar och protokoll",
  "Tidsplan och koppling till årshjulet",
  "Upphandlingsunderlag och anbudsjämförelse",
  "Garantibesiktning och påminnelser",
  "Projektledning och tyngre dokumentation vid behov",
] as const;

export const metadata: Metadata = {
  title: `Projekt — ${BRF_NAVET_NAMN}`,
  description:
    "Projektmappar för styrelsen — börja med en enkel projektbeskrivning, nuvarande status och önskat slutresultat. Stöd finns för resten.",
};

export default function ProjektPage() {
  return (
    <ModulePage
      title="Projekt"
      icon="📐"
      intro="Större åtgärder behöver inte börja i kaos. Styrelsen gör ett enkelt förarbete — vi hjälper till med struktur, dokument och uppföljning resten av vägen."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">Stöd och hjälp finns</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ni behöver inte bygga hela projektpaketet själva från dag ett. Börja med det
          styrelsen kan beskriva — projektets inriktning, nuläge och målbild. Till
          tidsplan, mappstruktur, upphandling och garantibesiktning kan ni{" "}
          <Link
            href="/#intro-film"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            ta hjälp och få prisuppgift
          </Link>
          .
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={projektFilm} />
      </div>

      <ContentSection title="Förarbete styrelsen kan göra själv">
        <p>
          En enkel projektbeskrivning räcker långt. Tre delar som de flesta styrelser
          kan fylla i utan konsult — resten kan byggas vidare tillsammans med er.
        </p>
        <ul className="mt-4 space-y-4">
          {forarbetePunkter.map((punkt, index) => (
            <li
              key={punkt.titel}
              className="flex gap-4 rounded-xl border border-border bg-background/80 p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f3ec] text-sm font-bold text-primary-dark">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground">{punkt.titel}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{punkt.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="Det vi hjälper till med">
        <p>
          När förarbetet sitter kan ni få stöd med det som tar tid och erfarenhet —
          utan att tappa kontrollen i styrelsen.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {hjalpMed.map((rad) => (
            <li key={rad}>{rad}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          I er föreningssida finns sedan hela projektmappen med checklistor, undermappar
          och garantimodul — det ni ser i filmen ovan, inte som krav från start.
        </p>
      </ContentSection>

      <ContentSection title="Varför projektmappen lönar sig">
        <ul className="space-y-3">
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">En plats per projekt</strong>{" "}
            — protokoll, avtal och ritningar samlas istället för att spridas i mejl och
            privata mappar.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Nästa styrelse hittar allt</strong>{" "}
            — mandatbyten blir enklare när historiken ligger kvar per år och projekt.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Garantin glöms inte bort</strong>{" "}
            — påminnelser innan reklamationsrätten går ut sparar föreningen stora summor.
          </li>
        </ul>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Vill ni komma igång?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening och börja med ett enkelt förarbete — eller prata med oss om
          stöd kring större projekt.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#foreningsformation" className="brf-knapp-gron px-5 py-2.5 text-sm">
            Skapa er förening
          </Link>
          <Link
            href="/#intro-film"
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Få prisuppgift
          </Link>
        </div>
      </div>
    </ModulePage>
  );
}
