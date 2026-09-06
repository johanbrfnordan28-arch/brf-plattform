"use client";

import { useState } from "react";
import { KortGuideFilm } from "@/components/guider/KortGuideFilm";
import { guideFilmer, guideTips } from "@/components/guider/guider";

type TipsFilter = "alla" | "upphandling" | "entreprenor";

export function StyrelseGuiderModul() {
  const [tipsFilter, setTipsFilter] = useState<TipsFilter>("alla");

  const filtreradeTips = guideTips.filter(
    (tips) => tipsFilter === "alla" || tips.kategori === tipsFilter,
  );

  return (
    <div className="space-y-10">
      <p className="text-sm leading-relaxed text-muted">
        Varje modul har en kort film (ca 30–60 sekunder). Tryck Spela film i den
        mörka rutan — då rullar scenerna med progress och paus, ungefär som en
        riktig video. Under tipsen finns konkreta råd om upphandling och
        entreprenörer.
      </p>

      <section>
        <h2 className="text-xl font-bold text-foreground">AI-filmer om funktionerna</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Om du bara ser text utan mörk filmruta: ladda om sidan. Saknas ljud och
          riktig video är det avsiktligt i demo — samma ruta kan senare visa en
          inspelad mp4-fil.
        </p>
        <ul className="mt-6 grid items-stretch gap-5 sm:grid-cols-2">
          {guideFilmer.map((film) => (
            <li key={film.id} className="h-full">
              <KortGuideFilm film={film} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tips och råd</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Praktiska punkter för styrelsen — särskilt vid upphandling och val av
              entreprenör.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["alla", "Alla"],
                ["upphandling", "Upphandling"],
                ["entreprenor", "Entreprenörer"],
              ] as const
            ).map(([id, etikett]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTipsFilter(id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  tipsFilter === id
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted hover:border-primary/50"
                }`}
              >
                {etikett}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 space-y-4">
          {filtreradeTips.map((tips) => (
            <li
              key={tips.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                {tips.kategori === "upphandling" ? "Upphandling" : "Entreprenörer"}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{tips.titel}</h3>
              <p className="mt-2 text-sm text-muted">{tips.ingress}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
                {tips.punkter.map((punkt) => (
                  <li key={punkt}>{punkt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
