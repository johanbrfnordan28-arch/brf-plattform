import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const ronderingFilm = guideFilmer.find((f) => f.id === "rondering")!;

const funktioner = [
  {
    emoji: "📋",
    titel: "Checklistor som alla förstår",
    text: "Utvändig och invändig rondering, städning i trapphus, tvättstuga och soprum — inget moment lämnas otydligt.",
  },
  {
    emoji: "✍️",
    titel: "Månadssignering",
    text: "Entreprenören signerar när arbetet är utfört. Bara det höjer kvaliteten — det går inte att säga \"det skötte sig\" utan att stå för det.",
  },
  {
    emoji: "🔍",
    titel: "Spårbarhet",
    text: "Vem signerade, när och vilka moment som gällde — historik styrelsen kan lita på vid uppföljning, stämma eller tvist.",
  },
  {
    emoji: "⚠️",
    titel: "Avvikelser med uppföljning",
    text: "Avvikelser rapporteras med plats och allvarlighetsgrad och följs upp tills de är åtgärdade — inget faller mellan stolarna.",
  },
  {
    emoji: "📅",
    titel: "Schema per roll",
    text: "Fastighetsskötsel och städ har egna scheman — styrelsen ser om någon månad uteblir innan problem växer.",
  },
  {
    emoji: "🔗",
    titel: "Koppling till upphandling",
    text: "Samma schema kan bifogas i upphandlingsunderlag — entreprenören vet vad som förväntas redan vid anbud.",
  },
] as const;

export const metadata: Metadata = {
  title: `Rondering & avvikelser — ${BRF_NAVET_NAMN}`,
  description:
    "Digital rondering och städ med signering och spårbarhet — höjer kvaliteten och gör uppföljning enkel för styrelsen.",
};

export default function RonderingPage() {
  return (
    <ModulePage
      title="Rondering & avvikelser"
      icon="✅"
      intro="När rondering och städ bara är ett muntligt löfte blir det lätt att något missas. Med tydliga checklistor, signering och spårbar historik höjer ni nivån — och styrelsen ser direkt om något behöver åtgärdas."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Signering höjer kvaliteten
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Det räcker att entreprenören signerar varje månad — då skärps leveransen.
          Kombinerat med spårbar historik slipper styrelsen gissa om städningen eller
          ronderingen verkligen gjorts. Verktyget finns i er föreningssida efter{" "}
          <Link
            href="/#foreningsformation"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            föreningsformation
          </Link>
          .
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={ronderingFilm} />
      </div>

      <ContentSection title="Funktioner som gör skillnad">
        <p>
          Filmen visar hur modulen hänger ihop — här är vad som spelar roll för er
          förening, särskilt spårbarhet och signering.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {funktioner.map((f) => (
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

      <ContentSection title="Varför spårbarhet är viktigt">
        <ul className="space-y-3">
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Styrelsen kan följa upp</strong>{" "}
            — utan att ringa runt eller gräva i mejl. Signeringar och avvikelser ligger
            samlade per månad.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Entreprenören tar ansvar</strong>{" "}
            — digital signering gör att utfört arbete dokumenteras, inte bara påstås.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Medlemmarna märker skillnad</strong>{" "}
            — när städ och skötsel följs upp konsekvent minskar klagomål och
            förtroendekriser.
          </li>
        </ul>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Vill ni testa modulen?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening eller logga in i en testförening och öppna rondering med
          checklistor och signering — se hur det känns i praktiken.
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
