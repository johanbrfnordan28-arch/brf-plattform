import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const energiFilm = guideFilmer.find((f) => f.id === "energi")!;

const fokusomraden = [
  {
    emoji: "🌡️",
    titel: "Värmesystem",
    text: "Injustering, styrning och skötsel av undercentralen — lägre förbrukning utan att byta hela installationen.",
  },
  {
    emoji: "💡",
    titel: "Belysning",
    text: "LED, tider och rörelsevakter i trapphus och gemensamma ytor — elräkningen sjunker märkbart.",
  },
  {
    emoji: "📊",
    titel: "Payback time",
    text: "Hur lång tid tar det innan investeringen betalar sig? Central fråga för varje energiåtgärd styrelsen överväger.",
  },
  {
    emoji: "📉",
    titel: "Före och efter",
    text: "Jämför driftkostnad, el och värme innan och efter — annars vet ni inte om åtgärden faktiskt lönade sig.",
  },
  {
    emoji: "🔗",
    titel: "Koppling till underhållsplan",
    text: "Stora byten följer teknisk livslängd i planen — energiåtgärder kan ge effekt redan i år.",
  },
  {
    emoji: "🔄",
    titel: "Utveckling pågår",
    text: "Tips och råd fylls på löpande — energi och drift är ett ständigt pågående arbete, inte en engångslista.",
  },
] as const;

export const metadata: Metadata = {
  title: `Energi & drift — ${BRF_NAVET_NAMN}`,
  description:
    "Energi och drift med fokus på payback time — jämför kostnader före och efter. Tips och råd utvecklas löpande.",
};

export default function EnergiPage() {
  return (
    <ModulePage
      title="Energi & drift"
      icon="⚡"
      intro="Driftkostnaden påverkar årsavgiften varje månad. Energi och drift är ständigt pågående arbete — här samlas tips, jämförelser och payback time så styrelsen kan prioritera rätt åtgärder."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Payback time — det centrala begreppet
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <strong className="font-medium text-foreground">Payback time</strong> är tiden
          det tar innan en investering betalar sig genom lägre driftkostnader. För att räkna
          den behöver ni tydliga siffror <em>före</em> och <em>efter</em> — värme, el och
          andra driftskostnader. Det är grunden för att styrelsen ska våga investera och
          kunna förklara beslutet för medlemmarna.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Tips och råd i modulen utvecklas löpande — energifrågor förändras, och vi fyller
          på med vägledning tillsammans med föreningar.
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={energiFilm} />
      </div>

      <ContentSection title="Det här handlar modulen om">
        <p>
          Sidan fokuserar på nytta och beslutsunderlag — inte tekniska detaljer. I er
          föreningssida finns verktygen för att dokumentera åtgärder och följa upp över tid.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {fokusomraden.map((f) => (
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

      <ContentSection title="Så tänker ni kring payback">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="font-medium text-foreground">Baslinje före</strong> — samla
            värme, el och andra driftskostnader under minst ett till två år så ni ser
            normalnivån.
          </li>
          <li>
            <strong className="font-medium text-foreground">Investering och åtgärd</strong>{" "}
            — vad kostar LED, injustering, fönsterbyte eller värmepump — inklusive
            eventuella tilläggsarbeten?
          </li>
          <li>
            <strong className="font-medium text-foreground">Kostnad efter</strong> — uppskatta
            eller mät lägre drift efter åtgärden.
          </li>
          <li>
            <strong className="font-medium text-foreground">Payback time</strong> — när har
            besparingen täckt investeringen? Därefter kan resterande avskrivningstid bli
            kassa-plus till nästa projekt.
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted">
          Behöver ni stöd med kalkylen kan ni{" "}
          <Link
            href="/#intro-film"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            höra av er och få prisuppgift
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection title="Ständigt pågående — tips och utveckling">
        <p>
          Energi och drift stannar inte. Nya regler, högre elpriser och bättre teknik gör att
          styrelsen behöver uppdatera sina prioriteringar. Modulen fylls på med tips om värme
          och belysning, och kopplingar till underhållsplan och rondering växer fram — ni får
          tillgång till det som byggs i takt med att fler föreningar använder plattformen.
        </p>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Vill ni börja följa er drift?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening och öppna energimodulen — eller prova i en testförening och se
          tips, film och payback-tänk i praktiken.
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
