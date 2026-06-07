"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  skapaTomVentilationExtraPost,
  summeraVentilationExtraPoster,
  normaliseraVentilationExtraPost,
  ventilationExtraTyper,
  type VentilationExtraPost,
  type VentilationExtraTypId,
} from "@/components/underhallsplan/ventilation-extra";

type VentilationExtraPanelProps = {
  poster: VentilationExtraPost[];
  onChange: (poster: VentilationExtraPost[]) => void;
};

export function VentilationExtraPanel({
  poster,
  onChange,
}: VentilationExtraPanelProps) {
  const [nyTyp, setNyTyp] = useState<VentilationExtraTypId>("vindflakt");

  function uppdateraPost(id: string, patch: Partial<VentilationExtraPost>) {
    onChange(
      poster.map((p) =>
        p.id === id
          ? normaliseraVentilationExtraPost({ ...p, ...patch })
          : p,
      ),
    );
  }

  function läggTill() {
    onChange([...poster, skapaTomVentilationExtraPost(nyTyp)]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  const valdTyp = ventilationExtraTyper.find((t) => t.id === nyTyp);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Lägg till fläktar som inte ingår i huvudsystemet — t.ex. vindfläktar,
        rökgasfläktar vid öppen spis eller fläktar i garage och källare. Ange
        antal så att OVK och underhåll blir tydligt.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga extra fläktar registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const typInfo = ventilationExtraTyper.find((t) => t.id === post.typ);
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary-dark">
                    Fläkt {index + 1}
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
                    <span className="text-xs font-medium text-muted">Typ</span>
                    <select
                      value={post.typ}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          typ: e.target.value as VentilationExtraTypId,
                          typAnnanText:
                            e.target.value === "annat" ? post.typAnnanText : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {ventilationExtraTyper.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.etikett}
                        </option>
                      ))}
                    </select>
                    {typInfo?.beskrivning && (
                      <span className="mt-1 block text-xs text-muted">
                        {typInfo.beskrivning}
                      </span>
                    )}
                  </label>

                  {post.typ === "annat" && (
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs font-medium text-muted">
                        Beskriv fläkten
                      </span>
                      <input
                        type="text"
                        value={post.typAnnanText}
                        onChange={(e) =>
                          uppdateraPost(post.id, { typAnnanText: e.target.value })
                        }
                        placeholder="T.ex. fläkt i soprum"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  )}

                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Plats / kommentar (valfritt)
                    </span>
                    <input
                      type="text"
                      value={post.plats}
                      onChange={(e) =>
                        uppdateraPost(post.id, { plats: e.target.value })
                      }
                      placeholder="T.ex. Vind hus A, öppen spis trapphus 2"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Antal</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={post.antal}
                      onChange={(e) =>
                        uppdateraPost(post.id, { antal: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Lägg till ventilation
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm">
            <span className="text-xs font-medium text-muted">Typ</span>
            <select
              value={nyTyp}
              onChange={(e) => setNyTyp(e.target.value as VentilationExtraTypId)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {ventilationExtraTyper.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.etikett}
                </option>
              ))}
            </select>
            {valdTyp?.beskrivning && (
              <span className="mt-1 block text-xs text-muted">
                {valdTyp.beskrivning}
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={läggTill}
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Lägg till fläkt
          </button>
        </div>
      </div>

      {poster.length > 0 && (
        <ListaSummeringPanel
          titel="Sammanfattning fläktar"
          rader={summeraVentilationExtraPoster(poster)}
        />
      )}
    </div>
  );
}
