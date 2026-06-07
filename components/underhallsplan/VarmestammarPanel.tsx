"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  normaliseraVarmestamPost,
  skapaTomVarmestamPost,
  summeraVarmestamPoster,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";

type VarmestammarPanelProps = {
  poster: VarmestamPost[];
  onChange: (poster: VarmestamPost[]) => void;
};

export function VarmestammarPanel({ poster, onChange }: VarmestammarPanelProps) {
  function uppdateraPost(id: string, patch: Partial<VarmestamPost>) {
    onChange(
      poster.map((p) =>
        p.id === id ? normaliseraVarmestamPost({ ...p, ...patch }) : p,
      ),
    );
  }

  function läggTill() {
    const nr = poster.length + 1;
    onChange([
      ...poster,
      skapaTomVarmestamPost(
        poster.length === 0 ? "Värmestam" : `Värmestam ${nr}`,
      ),
    ]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Registrera värmestammar — vertikal stamledning (våning till våning) och
        horisontell fördelning per plan. Ange löpmeter per stam eller avsnitt.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga värmestammar registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => (
            <li
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-dark">
                  Värmestam {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => taBort(post.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-muted">
                    Namn / plats (valfritt)
                  </span>
                  <input
                    type="text"
                    value={post.namn}
                    onChange={(e) =>
                      uppdateraPost(post.id, { namn: e.target.value })
                    }
                    placeholder="T.ex. Stam A, Trapphus 1"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Vertikal ledning
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Stamrör våning till våning
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={post.vertikalLopmeter}
                    onChange={(e) =>
                      uppdateraPost(post.id, { vertikalLopmeter: e.target.value })
                    }
                    placeholder="m"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Horisontell ledning
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Fördelning per plan / gren
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={post.horisontellLopmeter}
                    onChange={(e) =>
                      uppdateraPost(post.id, {
                        horisontellLopmeter: e.target.value,
                      })
                    }
                    placeholder="m"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={läggTill}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        + Lägg till värmestam
      </button>

      {poster.length > 0 && (
        <ListaSummeringPanel
          titel="Summering värmestammar"
          rader={summeraVarmestamPoster(poster)}
        />
      )}
    </div>
  );
}
