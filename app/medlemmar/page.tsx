import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/ContentSection";
import { ModulePage } from "@/components/ModulePage";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer } from "@/components/guider/guider";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const lagenhetskortFilm = guideFilmer.find((f) => f.id === "lagenhetskort")!;

const funktioner = [
  {
    emoji: "🏠",
    titel: "Ett kort per lägenhet",
    text: "Grunduppgifter, renoveringar och dokument samlade — styrelsen ser läget direkt utan att leta i mejl.",
  },
  {
    emoji: "✅",
    titel: "Enkelt för styrelsen",
    text: "Välj typ av åtgärd — checklista med krav byggs automatiskt. Samma struktur varje gång, mindre administration.",
  },
  {
    emoji: "📜",
    titel: "Renoveringshistorik",
    text: "Vad som gjorts i lägenheten över tid — datum, status och underlag sparat för nästa styrelse och vid frågor.",
  },
  {
    emoji: "🔍",
    titel: "Spårbarhet",
    text: "Vem godkände vad, när medlemmen signerade och vilka krav som gällde — inget bygger på muntliga löften.",
  },
  {
    emoji: "🤝",
    titel: "Överenskommelse med medlem",
    text: "Styrelsen sammanställer krav och villkor — medlemmen får tydlig information innan renoveringen startar.",
  },
  {
    emoji: "🔐",
    titel: "Signering med BankID",
    text: "Medlemmen godkänner och signerar överenskommelsen digitalt — tryggt för både styrelse och granne.",
  },
] as const;

export const metadata: Metadata = {
  title: `Lägenhetskort & renovering — ${BRF_NAVET_NAMN}`,
  description:
    "Lägenhetskort med renoveringshistorik, enkla rutiner för styrelsen och signering av överenskommelser med medlemmar.",
};

export default function MedlemmarPage() {
  return (
    <ModulePage
      title="Lägenhetskort & renovering"
      icon="🏠"
      intro="Varje lägenhet får ett eget kort — renoveringshistorik, tydliga krav och signering av överenskommelser med medlemmen. Enkelt för styrelsen, spårbart för alla."
    >
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary-dark">
          Inte bara historik — ett komplett lägenhetskort
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Modulen handlar om mer än att spara gamla kvitton. Styrelsen arbetar med{" "}
          <strong className="font-medium text-foreground">lägenhetskort</strong> där
          renoveringar, krav och överenskommelser hänger ihop. Medlemmen signerar det ni
          kommit överens om — innan borr eller pensel tas fram.
        </p>
      </div>

      <div className="max-w-2xl">
        <KortGuideFilm film={lagenhetskortFilm} />
      </div>

      <ContentSection title="Så fungerar det">
        <p>
          Filmen visar upplägget i föreningssidan — här är fördelarna i korthet: enkelhet
          för styrelsen och spårbarhet hela vägen.
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

      <ContentSection title="Från anmälan till signering">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="font-medium text-foreground">Medlemmen anmäler</strong>{" "}
            — typ av renovering, t.ex. badrum, kök eller målning.
          </li>
          <li>
            <strong className="font-medium text-foreground">Styrelsen väljer krav</strong>{" "}
            — checklista med grundkrav och tillägg skapas automatiskt per åtgärdstyp.
          </li>
          <li>
            <strong className="font-medium text-foreground">Medlemmen fyller i</strong>{" "}
            — försäkring, entreprenör och underlag enligt samma mall varje gång.
          </li>
          <li>
            <strong className="font-medium text-foreground">Överenskommelse signeras</strong>{" "}
            — medlemmen godkänner och signerar med BankID innan arbetet startar.
          </li>
          <li>
            <strong className="font-medium text-foreground">Historik sparas</strong> — på
            lägenhetskortet för framtida styrelser och vid frågor från grannar eller
            försäkringsbolag.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Varför spårbarhet spelar roll">
        <ul className="space-y-3">
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Styrelsen slipper gissa</strong>{" "}
            — vad som redan godkänts i lägenheten framgår av kortet, inte av vem som
            minns bäst.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Medlemmen vet vad som gäller</strong>{" "}
            — skriftlig överenskommelse och signering minskar missförstånd om ventiler,
            byggdamm och grannpåverkan.
          </li>
          <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">Nästa styrelse är förberedd</strong>{" "}
            — renoveringshistorik följer lägenheten, inte enskilda styrelseledamöters
            mejlarkiv.
          </li>
        </ul>
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
        <h3 className="font-semibold text-primary-dark">Vill ni se lägenhetskorten?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Skapa er förening eller prova i en testförening — där finns lägenhetsarkiv,
          renoveringsmappar och signering i praktiken.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#foreningsformation" className="brf-knapp-gron px-5 py-2.5 text-sm">
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
