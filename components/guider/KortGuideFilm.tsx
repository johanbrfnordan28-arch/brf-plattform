"use client";

import {
  InformationsFilmSpelare,
  type InformationsFilmScen,
} from "@/components/InformationsFilmSpelare";
import type { GuideFilm } from "@/components/guider/guider";

type KortGuideFilmProps = {
  film: GuideFilm;
};

export function KortGuideFilm({ film }: KortGuideFilmProps) {
  const scener: InformationsFilmScen[] = film.scener.map((s) => ({
    titel: s.titel,
    text: s.text,
  }));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-[#eef6f0] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-primary-dark">
            {film.modul}
          </span>
          <span className="text-xs text-muted">{film.längd} · kort film</span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-foreground">{film.titel}</h3>
        <p className="mt-1 text-sm text-muted">{film.beskrivning}</p>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {film.videoUrl ? (
          <video
            className="aspect-video w-full rounded-xl border border-border bg-black"
            controls
            playsInline
            preload="metadata"
            src={film.videoUrl}
          >
            <track kind="captions" />
            Din webbläsare stödjer inte videouppspelning.
          </video>
        ) : (
          <InformationsFilmSpelare scener={scener} scenMs={5500} />
        )}
        <p className="mt-3 text-center text-xs text-muted">
          {film.videoUrl
            ? "Inspelad video."
            : "Tryck Spela film — scenerna rullar som en kort demo (ca " +
              film.längd.replace("ca ", "") +
              ")."}
        </p>
      </div>
    </article>
  );
}
