"use client";

import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  beraknaFasadSockelSegmentKvm,
  beraknaFasadSockelTotalKvm,
  normaliseraFasadSockelPoster,
  skapaTomFasadSockelSegment,
  summeraFasadSockelPoster,
  type FasadSockelSegment,
} from "@/components/underhallsplan/fasad-sockel";

type FasadSockelPanelProps = {
  poster: FasadSockelSegment[];
  onChange: (poster: FasadSockelSegment[]) => void;
};

export function FasadSockelPanel({ poster, onChange }: FasadSockelPanelProps) {
  const lista = normaliseraFasadSockelPoster(poster);
  const totalKvm = beraknaFasadSockelTotalKvm(lista);

  function uppdatera(id: string, patch: Partial<FasadSockelSegment>) {
    onChange(
      lista.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Sockelhöjd varierar ofta längs fasaden. Ange flera partier med höjd (mm)
        och löpmeter — ytan beräknas som höjd × längd (m²).
      </p>

      {lista.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga partier — lägg till första raden.
        </p>
      ) : (
        <ul className="space-y-3">
          {lista.map((post, index) => {
            const kvm = beraknaFasadSockelSegmentKvm(post);
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Parti {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(lista.filter((p) => p.id !== post.id))
                    }
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Plats (valfritt)
                    </span>
                    <input
                      type="text"
                      value={post.namn}
                      onChange={(e) =>
                        uppdatera(post.id, { namn: e.target.value })
                      }
                      placeholder="T.ex. Gata norr, garage"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Höjd sockel (mm)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={post.hojdMm}
                      onChange={(e) =>
                        uppdatera(post.id, { hojdMm: e.target.value })
                      }
                      placeholder="t.ex. 600"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Löpmeter
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={post.lopmeter}
                      onChange={(e) =>
                        uppdatera(post.id, { lopmeter: e.target.value })
                      }
                      placeholder="t.ex. 24"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                {kvm > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    Partiyta:{" "}
                    <span className="font-medium text-foreground">
                      {(Math.round(kvm * 100) / 100).toLocaleString("sv-SE")}{" "}
                      m²
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...lista,
            skapaTomFasadSockelSegment(
              lista.length === 0 ? "Sockel 1" : `Sockel ${lista.length + 1}`,
            ),
          ])
        }
        className="w-full rounded-lg border border-dashed border-primary/40 bg-white px-3 py-2.5 text-sm font-medium text-primary hover:bg-[#eef6f0]/50"
      >
        + Lägg till parti
      </button>

      {totalKvm > 0 && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 px-3 py-2 text-sm font-semibold text-primary-dark">
          Total sockelyta: {Math.round(totalKvm * 10) / 10} m²
        </p>
      )}

      {lista.some((p) => p.hojdMm.trim() || p.lopmeter.trim()) && (
        <ListaSummeringPanel
          titel="Summering sockel"
          rader={summeraFasadSockelPoster(lista)}
        />
      )}
    </div>
  );
}
