"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  hamtaStamventilModellDef,
  normaliseraStamventilPost,
  skapaTomStamventilPost,
  stamventilModellKategorier,
  stamventilModellerPerKategori,
  stamventilStorlekar,
  summeraStamventilPoster,
  type StamventilModellId,
  type StamventilPost,
  type StamventilStorlekId,
} from "@/components/underhallsplan/stamventiler";

type StamventilerPanelProps = {
  poster: StamventilPost[];
  onChange: (poster: StamventilPost[]) => void;
};

function StamventilModellSelect({
  value,
  onChange,
  id,
}: {
  value: StamventilModellId;
  onChange: (modell: StamventilModellId) => void;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as StamventilModellId)}
      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
    >
      {stamventilModellKategorier.map((kategori) => (
        <optgroup key={kategori.id} label={kategori.etikett}>
          {stamventilModellerPerKategori(kategori.id).map((m) => (
            <option key={m.id} value={m.id}>
              {m.etikett}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function StamventilerPanel({ poster, onChange }: StamventilerPanelProps) {
  const [nyModell, setNyModell] = useState<StamventilModellId>("ta-stad");

  function uppdateraPost(id: string, patch: Partial<StamventilPost>) {
    onChange(
      poster.map((p) =>
        p.id === id ? normaliseraStamventilPost({ ...p, ...patch }) : p,
      ),
    );
  }

  function läggTill() {
    onChange([...poster, skapaTomStamventilPost(nyModell)]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  const valdModell = hamtaStamventilModellDef(nyModell);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Välj typ av ventil: injusteringsventil reglerar flödet (t.ex. TA-STAD),
        styrventil reglerar temperatur (t.ex. med ställdon). Ange storlek, antal
        och plats.
      </p>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga stamventiler registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const modellInfo = hamtaStamventilModellDef(post.modell);
            const kategoriInfo = modellInfo
              ? stamventilModellKategorier.find((k) => k.id === modellInfo.kategori)
              : undefined;
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-primary-dark">
                      Ventil {index + 1}
                    </span>
                    {kategoriInfo && (
                      <span className="mt-0.5 block text-xs text-muted">
                        {kategoriInfo.etikett}
                      </span>
                    )}
                  </div>
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
                    <span className="text-xs font-medium text-muted">Modell</span>
                    <StamventilModellSelect
                      value={post.modell}
                      onChange={(modell) =>
                        uppdateraPost(post.id, {
                          modell,
                          modellAnnanText:
                            modell === "annat" ? post.modellAnnanText : "",
                        })
                      }
                    />
                    {modellInfo?.beskrivning && (
                      <span className="mt-1 block text-xs text-muted">
                        {modellInfo.beskrivning}
                      </span>
                    )}
                  </label>

                  {post.modell === "annat" && (
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs font-medium text-muted">
                        Ange modell
                      </span>
                      <input
                        type="text"
                        value={post.modellAnnanText}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            modellAnnanText: e.target.value,
                          })
                        }
                        placeholder="T.ex. fabrikat och typbeteckning"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  )}

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Storlek</span>
                    <select
                      value={post.storlek}
                      onChange={(e) =>
                        uppdateraPost(post.id, {
                          storlek: e.target.value as StamventilStorlekId,
                          storlekAnnanText:
                            e.target.value === "annat" ? post.storlekAnnanText : "",
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {stamventilStorlekar.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.etikett}
                        </option>
                      ))}
                    </select>
                  </label>

                  {post.storlek === "annat" && (
                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Ange storlek
                      </span>
                      <input
                        type="text"
                        value={post.storlekAnnanText}
                        onChange={(e) =>
                          uppdateraPost(post.id, {
                            storlekAnnanText: e.target.value,
                          })
                        }
                        placeholder="T.ex. DN28"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  )}

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
                      placeholder="T.ex. Stam A, undercentral"
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
          Lägg till stamventil
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm">
            <span className="text-xs font-medium text-muted">Modell</span>
            <StamventilModellSelect
              value={nyModell}
              onChange={setNyModell}
            />
            {valdModell?.beskrivning && (
              <span className="mt-1 block text-xs text-muted">
                {valdModell.beskrivning}
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={läggTill}
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Lägg till ventil
          </button>
        </div>
      </div>

      {poster.length > 0 && (
        <ListaSummeringPanel
          titel="Summering stamventiler"
          rader={summeraStamventilPoster(poster)}
        />
      )}
    </div>
  );
}
