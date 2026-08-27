"use client";

import Link from "next/link";
import {
  InformationsFilmSpelare,
  type InformationsFilmScen,
} from "@/components/InformationsFilmSpelare";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";

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

const scenesForening: InformationsFilmScen[] = [
  {
    titel: `Välkommen till ${STYRELSEFLOW_NAMN}`,
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
    text: "Öppna modulerna nedan eller gå till Guider & tips för fler filmer. Detta är en demo tills riktig video finns inlagd.",
  },
];

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
  const scener = isForening ? scenesForening : scenesPublic;
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-primary-dark p-6 text-white sm:p-8">
            <p className="text-sm font-semibold text-white/75">
              {isForening
                ? `Introduktion · ${STYRELSEFLOW_NAMN}`
                : "Film & funktioner"}
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              {isForening
                ? "Se portalen på cirka 30 sekunder"
                : "Se och förstå funktionerna"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              {isForening
                ? "En enkel informationsfilm med scener och uppspelning — samma upplägg som under Guider & tips. Tryck Spela i rutan till höger."
                : "Korta scener visar hur underhållsplan, upphandling och övriga moduler fungerar i praktiken."}
            </p>
            {isForening ? (
              <Link
                href="/forening/guider"
                className="mt-5 inline-block text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                Fler filmer under Guider & tips →
              </Link>
            ) : null}
          </div>

          <div className="p-4 sm:p-6">
            <InformationsFilmSpelare
              scener={scener}
              scenMs={scenMs}
              autoSpela={isForening}
            />
            <p className="mt-3 text-center text-xs text-muted">
              {isForening
                ? "Demo utan ljud — i produktion kan en riktig AI- eller inspelad mp4-video ligga här."
                : "Demo utan ljud — tryck Spela för att gå igenom scenerna."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
