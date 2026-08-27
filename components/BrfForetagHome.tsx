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
      "En levande 50-årsplan med komponenter, historik och avsättning — så styrelsen alltid har aktuellt beslutsunderlag inför stämma, bank och långsiktiga investeringar.",
    anchor: "#moduler",
    icon: "🔧",
    bullets: [
      "Avsättning och åtgärder i rätt år — inte gissningar i Excel",
      "Komponentregister med teknisk livslängd och kostnad",
      "Underlag som håller över mandatperioder",
    ],
  },
  {
    title: "Upphandling",
    description:
      "Strukturerad upphandling utan mejlkaos. Vi publicerar underlag, bjuder in entreprenörer och tar emot anbud — säkert och spårbart, utan att anbud syns på föreningssidan.",
    anchor: "#upphandlingar",
    icon: "📋",
    bullets: [
      "Från mindre servicejobb till större entreprenader",
      "Inbjudan till underlag via oss",
      "Anbud hanteras konfidentiellt av Styrelse-Navet",
    ],
  },
] as const;

const erfarenhetOmraden = [
  {
    titel: "Teknisk förvaltning",
    text: "Drift, underhåll och tekniska beslut som håller över tid.",
  },
  {
    titel: "Upphandling",
    text: "Förfrågningsunderlag, anbud och avtal utan onödiga risker.",
  },
  {
    titel: "Projektledning",
    text: "Från planering till genomförande — tydlig styrning i varje steg.",
  },
  {
    titel: "Skadeutredning",
    text: "Analys, dokumentation och rätt åtgärder när skadan är framme.",
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
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          {isForening ? (
            <ForeningHeroEtikett />
          ) : (
            <p className="text-sm font-semibold tracking-wide text-primary-dark">
              Styrelse-Navet
            </p>
          )}
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:mt-5 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {isForening
              ? STYRELSEFLOW_NAMN
              : "Alla hjälpmedel styrelsen behöver — samlade på ett ställe"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {isForening
              ? "Upphandling, underhållsplan, guider och dokumentation samlat för er förening. Enkelt, strukturerat och spårbart."
              : "Styrelse-Navet förenklar styrelsearbetet med stöd, hjälpmedel, spårbarhet och råd — framtaget utifrån verkliga behov i bostadsrättsföreningar."}
          </p>

          {isForening && <ForeningValkommenRand />}

          {!isForening && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                30 dagar gratis — ingen bindning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Underhåll, upphandling och dokument i samma portal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Framtaget ur verklig förvaltningsvardag
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
                  className="brf-knapp-gron px-7 py-3.5 text-base"
                >
                  Börja gratis i 30 dagar
                </Link>
                <Link
                  href="/upphandling"
                  className="rounded-lg border-2 border-primary bg-white px-7 py-3.5 text-base font-semibold text-primary-dark transition-colors hover:bg-[#eef6f0]"
                >
                  Aktuella upphandlingar
                </Link>
                <Link
                  href="#erfarenhet"
                  className="rounded-lg border border-border bg-surface px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Vår erfarenhet
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {!isForening && (
        <section
          id="plattformen"
          className="scroll-mt-24 border-b border-border bg-surface/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-primary-dark">
                För styrelser i bostadsrättsföreningar
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Hjälpmedel som följer styrelsearbetet — och fastigheten
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                På plattformen finns alla hjälpmedel som behövs för att förenkla
                styrelsearbetet. Modulernas funktioner är framtagna och utvecklade
                utifrån kända behov hos styrelser i bostadsrättsföreningar.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                Hur en styrelse arbetar har förändrats de senaste åren. Även
                fastighetens behov förändras över tid. Styrelse-Navet erbjuder
                stöd, hjälpmedel, spårbarhet och råd — så att ni har struktur när
                förutsättningarna skiftar.
              </p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titel: "Stöd",
                  text: "Vägledning i vardagen — från årshjul till beslut inför stämma.",
                },
                {
                  titel: "Hjälpmedel",
                  text: "Moduler för underhåll, upphandling, dokument och mer — i samma miljö.",
                },
                {
                  titel: "Spårbarhet",
                  text: "Beslut, underlag och historik som följer med över mandatperioder.",
                },
                {
                  titel: "Råd",
                  text: "Guider och tips grundade i hur styrelser faktiskt arbetar.",
                },
              ].map((punkt) => (
                <li
                  key={punkt.titel}
                  className="border-l-2 border-primary/50 pl-4"
                >
                  <h3 className="font-semibold text-foreground">{punkt.titel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {punkt.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!isForening && (
        <section
          id="erfarenhet"
          className="scroll-mt-24 border-b border-border bg-[#eef6f0]/70"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">
                Bakom plattformen
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Över 25 års erfarenhet — inbyggd i varje modul
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Styrelse-Navet är inte en generisk IT-lösning. Funktionen och
                upplägget är framtaget av personer som arbetat nära styrelser,
                förvaltare och entreprenörer i mer än ett kvartsekel.
              </p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {erfarenhetOmraden.map((omrade) => (
                <li key={omrade.titel} className="border-l-2 border-primary/50 pl-4">
                  <h3 className="font-semibold text-foreground">{omrade.titel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {omrade.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!isForening && (
        <section className="border-b border-border bg-surface">
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
                Där styrelsen sparar mest tid
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Två hörnstenar — samma portal
              </h2>
              <p className="mt-2 text-muted">
                Underhållsplan och upphandling är det de flesta styrelser behöver
                först. Resten av modulerna bygger vidare på samma struktur när ni
                är igång.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredPublic.map((mod) => (
                <div
                  key={mod.title}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
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
                      ? "Läs mer om upphandling →"
                      : "Se alla moduler →"}
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
              : "Tolv verktyg i samma miljö — från årshjul och underhåll till rondering, dokument och juridik. Allt hänger ihop när grunden är på plats."}
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
                En egen yta för aktuella projekt — skiljd från övriga
                styrelsemoduler. Entreprenörer ser projektinformation och kan
                anmäla intresse. Underlag och anbud hanteras av oss, konfidentiellt.
              </p>
            </div>

            <ol className="mb-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  steg: "1",
                  titel: "Projektet syns publikt",
                  text: "Kort information om vad som upphandlas — utan kontaktuppgifter eller underlag.",
                },
                {
                  steg: "2",
                  titel: "Intresse och inbjudan",
                  text: "Entreprenörer anmäler intresse. Vi bjuder in utvalda till förfrågningsunderlaget.",
                },
                {
                  steg: "3",
                  titel: "Anbud till oss",
                  text: "Anbud kommer till Styrelse-Navet. Anbudsgivare ser inte varandra — föreningen ser inte råa anbud.",
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

            <div className="rounded-2xl border border-primary/25 bg-[#eef6f0]/80 px-6 py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-10">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Se aktuella projekt
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  Öppna upphandlingssidan — enbart projektöversikt, sök och
                  intresseanmälan. Utan övriga styrelsemoduler.
                </p>
              </div>
              <Link
                href="/upphandling"
                className="brf-knapp-gron mt-6 w-full px-8 py-4 text-base sm:mt-0 sm:w-auto sm:min-w-[16rem] sm:px-10 sm:py-5 sm:text-lg"
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
        <>
          <section
            id="skapa-forening"
            className="scroll-mt-24 border-t border-border bg-surface/80"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
              <div className="mb-6 max-w-2xl">
                <p className="text-sm font-semibold text-primary-dark">
                  Kom igång
                </p>
                <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  Kom igång med er förening
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Skapa er miljö på några minuter. Gemensamma
                  plattformsuppdateringar slås ihop överallt — era ifyllda
                  uppgifter behålls.
                </p>
              </div>
              <SkapaForeningPanel kompakt visaSnabbstart />
            </div>
          </section>

          <section
            id="priser"
            className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
          >
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">
                Pris & avtal
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Börja gratis — väx när ni är redo
              </h2>
              <p className="mt-2 text-muted">
                Testa plattformen utan kostnad. När ni ser värdet väljer ni avtal
                — med tydlig besparing på längre bindningstid.
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
                  Testa underhållsplan, upphandling och övriga moduler utan
                  kostnad. Ingen kortuppgift krävs i demo — ni ser hur
                  plattformen passar er förening.
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
                  <li>
                    Passar när underhållsplan ska leva över mandatperioder
                  </li>
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
        </>
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
