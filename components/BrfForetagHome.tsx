import Link from "next/link";
import { FilmDemo } from "@/components/FilmDemo";
import { ModuleCard } from "@/components/ModuleCard";
import { ForeningValkommenRand } from "@/components/forening/ForeningValkommenRand";
import { ForeningsFormationSektion } from "@/components/forening/ForeningsFormationSektion";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { upphandlingsKategorier } from "@/components/upphandling/kategorier";

type BrfForetagHomeProps = {
  mode: "public" | "forening";
};

const featuredPublic = [
  {
    title: "Underhållsplan",
    description:
      "Bygg en 50-årsplan med komponentregister, renoveringshistorik och avsättningsbudget — allt samlat i portalen. Styrelsen har alltid ett aktuellt beslutsunderlag inför stämma och bankkontakter.",
    href: "/underhallsplan",
    icon: "🔧",
    bullets: [
      "50-årsbudget med avsättning genereras automatiskt",
      "Välj byggnadsperiod — typiska komponenter fylls i",
      "OVK, stambyte och takbyte planerat i rätt ordning",
    ],
  },
  {
    title: "Upphandling",
    description:
      "Från obligatorisk OVK till stambyte värt miljoner — samma strukturerade flöde för alla storlekar. Anbud låses tills deadline och styrelsebeslutet dokumenteras spårbart.",
    href: "/upphandling",
    icon: "📋",
    bullets: [
      "Förenklad upphandling för OVK, radon och energideklaration",
      "Fullständigt förfrågningsunderlag med mallar från dokumentbanken",
      "Låsta anbud och spårbart styrelsebeslut med två godkännanden",
    ],
  },
] as const;

export function BrfForetagHome({ mode }: BrfForetagHomeProps) {
  const base = mode === "forening" ? "/forening" : "";
  const isForening = mode === "forening";

  const publicModules = [
    {
      title: "Årshjul",
      description:
        "Slipp missa OVK, stämma och bokslut — påminnelser och tidslinje flera år framåt.",
      href: `${base}/arshjul`,
      icon: "📅",
    },
    {
      title: "Underhåll",
      description:
        "Komponentregister, besiktningar och budget i samma plan — beslutsstöd som håller över tid.",
      href: `${base}/underhallsplan`,
      icon: "🔧",
    },
    {
      title: "Upphandling",
      description:
        "Mallar och Upphandla-knappen för stora och små entreprenader — anbud samlas strukturerat.",
      href: `${base}/upphandling`,
      icon: "📋",
    },
    {
      title: "Film & prisuppgift",
      description:
        "Korta filmer visar funktionerna — se filmen och få tydlig prisbild innan ni startar provperiod.",
      href: "#intro-film",
      icon: "🎬",
    },
  ];

  /** Förening: 4 kolumner — Kalender borttagen (ingår i Årshjul). */
  const foreningModules = [
    {
      title: "Årshjul",
      description:
        "Styrelsens årshjul med påminnelser — årliga uppgifter och besiktningar flera år framåt.",
      href: `${base}/arshjul`,
      icon: "📅",
    },
    {
      title: "Föreningsinformation",
      description:
        "Stadgar, ekonomisk plan, besiktningsprotokoll och övriga dokument i mappar.",
      href: `${base}/foreningsinformation`,
      icon: "📁",
    },
    {
      title: "Medlemmar",
      description:
        "Lägenhetsarkiv, renoveringshistorik och anmälningar med checklista per åtgärd.",
      href: `${base}/medlemmar`,
      icon: "👥",
    },
    {
      title: "Underhåll",
      description:
        "Bygg upp föreningens komponentregister, renoveringshistorik och framtida underhåll i portalen.",
      href: `${base}/underhallsplan`,
      icon: "🔧",
    },
    {
      title: "Energi & drift",
      description:
        "Värme och belysning — energiåtgärder kopplade till teknisk livslängd i underhållsplanen.",
      href: `${base}/energi`,
      icon: "⚡",
    },
    {
      title: "Rondering & avvikelser",
      description:
        "Signering och spårbarhet för städ och rondering — höjer kvaliteten varje månad.",
      href: `${base}/rondering`,
      icon: "✅",
    },
    {
      title: "Upphandling",
      description:
        "Färdiga mallar och enkel eller utökad upphandling. Publicera med knappen Upphandla.",
      href: `${base}/upphandling`,
      icon: "📋",
    },
    {
      title: "Projekt",
      description:
        "Projektmappar per år — skapa nytt projekt eller arkivera äldre med dokument.",
      href: `${base}/projekt`,
      icon: "📐",
    },
    {
      title: "Entreprenörer",
      description:
        "Lista bra entreprenörer som känner huset — egna kontakter för er förening.",
      href: `${base}/entreprenorer`,
      icon: "🏗️",
    },
    {
      title: "Juridik",
      description: "Vägledning och mallar för styrelseärenden och avtal.",
      href: `${base}/juridik`,
      icon: "⚖️",
    },
    {
      title: "Tips och råd",
      description:
        "Korta AI-filmer om funktionerna samt råd om upphandling och entreprenörer.",
      href: `${base}/guider`,
      icon: "🎬",
    },
  ];

  const modules = isForening
    ? foreningModules
    : [
        ...publicModules,
        {
          title: "Juridik",
          description: "Vägledning och mallar för styrelseärenden och avtal.",
          href: `${base}/juridik`,
          icon: "⚖️",
        },
        {
          title: "Föreningsinformation",
          description:
            "Stadgar, besiktningar och styrelsedokument — uppladdning efter inloggning.",
          href: `${base}/foreningsinformation`,
          icon: "📁",
        },
        {
          title: "Projekt",
          description:
            "Börja med projektbeskrivning, status och målbild — stöd finns för resten.",
          href: `${base}/projekt`,
          icon: "📐",
        },
        {
          title: "Lägenhetskort & renovering",
          description:
            "Ett kort per lägenhet — enkelt för styrelsen, spårbart med signering av överenskommelser.",
          href: `${base}/medlemmar`,
          icon: "🏠",
        },
        {
          title: "Rondering & avvikelser",
          description:
            "Signering och spårbarhet för städ och rondering — höjer kvaliteten varje månad.",
          href: `${base}/rondering`,
          icon: "✅",
        },
        {
          title: "Energi & drift",
          description:
            "Payback time och kostnader före/efter — tips om energi och drift som utvecklas löpande.",
          href: `${base}/energi`,
          icon: "⚡",
        },
        {
          title: "Entreprenörer",
          description:
            "Sök entreprenör för ert projekt — med referenser och betyg från andra föreningar.",
          href: `${base}/entreprenorer`,
          icon: "🏗️",
        },
      ];

  return (
    <main>
      {isForening ? (
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <ForeningValkommenRand />
        </div>
      ) : (
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary-dark">
              {BRF_NAVET_NAMN} · För styrelser som vill ha kontroll
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Allt styrelsen behöver — underhåll, upphandling och dokumentation på ett ställe
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              {`${BRF_NAVET_NAMN} ger styrelsen ett strukturerat verktyg för 50-årsplan, upphandlingar och löpande dokumentation — slipp kalkylark, mejlkedjor och papper som försvinner.`}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>✓</span>
                Testa gratis — ingen bindning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>✓</span>
                Kom igång på under 5 minuter
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>✓</span>
                OVK, stambyte och takbyte — planerat i rätt ordning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden>✓</span>
                Upphandla med låsta anbud och spårbart beslut
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={PROVA_GRATIS_PATH}
                className="brf-knapp-gron px-8 py-4 text-base font-semibold shadow-sm sm:text-lg"
              >
                Pröva gratis
              </Link>
              <Link
                href="#foreningsformation"
                className="rounded-lg border border-primary bg-[#eef6f0] px-5 py-3.5 text-sm font-medium text-primary-dark transition-colors hover:bg-[#e2f0e6] sm:px-6 sm:text-base"
              >
                Skapa er förening
              </Link>
              <Link
                href="#intro-film"
                className="rounded-lg border border-border bg-surface px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
              >
                Se filmerna — få prisuppgift
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              Klicka <strong className="font-medium text-foreground">Pröva gratis</strong>{" "}
              för att välja en testförening och komma igång direkt — ingen bindning.
            </p>
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

      {!isForening && (
        <div id="intro-film">
          <FilmDemo variant="public" />
        </div>
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
                av modulerna bygger vidare på samma struktur.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredPublic.map((mod) => (
                <Link
                  key={mod.title}
                  href={mod.href}
                  className="group flex flex-col rounded-2xl border-2 border-primary/20 bg-surface p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md sm:p-8"
                >
                  <span
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f3ec] text-2xl"
                    aria-hidden
                  >
                    {mod.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary-dark">
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
                  <span className="mt-5 text-sm font-medium text-primary group-hover:text-primary-dark">
                    Läs mer om {mod.title.toLowerCase()} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="moduler" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isForening ? "Moduler" : "Fler moduler i samma plattform"}
          </h2>
          <p className="mt-2 text-muted">
            {isForening
              ? "Välj en modul för att arbeta i er förenings miljö — underhållsplan, upphandling, rondering, dokument och mer."
              : "Dokument, rondering, entreprenörer och medlemshantering — allt hänger ihop när grunden är på plats."}
          </p>
        </div>
        <div
          className={`grid gap-6 sm:grid-cols-2 ${
            isForening ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {modules.map((mod) => (
            <ModuleCard key={mod.title} {...mod} />
          ))}
        </div>
      </section>

      {!isForening && (
        <section
          id="upphandlingar"
          className="border-y border-border bg-surface/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Stora och små entreprenader
              </h2>
              <p className="mt-2 text-muted">
                Samma flöde oavsett om det gäller tak, stambyte, fastighetsskötsel
                eller brandkonsult — kategori, mallar och låsta anbud.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {upphandlingsKategorier.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-[#e8f3ec] hover:text-primary-dark"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-dashed border-primary/40 bg-[#e8f3ec]/50 p-6 sm:p-8">
              <h3 className="font-semibold text-primary-dark">Upphandla-knappen</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Styrelsen eller ett anlitat ombud fyller i mallar och bifogar
                handlingar. Entreprenörer med godkänt konto kan begära underlag och
                lämna anbud — först låst till efter sista anbudsdag.
              </p>
              <Link
                href={`${base}/upphandling`}
                className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Läs om upphandling
              </Link>
            </div>
          </div>
        </section>
      )}

      {!isForening && (
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
                className="brf-knapp-gron mt-6 px-7 py-3.5 text-base font-semibold shadow-sm"
              >
                Pröva gratis
              </Link>
              <p className="mt-2 text-xs text-muted">
                Välj en testförening och kom igång direkt.
              </p>
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
      )}

      {!isForening && <ForeningsFormationSektion />}
    </main>
  );
}
