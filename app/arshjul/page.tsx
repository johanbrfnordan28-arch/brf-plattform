import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const arshjulFilm = guideFilmer.find((f) => f.id === "arshjul")!;

const fordeler = [
  {
    emoji: "📅",
    titel: "Hela styrelseåret i ett grepp",
    text: "Stämma, bokslut, OVK och möten samlade — ni ser direkt vad som väntar varje månad.",
  },
  {
    emoji: "🔔",
    titel: "Påminnelser innan det brinner",
    text: "Ställ in hur många dagar före ni vill få notis. Slipp dyra missade deadlines och stressiga paniklösningar.",
  },
  {
    emoji: "🔄",
    titel: "Återkommande utan omjobb",
    text: "Märk en händelse som årlig — den dyker upp automatiskt nästa år. Mindre admin, mer tid till det som spelar roll.",
  },
  {
    emoji: "🔗",
    titel: "Kopplat till underhållsplanen",
    text: "Besiktningar och milstolpar kan importeras från plan och projekt — samma datum, ett ställe att följa upp.",
  },
  {
    emoji: "👥",
    titel: "Överlever mandatbyten",
    text: "Nästa styrelse tar över samma tidslinje. Ingen information försvinner när ordförande byts.",
  },
  {
    emoji: "💰",
    titel: "Sparar föreningen pengar",
    text: "Missad OVK, försenad stämma eller glömd garantibesiktning kostar — årshjulet minskar risken innan det händer.",
  },
] as const;

export const metadata: Metadata = {
  title: `Årshjul & kalender — ${BRF_NAVET_NAMN}`,
  description:
    "Styrelsens årshjul med påminnelser — planera OVK, stämma och besiktningar flera år framåt utan att missa deadlines.",
};

export default function ArshjulPage() {
  return (
    <ModulePage
      title="Årshjul & kalender"
      icon="📅"
      intro="Styrelsen behöver inte hålla huvudet fullt av datum. Årshjulet samlar det viktigaste för året — med påminnelser i rätt tid och tidslinje flera år framåt."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Slipp missa det som kostar
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          OVK, årsstämma, bokslut och besiktningar har fasta tider — men i en
          förening med frivilliga styrelser glöms saker lätt bort. Med årshjulet
          planerar ni i förväg och får påminnelse innan deadline, inte efteråt.
          Verktyget finns i er föreningssida efter{" "}
          <Link
            href="/#foreningsformation"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            föreningsformation
          </Link>
          , eller prova i en{" "}
          <Link
            href="/#inloggning"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            testförening
          </Link>
          .
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={arshjulFilm} />
      </div>

      <ContentSection title="Det här får styrelsen">
        <p>
          Filmen ovan visar hur modulen är uppbyggd — här är fördelarna i korthet,
          utan att ni behöver klicka runt i verktyget.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {fordeler.map((f) => (
            <li
              key={f.titel}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <span className="text-2xl" aria-hidden>
                {f.emoji}
              </span>
              <p className="mt-2 font-semibold text-foreground">{f.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="Typiska händelser i årshjulet">
        <p>
          De flesta föreningar börjar med en grundstruktur och fyller på efter hand.
          Vanliga poster som styrelsen lägger in:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Årsstämma och kallelse</li>
          <li>Bokslut och budget inför nästa år</li>
          <li>OVK och sotning</li>
          <li>Styrelsemöten och protokoll</li>
          <li>Garantibesiktningar från pågående projekt</li>
          <li>Försäkrings- och skadedeklarationer</li>
        </ul>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Redo att testa?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening på några minuter — eller logga in i en testförening och
          öppna årshjulet direkt. Se även{" "}
          <Link href="/#intro-film" className="font-medium text-primary-dark underline hover:no-underline">
            filmerna och prisuppgift
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#foreningsformation" className="brf-knapp-gron px-5 py-2.5 text-sm">
            Skapa er förening
          </Link>
          <Link
            href="/#inloggning"
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Prova i testförening
          </Link>
        </div>
      </div>
    </ModulePage>
  );
}
