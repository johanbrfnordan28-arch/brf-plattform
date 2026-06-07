"use client";

import { useEffect, useState } from "react";

export type InformationsFilmScen = {
  titel: string;
  text: string;
};

type InformationsFilmSpelareProps = {
  scener: InformationsFilmScen[];
  /** Millisekunder per scen — t.ex. 5000 × 6 scener ≈ 30 sek. */
  scenMs?: number;
  /** Starta uppspelning direkt (t.ex. på föreningssidan). */
  autoSpela?: boolean;
  className?: string;
};

export function InformationsFilmSpelare({
  scener,
  scenMs = 5000,
  autoSpela = false,
  className = "",
}: InformationsFilmSpelareProps) {
  const [aktivScen, setAktivScen] = useState(0);
  const [spelar, setSpelar] = useState(autoSpela);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!spelar || scener.length < 2) return;
    const timer = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setAktivScen((n) => (n + 1) % scener.length);
        setFade(true);
      }, 180);
    }, scenMs);
    return () => window.clearInterval(timer);
  }, [spelar, scener.length, scenMs]);

  const scen = scener[aktivScen];
  const totalSek = Math.round((scener.length * scenMs) / 1000);
  const progress =
    scener.length > 1
      ? ((aktivScen + (spelar ? 0.35 : 0)) / scener.length) * 100
      : 100;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#1a2e22] ${className}`.trim()}>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          spelar ? "opacity-100" : "opacity-60"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(74,140,100,.35), transparent), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(36,79,53,.5), transparent)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative aspect-video flex flex-col justify-between p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 text-white/80">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
            {spelar ? "Spelar" : "Pausad"} · ca {totalSek} sek
          </span>
          <span className="text-xs">
            Scen {aktivScen + 1}/{scener.length}
          </span>
        </div>

        <div
          className={`my-4 flex-1 transition-opacity duration-300 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3 className="text-lg font-bold text-white sm:text-xl">{scen.titel}</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
            {scen.text}
          </p>
        </div>

        <div className="space-y-3">
          <div
            className="h-1 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSpelar((s) => !s)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm hover:bg-[#edf5ef]"
            >
              <span className="text-base leading-none" aria-hidden>
                {spelar ? "⏸" : "▶"}
              </span>
              {spelar ? "Pausa" : "Spela film"}
            </button>
            {scener.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setAktivScen(index);
                  setFade(true);
                }}
                className={`h-2 flex-1 min-w-[2rem] max-w-12 rounded-full transition-colors ${
                  index === aktivScen ? "bg-white" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Gå till scen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {!spelar && (
        <button
          type="button"
          onClick={() => setSpelar(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          aria-label="Spela film"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-2xl text-primary-dark shadow-lg sm:h-20 sm:w-20">
            ▶
          </span>
        </button>
      )}
    </div>
  );
}
