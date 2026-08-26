import Link from "next/link";
import { FilmDemo } from "@/components/FilmDemo";
import { ModuleCard } from "@/components/ModuleCard";
import { ForeningHeroEtikett } from "@/components/forening/ForeningHeroEtikett";
import { ForeningValkommenRand } from "@/components/forening/ForeningValkommenRand";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type BrfForetagHomeProps = {
  mode: "public" | "forening";
};

type ModulDef = {
  title: string;
  description: string;
  path: string;
  icon: string;
};

/** Samma 12 moduler på Styrelse-Navet och i föreningen (4×3). */
const foreningModules: ModulDef[] = [
  {
    title: "Årshjul & kalender",
    description:
      "Styrelsens årshjul med påminnelser — årliga uppgifter och besiktningar flera år framåt.",
    path: "/arshjul",
    icon: "📅",
  },
  {
    title: "Föreningsinformation",
    description:
      "Stadgar, ekonomisk plan, besiktningsprotokoll och övriga dokument i mappar.",
    path: "/foreningsinformation",
    icon: "📁",
  },
  {
    title: "Medlemmar",
    description:
      "Renoveringsanmälan, utskick och lägenhetsarkiv med mappar per lägenhet.",
    path: "/medlemmar",
    icon: "👥",
  },
  {
    title: "Underhållsplan",
    description:
      "Bygg upp föreningens komponentregister, renoveringshistorik och framtida underhåll i portalen.",
    path: "/underhallsplan",
    icon: "🔧",
  },
  {
    title: "Energi & drift",
    description:
      "Värme och belysning — energiåtgärder kopplade till teknisk livslängd i underhållsplanen.",
    path: "/energi",
    icon: "⚡",
  },
  {
    title: "Rondering & avvikelser",
    description:
      "Tydliga checklistor, signering och avvikelserapportering för städning och fastighetsskötsel.",
    path: "/rondering",
    icon: "✅",
  },
  {
    title: "Upphandling",
    description:
      "Aktuella uppdrag via Styrelse-Navet — underlag till inbjudna entreprenörer, anbud till oss.",
    path: "/upphandling",
    icon: "📋",
  },
  {
    title: "Projekt",
    description:
      "Projektmappar per år — skapa nytt projekt eller arkivera äldre med dokument.",
    path: "/projekt",
    icon: "📐",
  },
  {
    title: "Entreprenörer",
    description:
      "Egna kontakter och rekommenderade entreprenörer — sök, lägg till och ta bort.",
    path: "/entreprenorer",
    icon: "🏗️",
  },
  {
    title: "Föreningsuppgifter",
    description:
      "Grunduppgifter om föreningen — adress, styrelse och övriga fakta samlade på ett ställe.",
    path: "/uppgifter",
    icon: "🏢",
  },
  {
    title: "Juridik",
    description: "Vägledning och mallar för styrelseärenden och avtal.",
    path: "/juridik",
    icon: "⚖️",
  },
  {
    title: "Guider & tips",
    description:
      "Korta AI-filmer om funktionerna samt råd om upphandling och entreprenörer.",
    path: "/guider",
    icon: "🎬",
  },
];

const featuredPublic = [
  {
    title: "Underhållsplan",
    description:
      "Bygg komponentregister, renoveringshistorik, besiktningar och budget i samma plan — från stambyte till fasad. Styrelsen får beslutsstöd som håller över tid, inte bara ett kalkylark.",
    anchor: "#moduler",
    icon: "🔧",
    bullets: [
      "50-årsplan med avsättning och besiktningar i rätt år",
      "Komponenter, bildstöd och kostnadsuppskattning",
      "Underlag inför stämma och långsiktiga investeringar",
    ],
  },
  {
    title: "Upphandling",
    description:
      "Föreningen publicerar via oss. Vi bjuder in entreprenörer till underlaget och tar emot anbud — utan att anbuden syns på föreningssidan.",
    anchor: "#upphandlingar",
    icon: "📋",
    bullets: [
      "Entreprenad, konsulter och fastighetsförvaltning",
      "Ni skickar underlag — vi hanterar publicering",
      "Anbud kommer till oss och hanteras manuellt",
    ],
  },
] as const;

export function BrfForetagHome({ mode }: BrfForetagHomeProps) {
  const base = mode === "forening" ? "/forening" : "";
  const isForening = mode === "forening";

  const modules = foreningModules.map((mod) => ({
    title: mod.title,
    description: mod.description,
    icon: mod.icon,
    ...(isForening ? { href: `${base}${mod.path}` } : {}),
  }));

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          {isForening ? (
            <ForeningHeroEtikett />
          ) : (
            <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary-dark">
              Styrelse-Navet · För styrelser som vill ha kontroll
            </p>
          )}
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {isForening
              ? STYRELSEFLOW_NAMN
              : "Underhållsplan och upphandling — utan kaos i mejl och mappar"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {isForening
              ? "Upphandling, underhållsplan, guider och dokumentation samlat för er förening. Enkelt, strukturerat och spårbart."
              : "Styrelse-Navet samlar det styrelsen behöver för långsiktigt underhåll och tydliga upphandlingar — från mindre jobb till större entreprenader. Mindre tid på administration, mer tid på beslut som håller."}
          </p>

          {isForening && <ForeningValkommenRand />}

          {!isForening && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Testa gratis i 30 dagar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Spara upp till 60&nbsp;% på tvåårsavtal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Ingen bindning under provperioden
              </li>
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {isForening ? (
              <>
                <Link
                  href={`${base}/arshjul`}
                  className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Årshjul & kalender
                </Link>
                <Link
                  href="#intro-film"
                  className="rounded-lg border border-primary bg-[#eef6f0] px-5 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-[#e2f0e6]"
                >
                  Se kort film (30 sek)
                </Link>
                <Link
                  href="#moduler"
                  className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Alla moduler
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={PROVA_GRATIS_PATH}
                  className="brf-knapp-gron px-5 py-3 text-sm"
                >
                  Vi vill pröva gratis i 30 dagar
                </Link>
                <Link
                  href="/styrelse-login"
                  className="rounded-lg border border-primary bg-[#eef6f0] px-5 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-[#e2f0e6]"
                >
                  Logga in styrelse
                </Link>
                <Link
                  href="#intro-film"
                  className="rounded-lg border border-primary bg-[#eef6f0] px-5 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-[#e2f0e6]"
                >
                  Se filmerna — få prisuppgift
                </Link>
                <Link
                  href="#moduler"
                  className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Se modulerna
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {!isForening && (
        <section
          id="skapa-forening"
          className="scroll-mt-24 border-b border-border bg-surface/80"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="mb-4 max-w-2xl text-sm text-muted">
              Skapa flera föreningar och växla mellan dem på föreningssidorna. Gemensamma
              plattformsuppdateringar slås ihop överallt — era ifyllda uppgifter behålls.
            </p>
            <SkapaForeningPanel kompakt visaSnabbstart />
          </div>
        </section>
      )}

      {!isForening && (
        <section className="border-b border-border bg-[#eef6f0]/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-center text-sm sm:px-6">
            <p>
              <span className="font-semibold text-primary-dark">30 dagar gratis</span>
              <span className="text-muted"> — testa hela plattformen</span>
            </p>
            <p>
              <span className="font-semibold text-primary-dark">−30&nbsp;%</span>
              <span className="text-muted"> på ettårsavtal vs månadsdebitering</span>
            </p>
            <p>
              <span className="font-semibold text-primary-dark">−60&nbsp;%</span>
              <span className="text-muted"> på tvåårsavtal vs månadsdebitering</span>
            </p>
          </div>
        </section>
      )}

      <div id="intro-film">
        <FilmDemo variant={isForening ? "forening" : "public"} />
      </div>

      {isForening && (
        <section className="border-b border-border bg-[#eef6f0]/50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">Snabbvägar</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Vanliga verktyg för styrelsen
              </h2>
              <p className="mt-2 text-muted">
                Årshjulet samlar påminnelser och långsiktiga datum — t.ex. OVK och
                stämma — så inget glöms bort.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Årshjul & kalender",
                  href: `${base}/arshjul`,
                  icon: "📅",
                  text: "Påminnelser och tidslinje flera år framåt",
                  accent: true,
                },
                {
                  title: "Underhållsplan",
                  href: `${base}/underhallsplan`,
                  icon: "🔧",
                  text: "Komponenter, besiktningar och budget",
                },
                {
                  title: "Upphandling",
                  href: `${base}/upphandling`,
                  icon: "📋",
                  text: "Mallar och publicering via oss",
                },
                {
                  title: "Projekt",
                  href: `${base}/projekt`,
                  icon: "📐",
                  text: "Projektmappar och checklistor",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                    item.accent
                      ? "border-primary bg-white hover:border-primary-dark"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary-dark">
                    {item.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{item.text}</p>
                  <span className="mt-3 text-sm font-medium text-primary-dark">
                    Öppna →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isForening && (
        <section
          id="fokus"
          className="border-b border-border bg-surface/40"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">
                Det styrelsen oftast behöver först
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Underhållsplan och upphandling i samma portal
              </h2>
              <p className="mt-2 text-muted">
                De här två delarna sparar mest tid och ger tydligast värde — resten
                av modulerna bygger vidare på samma struktur. Funktionerna prövas
                efter inloggning eller gratisperiod.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredPublic.map((mod) => (
                <div
                  key={mod.title}
                  className="flex flex-col rounded-2xl border-2 border-primary/20 bg-surface p-6 shadow-sm sm:p-8"
                >
                  <span
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f3ec] text-2xl"
                    aria-hidden
                  >
                    {mod.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground">
                    {mod.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {mod.description}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {mod.bullets.map((punkt) => (
                      <li
                        key={punkt}
                        className="flex gap-2 text-sm text-foreground/90"
                      >
                        <span className="text-primary" aria-hidden>
                          •
                        </span>
                        {punkt}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={mod.anchor}
                    className="mt-5 text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    {mod.title === "Upphandling"
                      ? "Se hur upphandling via oss fungerar →"
                      : "Se modulerna →"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="moduler" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Moduler
          </h2>
          <p className="mt-2 text-muted">
            {isForening
              ? "Välj en modul för att arbeta i er förenings miljö."
              : "Samma tolv moduler som i föreningsplattformen — här beskrivs vad de gör. Funktionen prövas efter inloggning eller gratisperiod."}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.title} {...mod} />
          ))}
        </div>
      </section>

      {!isForening ? (
        <section
          id="upphandlingar"
          className="border-y border-border bg-surface/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Upphandling via Styrelse-Navet
              </h2>
              <p className="mt-2 text-muted">
                En egen yta för aktuella upphandlingar — skiljd från övriga
                styrelsemoduler. Publikt syns bara en kort sammanfattning.
                Underlag och anbud är låsta till inbjudna entreprenörer; anbudsgivare
                ser inte varandra.
              </p>
            </div>

            <ol className="mb-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  steg: "1",
                  titel: "Vi publicerar underlag",
                  text: "Förfrågningsunderlaget läggs ut. Publikt syns bara vad som upphandlas — utan kontakter.",
                },
                {
                  steg: "2",
                  titel: "Inbjudan via mejl",
                  text: "Godkända entreprenörer får unik länk till underlaget. Oinbjudna ser endast teaser.",
                },
                {
                  steg: "3",
                  titel: "Anbud till oss",
                  text: "Anbud fylls i och kommer till Styrelse-Navet — inte till föreningssidan. Anbudsgivare ser inte varandra.",
                },
              ].map((item) => (
                <li
                  key={item.steg}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    Steg {item.steg}
                  </p>
                  <h3 className="mt-2 font-semibold text-foreground">{item.titel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ol>

            <div className="rounded-2xl border border-primary/25 bg-[#eef6f0]/80 px-6 py-8 sm:px-8">
              <h3 className="text-lg font-semibold text-foreground">
                Se vad som är ute just nu
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Öppna sidan med enbart aktuella upphandlingar — utan övriga
                styrelsemoduler.
              </p>
              <Link
                href="/upphandling"
                className="brf-knapp-gron mt-5 px-6 py-3 text-sm sm:text-base"
              >
                Aktuella upphandlingar
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section
          id="upphandlingar"
          className="border-y border-border bg-surface/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Upphandlingar
              </h2>
              <p className="mt-2 text-muted">
                Förbered underlag i modulen. Publicering och anbudshantering sker via
                Styrelse-Navet — inkomna anbud syns inte här och anbudsgivare ser
                inte varandra.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
              <h3 className="font-semibold text-primary-dark">Öppna upphandlingsmodulen</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Skapa beskrivning och underlag. När ni är redo publicerar ni via oss —
                entreprenörer bjuds in och anbud hanteras manuellt utanför föreningsvyn.
              </p>
              <Link
                href={`${base}/upphandling`}
                className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Gå till upphandling
              </Link>
            </div>
          </div>
        </section>
      )}

      {!isForening ? (
        <section id="priser" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold text-primary-dark">Pris & avtal</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Börja gratis — välj avtal när ni är redo
            </h2>
            <p className="mt-2 text-muted">
              Se filmerna ovan för att förstå funktionerna och få prisuppgift anpassad
              efter er förening. Längre avtal ger tydlig besparing jämfört med
              månadsdebitering.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border-2 border-primary bg-[#eef6f0] p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Rekommenderas att börja här
              </p>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Prova gratis 30 dagar
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Testa underhållsplan, upphandling och övriga moduler utan kostnad.
                Ingen kortuppgift krävs i demo — ni ser hur plattformen passar er
                förening.
              </p>
              <Link
                href={PROVA_GRATIS_PATH}
                className="brf-knapp-gron mt-6 px-5 py-2.5 text-sm"
              >
                Vi vill pröva gratis i 30 dagar
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Ettårsavtal
              </p>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Spara 30&nbsp;%
              </h3>
              <p className="mt-1 text-sm text-primary-dark">
                mot månadsdebitering
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Fakturering kvartalsvis</li>
                <li>Automatisk förlängning</li>
                <li>Uppsägningstid 6 månader</li>
              </ul>
              <Link
                href="#intro-film"
                className="mt-6 inline-flex text-sm font-medium text-primary hover:text-primary-dark"
              >
                Se filmerna för pris →
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Tvåårsavtal
              </p>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Spara upp till 60&nbsp;%
              </h3>
              <p className="mt-1 text-sm text-primary-dark">
                mot månadsdebitering
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Bäst för föreningar som planerar långsiktigt</li>
                <li>Passar när underhållsplan ska leva över mandatperioder</li>
                <li>Samma moduler och support som övriga avtal</li>
              </ul>
              <Link
                href="#intro-film"
                className="mt-6 inline-flex text-sm font-medium text-primary hover:text-primary-dark"
              >
                Se filmerna för pris →
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-primary-dark">Er förening</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                Rondering som styrelsen kan följa upp
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Schema, checklistor och signering samlat så att utebliven rondering
                eller städning blir svårare att missa.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[#e8f3ec] p-6 sm:p-8">
              <p className="text-sm font-semibold text-primary-dark">Pris & avtal</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                Tydlig avtalsmodell
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Avtalstid: 1 år</li>
                <li>Automatisk förlängning</li>
                <li>Fakturering kvartalsvis</li>
                <li>Uppsägningstid: 6 månader</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
