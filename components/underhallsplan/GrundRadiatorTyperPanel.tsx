"use client";

import {
  formateraRadiatorTypPost,
  radiatorHojdAlternativMm,
  radiatorLangdAlternativMm,
  radiatorPanelTyper,
  skapaTomRadiatorTypPost,
  type RadiatorPanelTypId,
  type RadiatorTypPost,
} from "@/components/underhallsplan/radiator-typer";

type Props = {
  poster: RadiatorTypPost[];
  onChange: (next: RadiatorTypPost[]) => void;
};

function uppdatera(
  lista: RadiatorTypPost[],
  id: string,
  patch: Partial<RadiatorTypPost>,
): RadiatorTypPost[] {
  return lista.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

export function GrundRadiatorTyperPanel({ poster, onChange }: Props) {
  return (
    <div className="mt-6 space-y-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-700 dark:bg-stone-900/40">
      <div>
        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Radiatortyper i fastigheten
        </h4>
        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
          Enligt Purmo, Thermopanel och Radson anges panelradiatorer som{" "}
          <strong className="font-medium">typ</strong> (11/21/22/33 — styr
          djupet), <strong className="font-medium">höjd</strong> och{" "}
          <strong className="font-medium">längd</strong> i mm. Tjocklek väljs
          inte separat. Dessa typer kan sedan väljas när du registrerar
          radiatorer på värmestammar.
        </p>
      </div>

      {poster.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 bg-white px-3 py-4 text-sm text-stone-500 dark:border-stone-600 dark:bg-stone-950/40 dark:text-stone-400">
          Inga radiatortyper ännu. Lägg till de storlekar som finns i husen.
        </p>
      ) : (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const panelInfo = radiatorPanelTyper.find(
              (t) => t.id === post.panelTyp,
            );
            return (
              <li
                key={post.id}
                className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950/50"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Typ {index + 1}
                    {post.namn || post.hojdMm || post.langdMm ? (
                      <span className="ml-2 text-stone-700 dark:text-stone-300">
                        — {formateraRadiatorTypPost(post)}
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(poster.filter((p) => p.id !== post.id))
                    }
                    className="shrink-0 text-xs font-medium text-red-700 hover:underline dark:text-red-400"
                  >
                    Ta bort
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Paneltyp (djup)
                    <select
                      value={post.panelTyp}
                      onChange={(e) =>
                        onChange(
                          uppdatera(poster, post.id, {
                            panelTyp: e.target.value as RadiatorPanelTypId,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                    >
                      {radiatorPanelTyper.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.etikett}
                          {t.ungefardjupMm ? ` · ${t.ungefardjupMm}` : ""}
                        </option>
                      ))}
                    </select>
                    {panelInfo?.beskrivning ? (
                      <span className="mt-1 block text-[11px] font-normal text-stone-500 dark:text-stone-500">
                        {panelInfo.beskrivning}
                      </span>
                    ) : null}
                  </label>

                  {post.panelTyp === "annat" ? (
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                      Egen typbeteckning
                      <input
                        type="text"
                        value={post.panelTypAnnan}
                        onChange={(e) =>
                          onChange(
                            uppdatera(poster, post.id, {
                              panelTypAnnan: e.target.value,
                            }),
                          )
                        }
                        placeholder="t.ex. Typ 10"
                        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                      />
                    </label>
                  ) : null}

                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Höjd (mm)
                    <select
                      value={
                        radiatorHojdAlternativMm.includes(
                          post.hojdMm as (typeof radiatorHojdAlternativMm)[number],
                        )
                          ? post.hojdMm
                          : post.hojdMm
                            ? "__egen__"
                            : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange(
                          uppdatera(poster, post.id, {
                            hojdMm: v === "__egen__" ? "" : v,
                          }),
                        );
                      }}
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                    >
                      <option value="">Välj höjd…</option>
                      {radiatorHojdAlternativMm.map((h) => (
                        <option key={h} value={h}>
                          {h} mm
                        </option>
                      ))}
                      <option value="__egen__">Egen höjd…</option>
                    </select>
                    {!radiatorHojdAlternativMm.includes(
                      post.hojdMm as (typeof radiatorHojdAlternativMm)[number],
                    ) ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={post.hojdMm}
                        onChange={(e) =>
                          onChange(
                            uppdatera(poster, post.id, {
                              hojdMm: e.target.value,
                            }),
                          )
                        }
                        placeholder="mm"
                        className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                      />
                    ) : null}
                  </label>

                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Längd (mm)
                    <select
                      value={
                        radiatorLangdAlternativMm.includes(
                          post.langdMm as (typeof radiatorLangdAlternativMm)[number],
                        )
                          ? post.langdMm
                          : post.langdMm
                            ? "__egen__"
                            : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange(
                          uppdatera(poster, post.id, {
                            langdMm: v === "__egen__" ? "" : v,
                          }),
                        );
                      }}
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                    >
                      <option value="">Välj längd…</option>
                      {radiatorLangdAlternativMm.map((l) => (
                        <option key={l} value={l}>
                          {l} mm
                        </option>
                      ))}
                      <option value="__egen__">Egen längd…</option>
                    </select>
                    {!radiatorLangdAlternativMm.includes(
                      post.langdMm as (typeof radiatorLangdAlternativMm)[number],
                    ) ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={post.langdMm}
                        onChange={(e) =>
                          onChange(
                            uppdatera(poster, post.id, {
                              langdMm: e.target.value,
                            }),
                          )
                        }
                        placeholder="mm"
                        className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                      />
                    ) : null}
                  </label>

                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Fabrikat (valfritt)
                    <input
                      type="text"
                      value={post.fabrikat}
                      onChange={(e) =>
                        onChange(
                          uppdatera(poster, post.id, {
                            fabrikat: e.target.value,
                          }),
                        )
                      }
                      placeholder="t.ex. Purmo Compact"
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                    />
                  </label>

                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 sm:col-span-2 lg:col-span-1">
                    Eget namn (valfritt)
                    <input
                      type="text"
                      value={post.namn}
                      onChange={(e) =>
                        onChange(
                          uppdatera(poster, post.id, { namn: e.target.value }),
                        )
                      }
                      placeholder="t.ex. Vardagsrum standard"
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...poster, skapaTomRadiatorTypPost()])}
        className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
      >
        + Lägg till radiatortyp
      </button>
    </div>
  );
}
