"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { TakterrassPostInnehall } from "@/components/underhallsplan/TakterrassPostInnehall";
import { TakterrassPrisPanel } from "@/components/underhallsplan/TakterrassPrisPanel";
import { summeraTakterrassMangder } from "@/components/underhallsplan/takterrass-pris";
import {
  skapaTomTakterrassPost,
  type TakterrassPost,
} from "@/components/underhallsplan/takterrass";

type TakterrassPanelProps = {
  poster: TakterrassPost[];
  onChange: (poster: TakterrassPost[]) => void;
};

export function TakterrassPanel({ poster, onChange }: TakterrassPanelProps) {
  function uppdateraPost(id: string, patch: Partial<TakterrassPost>) {
    onChange(
      poster.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  function laggTill() {
    onChange([...poster, skapaTomTakterrassPost()]);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Gemensam takterrass — plåtklädda väggar (eller eget material), sockel,
        papp eller keramik med tätskikt, samt avvattning. Lägg till flera
        terrasser om de har olika mått eller lägen.
      </p>

      {poster.length === 0 ? (
        <p className="text-sm text-muted">Ingen terrass registrerad ännu.</p>
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
              placeholder="t.ex. Terrass mot innergård"
              className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-3">
            <TakterrassPostInnehall
              variant="gemensam"
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
            const mangdRader = summeraTakterrassMangder(post);
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
            <TakterrassPrisPanel
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
