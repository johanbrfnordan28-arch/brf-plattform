"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { MedlemstakterrassPrisPanel } from "@/components/underhallsplan/MedlemstakterrassPrisPanel";
import { TakterrassPostInnehall } from "@/components/underhallsplan/TakterrassPostInnehall";
import { summeraMedlemstakterrassMangder } from "@/components/underhallsplan/medlemstakterrass-pris";
import {
  skapaTomMedlemstakterrassPost,
  type MedlemstakterrassPost,
} from "@/components/underhallsplan/medlemstakterrass";

type MedlemstakterrassPanelProps = {
  poster: MedlemstakterrassPost[];
  onChange: (poster: MedlemstakterrassPost[]) => void;
};

export function MedlemstakterrassPanel({
  poster,
  onChange,
}: MedlemstakterrassPanelProps) {
  function uppdateraPost(id: string, patch: Partial<MedlemstakterrassPost>) {
    onChange(poster.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  function laggTill() {
    onChange([...poster, skapaTomMedlemstakterrassPost()]);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Medlemstakterrass — tillhör lägenhet. Samma upplägg som gemensam terrass
        (väggar, sockel, papp/keramik, avvattning) men utan belysning och el.
        Lägg till flera om föreningen har terrasser med olika mått.
      </p>

      {poster.length === 0 ? (
        <p className="text-sm text-muted">Ingen medlemstakterrass ännu.</p>
      ) : null}

      {poster.map((post, index) => (
        <article
          key={post.id}
          className="rounded-xl border border-primary/25 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary-dark">
              Terrass {index + 1}
            </p>
            <button
              type="button"
              onClick={() => taBort(post.id)}
              className="text-xs text-red-700 underline hover:no-underline"
            >
              Ta bort
            </button>
          </div>
          <label className="mt-2 block text-sm">
            <span className="text-xs font-medium text-muted">
              Benämning (valfritt)
            </span>
            <input
              type="text"
              value={post.benamning}
              onChange={(e) =>
                uppdateraPost(post.id, { benamning: e.target.value })
              }
              placeholder="t.ex. Lgh 1204 terrass"
              className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-3">
            <TakterrassPostInnehall
              variant="medlem"
              data={post}
              onChange={(data) =>
                uppdateraPost(post.id, {
                  ...post,
                  ...(data as typeof post),
                })
              }
            />
          </div>
          {(() => {
            const mangdRader = summeraMedlemstakterrassMangder(post);
            if (mangdRader.length === 0) return null;
            return (
              <div className="mt-3">
                <ListaSummeringPanel
                  titel="Summering mängder"
                  rader={mangdRader}
                />
              </div>
            );
          })()}
          <div className="mt-3">
            <MedlemstakterrassPrisPanel
              data={post}
              onChange={(data) =>
                uppdateraPost(post.id, { ...post, ...data })
              }
            />
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={laggTill}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
      >
        + Lägg till terrass
      </button>
    </div>
  );
}
