import Link from "next/link";
import { FilmDemo } from "@/components/FilmDemo";
import { ModuleCard } from "@/components/ModuleCard";
import { ForeningHeroEtikett } from "@/components/forening/ForeningHeroEtikett";
import { ForeningHubbRubrik } from "@/components/forening/ForeningHubbRubrik";
import { ForeningSnabbvagar } from "@/components/forening/ForeningSnabbvagar";
import { ForeningValkommenRand } from "@/components/forening/ForeningValkommenRand";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { ForeningPrisPanel } from "@/components/pris/ForeningPrisPanel";
import { PublikPrisInfo } from "@/components/pris/PublikPrisInfo";
import { TekniskForvaltningErbjudande } from "@/components/pris/TekniskForvaltningErbjudande";
import { UnderhallsplanReklam } from "@/components/pris/UnderhallsplanReklam";
import { FORENING_MODULER } from "@/lib/forening-moduler";
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type BrfForetagHomeProps = {
  mode: "public" | "forening";
};

const featuredPublic = [
  {
    title: "Årshjul",
    description:
      "Årshjulet ger en tydlig översikt över året. Planeringen av styrelsearbetet blir mer överskådlig — med påminnelser, återkommande uppgifter och långsiktiga datum samlade på ett ställe.",
    anchor: "#moduler",
    icon: "📅",
    bullets: [
      "Se vad som ska göras — och när",
      "Påminnelser för stämma, OVK och återkommande uppgifter",
      "Mindre risk att något glöms bort mellan mandatperioder",
    ],
  },
  {
    title: "Lägenhetsarkiv",
    description:
      "Här sparas aktuell information och historik för respektive lägenhet. Handlingar från äldre projekt samlas på ett ställe — så styrelsen slipper leta i mejl och mappar när något behöver följas upp.",
    anchor: "#moduler",
    icon: "🏠",
    bullets: [
      "Aktuell status och historik per lägenhet",
      "Gamla projekt och handlingar på samma ställe",
      "Enklare uppföljning vid överlåtelse och renovering",
    ],
  },
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

  const modules = FORENING_MODULER.map((mod) => ({
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
            {isForening ? (
              <ForeningHubbRubrik />
            ) : (
              "Förenkla styrelsearbetet — från årshjul till lägenhetsarkiv"
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {isForening
              ? "Upphandling, underhållsplan, guider och dokumentation samlat för er förening. Enkelt, strukturerat och spårbart."
              : "Styrelse-Navet ger er översikt, struktur och spårbarhet. Mindre tid i mejl och mappar — mer tid på beslut som håller för föreningen."}
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
                Årshjul, underhåll, upphandling och lägenhetsarkiv
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Framtaget ur verkliga behov i Brf-styrelser
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
                  Årshjul
                </Link>
                <Link
                  href="#moduler"
                  className="rounded-lg border border-primary bg-[#eef6f0] px-5 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-[#e2f0e6]"
                >
                  Alla moduler
                </Link>
                <Link
                  href="#intro-film"
                  className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Se kort film (30 sek)
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
                  href="#teknisk-forvaltning"
                  className="rounded-lg border border-border bg-surface px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Teknisk förvaltning
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
                styrelsearbetet. Modulerna är framtagna utifrån kända behov hos
                styrelser i bostadsrättsföreningar — inte som generiska
                IT-funktioner.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                Styrelsearbetet har förändrats de senaste åren, och fastighetens
                behov förändras över tid. Styrelse-Navet ger stöd, hjälpmedel,
                spårbarhet och råd — så ni har struktur när förutsättningarna
                skiftar.
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
                  text: "Årshjul, lägenhetsarkiv, underhåll och upphandling — i samma miljö.",
                },
                {
                  titel: "Spårbarhet",
                  text: "Historik per lägenhet och projekt — underlag som följer med över tid.",
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
                <li
                  key={omrade.titel}
                  className="border-l-2 border-primary/50 pl-4"
                >
                  <h3 className="font-semibold text-foreground">{omrade.titel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {omrade.text}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted">
              Se hur ni kan anlita oss för{" "}
              <Link
                href="#teknisk-forvaltning"
                className="font-medium text-primary hover:text-primary-dark"
              >
                teknisk förvaltning och övriga tjänster
              </Link>
              .
            </p>
          </div>
        </section>
      )}

      {!isForening && <TekniskForvaltningErbjudande />}

      {!isForening && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-center text-sm sm:px-6">
            <p>
              <span className="font-semibold text-primary-dark">
                30 dagar gratis
              </span>
              <span className="text-muted"> — testa hela plattformen</span>
            </p>
            <p>
              <span className="font-semibold text-primary-dark">
                −{ARSAVTAL_RABATT_PROCENT}&nbsp;%
              </span>
              <span className="text-muted">
                {" "}
                på ettårsavtal vs månadsdebitering
              </span>
            </p>
          </div>
        </section>
      )}

      {isForening && <ForeningSnabbvagar />}

      {!isForening && (
        <section id="fokus" className="border-b border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">
                Där styrelsen sparar mest tid
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Fyra verktyg som gör skillnad i vardagen
              </h2>
              <p className="mt-2 text-muted">
                Översikt med årshjulet, historik i lägenhetsarkivet, långsiktig
                underhållsplan och trygg upphandling — i samma portal.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
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
                      : "Se modulerna →"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="moduler"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isForening ? "Moduler" : "Tolv moduler — ett nav för styrelsen"}
          </h2>
          <p className="mt-2 text-muted">
            {isForening
              ? "Välj en modul för att arbeta i er förenings miljö. Snabbvägarna visar de fyra översta — ni kan flytta om och byta."
              : "Från årshjul och lägenhetsarkiv till underhåll, upphandling och juridik. Allt hänger ihop — så styrelsen alltid vet var informationen finns."}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.title} {...mod} />
          ))}
        </div>
      </section>

      <UnderhallsplanReklam lage={isForening ? "forening" : "public"} />

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
                anmäla intresse. Underlag och anbud hanteras av oss,
                konfidentiellt.
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
                  <h3 className="mt-2 font-semibold text-foreground">
                    {item.titel}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.text}
                  </p>
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
                Förbered underlag i modulen. Publicering och anbudshantering
                sker via Styrelse-Navet — inkomna anbud syns inte här och
                anbudsgivare ser inte varandra.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
              <h3 className="font-semibold text-primary-dark">
                Öppna upphandlingsmodulen
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Skapa beskrivning och underlag. När ni är redo publicerar ni via
                oss — entreprenörer bjuds in och anbud hanteras manuellt utanför
                föreningsvyn.
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
                  Skapa er förening — och börja använda plattformen
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Kom igång på några minuter. Gemensamma plattformsuppdateringar
                  slås ihop överallt — era ifyllda uppgifter behålls.
                </p>
              </div>
              <SkapaForeningPanel kompakt visaSnabbstart />
            </div>
          </section>

          <section id="priser" className="scroll-mt-24 border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mb-10 max-w-2xl">
                <p className="text-sm font-semibold text-primary-dark">
                  Pris & avtal
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Börja gratis — väx när ni är redo
                </h2>
                <p className="mt-2 text-muted">
                  Testa plattformen utan kostnad. När ni ser värdet väljer ni
                  ettårsavtal — med {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt mot
                  månadsdebitering. Er kostnad beror på antal lägenheter och
                  visas inne på föreningssidan när antalet är ifyllt.
                </p>
              </div>

              <div className="grid items-stretch gap-6 sm:grid-cols-2">
                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-[#eef6f0] p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    Provperiod
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Prova gratis 30 dagar
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Testa underhållsplan, upphandling och övriga moduler utan
                    kostnad. Ingen kortuppgift krävs i demo — ni ser hur
                    plattformen passar er förening.
                  </p>
                  <Link
                    href={PROVA_GRATIS_PATH}
                    className="brf-knapp-gron mt-6 self-start px-5 py-2.5 text-sm"
                  >
                    Vi vill pröva gratis i 30 dagar
                  </Link>
                </div>
                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <PublikPrisInfo />
                  <Link
                    href="/kund-login"
                    className="mt-6 self-start rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Logga in till er BRF
                  </Link>
                </div>

                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Film & funktioner
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Se och förstå funktionerna
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Korta scener visar hur underhållsplan, upphandling och
                    övriga moduler fungerar i praktiken. Tryck spela i rutan
                    bredvid.
                  </p>
                  <p className="mt-6 text-sm text-primary-dark">
                    Demo utan ljud — ca 20 sekunder
                  </p>
                </div>
                <div
                  id="intro-film"
                  className="flex h-full min-h-[18rem] scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-sm sm:p-4"
                >
                  <FilmDemo variant="public" layout="kort" />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold text-primary-dark">
                  Er förening
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  Rondering som styrelsen kan följa upp
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Schema, checklistor och signering samlat så att utebliven
                  rondering eller städning blir svårare att missa.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-[#e8f3ec] p-6 sm:p-8">
                <p className="text-sm font-semibold text-primary-dark">
                  Pris & avtal
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  Er kostnad
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Årsavtal med {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt mot
                  månadsdebitering. Beloppet visas när antal lägenheter är
                  ifyllt.
                </p>
                <div className="mt-4">
                  <ForeningPrisPanel variant="hubb" />
                </div>
                <Link
                  href="/forening/uppgifter#avtal"
                  className="brf-knapp-gron mt-6 inline-flex px-5 py-2.5 text-sm"
                >
                  Godkänn avtal och bli kund
                </Link>
                <p className="mt-3 text-xs text-muted">
                  När avtalet är godkänt loggar ni in via «Logga in till er BRF»
                  — endast er förenings uppgifter visas.
                </p>
              </div>
            </div>
          </section>

          <FilmDemo variant="forening" />
        </>
      )}
    </main>
  );
}
