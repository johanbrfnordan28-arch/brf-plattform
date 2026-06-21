import Link from "next/link";
import { FilmDemo } from "@/components/FilmDemo";
import { ModuleCard } from "@/components/ModuleCard";
import { ForeningHeroEtikett } from "@/components/forening/ForeningHeroEtikett";
import { ForeningInloggningsLista } from "@/components/forening/ForeningInloggningsLista";
import { ForeningValkommenRand } from "@/components/forening/ForeningValkommenRand";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { upphandlingsKategorier } from "@/components/upphandling/kategorier";

type BrfForetagHomeProps = {
  mode: "public" | "forening";
};

const featuredPublic = [
  {
    title: "Underhållsplan",
    description:
      "Bygg komponentregister, renoveringshistorik, besiktningar och budget i samma plan — från stambyte till fasad. Styrelsen får beslutsstöd som håller över tid, inte bara ett kalkylark.",
    href: "/styrelse-login",
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
      "Från mindre servicejobb till större entreprenader — mallar, dokument och publicering med Upphandla-knappen. Anbud samlas strukturerat och jämförs på ett ställe.",
    href: "/upphandling",
    icon: "📋",
    bullets: [
      "Entreprenad, konsulter och fastighetsförvaltning",
      "Enkel upphandling eller fullständigt underlag",
      "Låsta anbud till efter sista anbudsdag",
    ],
  },
] as const;

export function BrfForetagHome({ mode }: BrfForetagHomeProps) {
  const base = mode === "forening" ? "/forening" : "";
  const isForening = mode === "forening";

  const coreModules = isForening
    ? [
        {
          title: "Årshjul & kalender",
          description:
            "Styrelsens årshjul med påminnelser — årliga uppgifter och besiktningar flera år framåt.",
          href: `${base}/arshjul`,
          icon: "📅",
        },
        {
          title: "Upphandling",
          description:
            "Färdiga mallar och enkel eller utökad upphandling. Publicera med knappen Upphandla.",
          href: `${base}/upphandling`,
          icon: "📋",
        },
        {
          title: "Underhållsplan",
          description:
            "Bygg upp föreningens komponentregister, renoveringshistorik och framtida underhåll i portalen.",
          href: `${base}/underhallsplan`,
          icon: "🔧",
        },
        {
          title: "Guider & tips",
          description:
            "Korta AI-filmer om funktionerna samt råd om upphandling och entreprenörer.",
          href: `${base}/guider`,
          icon: "🎬",
        },
      ]
    : [
        {
          title: "Underhållsplan",
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

  const modules = [
    ...coreModules,
    {
      title: "Juridik",
      description: "Vägledning och mallar för styrelseärenden och avtal.",
      href: `${base}/juridik`,
      icon: "⚖️",
    },
    {
      title: "Föreningsinformation",
      description: isForening
        ? "Stadgar, ekonomisk plan, besiktningsprotokoll och övriga dokument i mappar."
        : "Stadgar, besiktningar och styrelsedokument — uppladdning efter inloggning.",
      href: `${base}/foreningsinformation`,
      icon: "📁",
    },
    {
      title: "Projekt",
      description: isForening
        ? "Projektmappar per år — skapa nytt projekt eller arkivera äldre med dokument."
        : "Projektmappar med årtal och underlag — hantering efter inloggning.",
      href: `${base}/projekt`,
      icon: "📐",
    },
    {
      title: isForening ? "Medlemmar" : "Renoveringshistorik & rutiner",
      description: isForening
        ? "Renoveringsanmälan, utskick och lägenhetsarkiv med mappar per lägenhet."
        : "Historik per lägenhet, renoveringsrutiner och anmälan med checklista.",
      href: `${base}/medlemmar`,
      icon: isForening ? "👥" : "📋",
    },
    {
      title: "Rondering & avvikelser",
      description:
        "Tydliga checklistor, signering och avvikelserapportering för städning och fastighetsskötsel.",
      href: `${base}/rondering`,
      icon: "✅",
    },
    {
      title: "Energi & drift",
      description:
        "Värme och belysning — energiåtgärder kopplade till teknisk livslängd i underhållsplanen.",
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
              Styrelsenavet · För styrelser som vill driva föreningen framåt
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
              : "Styrelsenavet samlar det styrelsen behöver för långsiktigt underhåll och tydliga upphandlingar — från mindre jobb till större entreprenader. Mindre tid på administration, mer tid på beslut som driver föreningen framåt."}
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
                  href="#fokus"
                  className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  Varför underhåll & upphandling
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {!isForening && (
        <section id="provperioder" className="border-b border-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="mb-5 max-w-2xl">
              <p className="text-sm font-semibold text-primary-dark">
                Logga in via Styrelsenavet
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                Snurra fram föreningens provperiod
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Flera styrelsemedlemmar kan börja på första sidan, välja rätt
                provperiod i hjulet och sedan öppna föreningens egen sida.
              </p>
            </div>
            <ForeningInloggningsLista />
          </div>
        </section>
      )}

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
                  text: "Mallar och Upphandla-knappen",
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
              ? "Samma moduler som på den publika sidan — här arbetar styrelsen i er förenings miljö."
              : "Dokument, rondering, entreprenörer och medlemshantering — allt hänger ihop när grunden är på plats."}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <ModuleCard key={mod.title} {...mod} />
          ))}
        </div>
      </section>

      <section
        id="upphandlingar"
        className="border-y border-border bg-surface/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {isForening ? "Upphandlingar" : "Stora och små entreprenader"}
            </h2>
            <p className="mt-2 text-muted">
              {isForening
                ? "Föreningen eller deras ombud tar fram ett underlag och trycker på Upphandla."
                : "Samma flöde oavsett om det gäller tak, stambyte, fastighetsskötsel eller brandkonsult — kategori, mallar och låsta anbud."}
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
