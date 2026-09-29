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
import { PersonalInloggningFot } from "@/components/plattform/PersonalInloggningFot";
import { TekniskForvaltningErbjudande } from "@/components/pris/TekniskForvaltningErbjudande";
import { UnderhallsplanReklam } from "@/components/pris/UnderhallsplanReklam";
import { FORENING_MODULER } from "@/lib/forening-moduler";
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { MejlaLankStartRuta } from "@/components/styrelsemassa/MejlaLankStartRuta";
import { InbjudanHuvudsidaInnehall } from "@/components/inbjudan/InbjudanHuvudsidaInnehall";
import { HUVUDSIDA_MASSA_QUERY } from "@/lib/massa-lank";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type BrfForetagHomeProps = {
  mode: "public" | "forening";
};

const featuredPublic = [
  {
    title: "Årshjul",
    description:
      "Årshjulet visar vad styrelsen ska göra under året och när det ska göras. Påminnelser, återkommande uppgifter och viktiga datum finns samlade, så att inget faller mellan stolarna.",
    anchor: "#moduler",
    icon: "📅",
    bullets: [
      "Se vad som ska göras och när",
      "Påminnelser om stämma, OVK och andra återkommande uppgifter",
      "Mindre risk att något glöms bort när styrelsen byts ut",
    ],
  },
  {
    title: "Medlemmar & lägenhetsarkiv",
    description:
      "Varje lägenhet har en egen sida med aktuell information och historik. Där sparas också handlingar från tidigare projekt, så att styrelsen slipper leta i gamla mejl och mappar.",
    anchor: "#moduler",
    icon: "🏠",
    bullets: [
      "Aktuell status och historik per lägenhet",
      "Handlingar från tidigare projekt",
      "Enklare uppföljning vid överlåtelser och renoveringar",
    ],
  },
  {
    title: "Underhållsplan",
    description:
      "En 50-årsplan med komponenter, historik och avsättningar som hålls uppdaterad. Styrelsen har alltid ett aktuellt underlag inför stämman, banken och större investeringar.",
    anchor: "#moduler",
    icon: "🔧",
    bullets: [
      "Åtgärder och avsättningar i rätt år, i stället för gissningar i Excel",
      "Komponentregister med teknisk livslängd och kostnad",
      "Ett underlag som nästa styrelse kan ta över",
    ],
  },
  {
    title: "Upphandling",
    description:
      "Vi publicerar underlaget, bjuder in entreprenörer och tar emot anbuden. Ni slipper långa mejltrådar, och anbuden visas aldrig på föreningssidan.",
    anchor: "#upphandlingar",
    icon: "📋",
    bullets: [
      "Allt från mindre servicejobb till stora entreprenader",
      "Vi bjuder in entreprenörer till underlaget",
      "Anbuden hanteras konfidentiellt av Styrelse-Navet",
    ],
  },
] as const;

const erfarenhetOmraden = [
  {
    titel: "Teknisk förvaltning",
    text: "Drift, underhåll och tekniska beslut på lång sikt.",
  },
  {
    titel: "Upphandling",
    text: "Förfrågningsunderlag, anbud och avtal som skyddar föreningen.",
  },
  {
    titel: "Projektledning",
    text: "Från planering till färdigt resultat, med tydlig styrning längs vägen.",
  },
  {
    titel: "Skadeutredning",
    text: "Analys, dokumentation och rätt åtgärder när en skada har uppstått.",
  },
] as const;

export function BrfForetagHome({ mode }: BrfForetagHomeProps) {
  const base = mode === "forening" ? "/forening" : "";
  const isForening = mode === "forening";

  const modules = FORENING_MODULER.map((mod) => ({
    title: mod.title,
    description: mod.description,
    icon: mod.icon,
    href: isForening ? `${base}${mod.path}` : mod.path,
  }));

  return (
    <main>
      {!isForening ? <InbjudanHuvudsidaInnehall /> : null}
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
              "Allt styrelsearbete på ett ställe"
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {isForening
              ? "Här finns föreningens upphandlingar, underhållsplan, guider och dokument."
              : "Årshjul, underhållsplan, lägenhetsarkiv och upphandling i samma verktyg. Styrelsen lägger mindre tid på att leta i mejl och mappar och mer tid på själva besluten."}
          </p>

          {isForening && <ForeningValkommenRand />}

          {!isForening && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                30 dagar gratis, ingen bindning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Tolv moduler för styrelsens vardag
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Utformat efter hur brf-styrelser arbetar
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
                  Prova gratis i 30 dagar
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
                <Link
                  href="/medlem"
                  className="rounded-lg border border-primary/40 bg-white px-5 py-3.5 text-sm font-medium text-primary-dark transition-colors hover:bg-[#eef6f0]"
                >
                  Felanmälan för boende
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
                Stöd för styrelsen, år efter år
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                Plattformen samlar de verktyg en styrelse behöver i det löpande
                arbetet. Modulerna är byggda kring styrelsens vanliga uppgifter:
                att planera året, hålla ordning på lägenheterna, sköta
                underhållet och handla upp arbeten.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                Kraven på styrelser har ökat de senaste åren, och fastighetens
                behov ändras över tid. Med Styrelse-Navet är det lättare att
                hålla ordning när förutsättningarna förändras, och lättare för
                nästa styrelse att ta över.
              </p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titel: "Stöd",
                  text: "Vägledning i vardagen, från årshjulet till förberedelserna inför stämman.",
                },
                {
                  titel: "Verktyg",
                  text: "Årshjul, lägenhetsarkiv, underhållsplan och upphandling i samma system.",
                },
                {
                  titel: "Historik",
                  text: "Handlingar per lägenhet och projekt finns kvar när styrelsen byts ut.",
                },
                {
                  titel: "Råd",
                  text: "Guider och tips baserade på hur styrelser arbetar i praktiken.",
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
                Byggt på mer än 25 års erfarenhet
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Styrelse-Navet är utvecklat av personer som i över 25 år har
                arbetat nära styrelser, förvaltare och entreprenörer. Den
                erfarenheten ligger bakom hur varje modul är uppbyggd.
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
              <span className="text-muted"> med tillgång till allt</span>
            </p>
            <p>
              <span className="font-semibold text-primary-dark">
                −{ARSAVTAL_RABATT_PROCENT}&nbsp;%
              </span>
              <span className="text-muted">
                {" "}
                med ettårsavtal jämfört med månadsbetalning
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
                Fyra verktyg för vardagen
              </h2>
              <p className="mt-2 text-muted">
                Årshjulet ger överblick, lägenhetsarkivet sparar historiken,
                underhållsplanen håller koll på lång sikt och upphandlingen
                sköter vi åt er.
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
                      : "Se alla moduler →"}
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
            {isForening ? "Moduler" : "Tolv moduler för styrelsen"}
          </h2>
          <p className="mt-2 text-muted">
            {isForening
              ? "Välj en modul för att börja arbeta. Snabbvägarna visar de fyra första, och ni kan byta ut dem eller ändra ordningen."
              : "Från årshjul och lägenhetsarkiv till underhåll, upphandling och juridik. Klicka på en modul för att läsa mer. Föreningen kan ni skapa när ni är redo."}
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
                Upphandlingarna har en egen sida, skild från styrelsens moduler.
                Där ser entreprenörer information om aktuella projekt och kan
                anmäla intresse. Underlag och anbud hanterar vi konfidentiellt.
              </p>
            </div>

            <ol className="mb-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  steg: "1",
                  titel: "Projektet publiceras",
                  text: "En kort beskrivning av vad som ska upphandlas, utan kontaktuppgifter eller underlag.",
                },
                {
                  steg: "2",
                  titel: "Intresse och inbjudan",
                  text: "Entreprenörer anmäler intresse, och vi bjuder in de som passar att ta del av förfrågningsunderlaget.",
                },
                {
                  steg: "3",
                  titel: "Anbuden kommer till oss",
                  text: "Anbudsgivarna ser inte varandras anbud, och föreningen ser inte de obearbetade anbuden.",
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
                  Upphandlingssidan visar bara projektöversikt, sökning och
                  intresseanmälan.
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
                Förbered underlaget i modulen. Publiceringen och
                anbudshanteringen sköter Styrelse-Navet. Inkomna anbud visas
                inte här, och anbudsgivarna ser inte varandras anbud.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
              <h3 className="font-semibold text-primary-dark">
                Öppna upphandlingsmodulen
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Skriv en beskrivning och ta fram underlaget. När ni är klara
                publicerar vi upphandlingen, bjuder in entreprenörer och tar
                hand om anbuden utanför föreningssidan.
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
          <section className="border-t border-border bg-[#fafcfa]">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-primary-dark">
                  Var ni på styrelsemässan?
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground">
                  Titta på plattformen i lugn och ro
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Välkommen tillbaka! Ta den tid ni behöver för att se om
                  Styrelse-Navet passar er förening, och prova gratis i 30 dagar
                  när ni är redo.
                </p>
              </div>
              <Link
                href={HUVUDSIDA_MASSA_QUERY}
                className="brf-knapp-neutral shrink-0 px-6 py-3 text-sm font-semibold"
              >
                Till mässans välkomstsida
              </Link>
            </div>
          </section>

          <div id="foreningsformation" className="scroll-mt-24" aria-hidden />
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
                  Skapa er förening på några minuter
                </h2>
                <p className="mt-2 text-sm text-muted">
                  När vi uppdaterar plattformen får ni de nya funktionerna
                  automatiskt, och det ni redan har fyllt i ligger kvar.
                </p>
              </div>
              <SkapaForeningPanel kompakt />
            </div>
          </section>

          <section id="priser" className="scroll-mt-24 border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mb-10 max-w-2xl">
                <p className="text-sm font-semibold text-primary-dark">
                  Pris & avtal
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Börja gratis och teckna avtal när ni är redo
                </h2>
                <p className="mt-2 text-muted">
                  Prova plattformen utan kostnad. Vill ni fortsätta får ni{" "}
                  {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt med ettårsavtal jämfört
                  med månadsbetalning. Priset beror på antalet lägenheter och
                  visas på föreningssidan när ni har fyllt i det.
                </p>
              </div>

              <div className="grid items-stretch gap-6 sm:grid-cols-2">
                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-[#eef6f0] p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    Provperiod
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Prova gratis i 30 dagar
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Testa underhållsplanen, upphandlingen och de andra modulerna
                    utan kostnad. Inga kortuppgifter behövs, och ni hinner se om
                    plattformen passar er förening.
                  </p>
                  <Link
                    href={PROVA_GRATIS_PATH}
                    className="brf-knapp-gron mt-6 self-start px-5 py-2.5 text-sm"
                  >
                    Starta provperioden
                  </Link>
                </div>
                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <PublikPrisInfo />
                </div>

                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    För boende
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Felanmälan till styrelsen
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Anmäl fel i föreningen utan att logga in. Ni får ett
                    ärendenummer, och sedan tar styrelsen och förvaltaren hand om
                    ärendet.
                  </p>
                  <Link
                    href="/medlem"
                    className="mt-6 self-start rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Till medlemsportalen
                  </Link>
                </div>
                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Befintlig kund
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Logga in till er förening
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Har styrelsen redan skapat er förening? Logga in för att
                    fortsätta med underhållsplanen, årshjulet och de andra
                    modulerna.
                  </p>
                  <Link
                    href="/kund-login"
                    className="mt-6 self-start rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Logga in till er BRF
                  </Link>
                </div>
                <MejlaLankStartRuta />

                <div className="flex h-full min-h-[18rem] flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Film & funktioner
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">
                    Se hur det fungerar
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    Korta scener visar hur underhållsplanen, upphandlingen och
                    de andra modulerna fungerar. Tryck på Spela i rutan bredvid.
                  </p>
                  <p className="mt-6 text-sm text-primary-dark">
                    Demo utan ljud, cirka 20 sekunder
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
                  Schema, checklistor och signering på samma ställe, så att en
                  missad rondering eller städning inte går obemärkt förbi.
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
                  Årsavtal med {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt jämfört
                  med månadsbetalning. Beloppet visas när ni har fyllt i antalet
                  lägenheter.
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
                  När avtalet är godkänt loggar ni in via «Logga in till er BRF».
                  Där visas bara er förenings uppgifter.
                </p>
              </div>
            </div>
          </section>

          <FilmDemo variant="forening" />
        </>
      )}

      {!isForening && <PersonalInloggningFot />}
    </main>
  );
}
