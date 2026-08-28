"use client";

import Link from "next/link";
import {
  InformationsFilmSpelare,
  type InformationsFilmScen,
} from "@/components/InformationsFilmSpelare";
import { useHubbNamn } from "@/components/forening/useHubbNamn";

const scenesPublic: InformationsFilmScen[] = [
  {
    titel: "Styrelsen behöver överblick",
    text: "Underhåll, upphandlingar och dokument hamnar ofta utspritt. Det blir svårt att veta vad som är planerat, utfört och vad som saknas.",
  },
  {
    titel: "Underhållsplan som håller",
    text: "Bygg komponentregister, renoveringshistorik och besiktningar i samma plan. Budget och investeringar blir tydliga — inte gömda i kalkylark.",
  },
  {
    titel: "Upphandling — stort som smått",
    text: "Från fastighetsskötsel till stambyte: mallar, dokument och Upphandla-knappen. Anbud samlas och jämförs strukturerat.",
  },
  {
    titel: "Se och förstå funktionerna",
    text: "Korta scener visar hur modulerna fungerar — så ni snabbt får en tydlig bild av plattformen.",
  },
];

function byggForeningScener(hubbNamn: string): InformationsFilmScen[] {
  return [
    {
      titel: `Välkommen till ${hubbNamn}`,
      text: "Här arbetar styrelsen i samma portal som medlemmarna ser — upphandling, underhållsplan, dokument och rondering på ett ställe.",
    },
    {
      titel: "Modul för modul",
      text: "Välj det ni behöver: underhållsplan med komponenter, guider med korta filmer, upphandling med tydliga steg.",
    },
    {
      titel: "Underhållsplan i fokus",
      text: "Bygg register, renoveringshistorik och budget. Besiktningar hamnar i rätt år — inte utspritt i kalkylark.",
    },
    {
      titel: "Guider när ni behöver stöd",
      text: "Korta filmer per funktion plus tips om upphandling och entreprenörer — tryck Spela och följ scenerna.",
    },
    {
      titel: "Redo att börja",
      text: "Öppna modulerna ovan eller gå till Guider & tips för fler filmer. Detta är en demo tills riktig video finns inlagd.",
    },
  ];
}

type FilmDemoProps = {
  variant?: "public" | "forening";
  /** Två lika stora kort — för 2×2-layout under Pris & avtal. */
  layout?: "banner" | "kort";
};

export function FilmDemo({
  variant = "public",
  layout = "banner",
}: FilmDemoProps) {
  const isForening = variant === "forening";
  const hubbNamn = useHubbNamn();
  const scener = isForening ? byggForeningScener(hubbNamn) : scenesPublic;
  const scenMs = isForening ? 6000 : 5000;

  if (!isForening && layout === "kort") {
    return (
      <InformationsFilmSpelare
        scener={scener}
        scenMs={scenMs}
        kompakt
        className="min-h-0 flex-1"
      />
    );
  }

  /** Föreningssida: två lika stora, tilltalande rutor längre ner på sidan. */
  if (isForening) {
    return (
      <section
        id="intro-film"
        className="scroll-mt-24 border-t border-border bg-surface/50"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold text-primary-dark">
              Introduktion · {hubbNamn}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Se portalen på cirka 30 sekunder
            </h2>
            <p className="mt-2 text-muted">
              Korta scener visar hur modulerna hänger ihop. Tryck Spela i
              filmrutan — eller öppna Guider & tips för fler filmer.
            </p>
          </div>

          <div className="grid items-stretch gap-5 sm:grid-cols-2">
            <article className="flex min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1a2e22] via-[#243d2c] to-[#2d4a36] p-6 text-white shadow-sm sm:min-h-[22rem] sm:p-8">
              <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                Om portalen
              </span>
              <h3 className="mt-5 text-xl font-bold sm:text-2xl">
                Styrelsearbete samlat
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/85 sm:text-base">
                Upphandling, underhållsplan, rondering och dokument i samma
                miljö. Filmen till höger går igenom huvuddelarna — utan ljud i
                demo.
              </p>
              <Link
                href="/forening/guider"
                className="mt-6 inline-flex w-fit items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-[#edf5ef]"
              >
                Fler filmer under Guider & tips →
              </Link>
            </article>

            <article className="flex min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-sm sm:min-h-[22rem] sm:p-4">
              <InformationsFilmSpelare
                scener={scener}
                scenMs={scenMs}
                kompakt
                className="min-h-0 flex-1 rounded-xl"
              />
              <p className="mt-3 text-center text-xs text-muted">
                Demo utan ljud — tryck Spela för att gå igenom scenerna.
              </p>
            </article>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-primary-dark p-6 text-white sm:p-8">
            <p className="text-sm font-semibold text-white/75">
              Film & funktioner
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Se och förstå funktionerna
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Korta scener visar hur underhållsplan, upphandling och övriga
              moduler fungerar i praktiken.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <InformationsFilmSpelare scener={scener} scenMs={scenMs} />
            <p className="mt-3 text-center text-xs text-muted">
              Demo utan ljud — tryck Spela för att gå igenom scenerna.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
