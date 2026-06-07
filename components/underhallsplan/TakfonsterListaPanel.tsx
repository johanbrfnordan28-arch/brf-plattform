"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import { TakfonsterStorlekValjare } from "@/components/underhallsplan/TakfonsterStorlekValjare";
import {
  beraknaTakfonsterKombinationSumma,
  beraknaTakfonsterPris,
  beraknaTakfonsterSingelSumma,
  normaliseraTakfonsterData,
  normaliseraTakfonsterKombinationPost,
  normaliseraTakfonsterSingelPost,
  skapaTomTakfonsterKombinationPost,
  skapaTomTakfonsterSingelPost,
  summeraTakfonsterData,
  takfonsterIRadAlternativ,
  takfonsterKombinationStorlekEtikett,
  type TakfonsterData,
  type TakfonsterKombinationPost,
  type TakfonsterSingelPost,
} from "@/components/underhallsplan/takfonster";

type TakfonsterListaPanelProps = {
  data: TakfonsterData;
  onChange: (data: TakfonsterData) => void;
};

export function TakfonsterListaPanel({
  data,
  onChange,
}: TakfonsterListaPanelProps) {
  const d = normaliseraTakfonsterData(data);
  const { totaltKr } = beraknaTakfonsterPris(d);

  function uppdatera(patch: Partial<TakfonsterData>) {
    onChange(normaliseraTakfonsterData({ ...d, ...patch }));
  }

  function uppdateraSingel(id: string, patch: Partial<TakfonsterSingelPost>) {
    uppdatera({
      singel: d.singel.map((p) =>
        p.id === id ? normaliseraTakfonsterSingelPost({ ...p, ...patch }) : p,
      ),
    });
  }

  function uppdateraKombination(
    id: string,
    patch: Partial<TakfonsterKombinationPost>,
  ) {
    uppdatera({
      kombinationer: d.kombinationer.map((p) =>
        p.id === id
          ? normaliseraTakfonsterKombinationPost({ ...p, ...patch })
          : p,
      ),
    });
  }

  return (
    <div className="space-y-6">
      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3 sm:p-4">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Del 1 — Singelfönster
        </legend>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Ett takfönster per enhet. Välj mått, ange antal och prissätt med kr/st.
        </p>

        {d.singel.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
            Inga singelfönster — lägg till första raden.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {d.singel.map((post, index) => (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Singel {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      uppdatera({
                        singel: d.singel.filter((p) => p.id !== post.id),
                      })
                    }
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
                        uppdateraSingel(post.id, { namn: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <TakfonsterStorlekValjare
                      storlekId={post.storlekId}
                      breddMm={post.breddMm}
                      hojdMm={post.hojdMm}
                      onChange={(patch) =>
                        uppdateraSingel(post.id, {
                          storlekId: patch.storlekId,
                          breddMm: patch.breddMm,
                          hojdMm: patch.hojdMm,
                        })
                      }
                    />
                  </div>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Antal</span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={post.antal}
                        onChange={(e) =>
                          uppdateraSingel(post.id, { antal: e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                      <span className="shrink-0 text-xs text-muted">st</span>
                    </div>
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">
                      Enhetspris
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={post.enhetsprisKr}
                        onChange={(e) =>
                          uppdateraSingel(post.id, {
                            enhetsprisKr: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                      <span className="shrink-0 text-xs text-muted">kr/st</span>
                    </div>
                  </label>
                </div>

                {beraknaTakfonsterSingelSumma(post) > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    Radsumma:{" "}
                    <span className="font-medium text-foreground">
                      {formatKr(beraknaTakfonsterSingelSumma(post))}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() =>
            uppdatera({
              singel: [
                ...d.singel,
                skapaTomTakfonsterSingelPost(
                  d.singel.length === 0
                    ? "Singelfönster 1"
                    : `Singelfönster ${d.singel.length + 1}`,
                ),
              ],
            })
          }
          className="mt-3 w-full rounded-lg border border-dashed border-primary/40 bg-white px-3 py-2.5 text-sm font-medium text-primary hover:bg-[#eef6f0]/50"
        >
          + Lägg till singelfönster
        </button>
      </fieldset>

      <fieldset className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3 sm:p-4">
        <legend className="px-1 text-xs font-semibold text-primary-dark">
          Del 2 — Kombinationer
        </legend>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Flera fönster monterade i rad som en enhet. Välj antal fönster i rad och
          modulmått per fönster — total bredd beräknas automatiskt. Prissätt
          varje kombination med kr/st (hela kombinationen).
        </p>

        {d.kombinationer.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
            Inga kombinationer — lägg till första raden.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {d.kombinationer.map((post, index) => {
              const norm = normaliseraTakfonsterKombinationPost(post);
              return (
                <li
                  key={post.id}
                  className="rounded-lg border border-border bg-white p-3 sm:p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      Kombination {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        uppdatera({
                          kombinationer: d.kombinationer.filter(
                            (p) => p.id !== post.id,
                          ),
                        })
                      }
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
                          uppdateraKombination(post.id, {
                            namn: e.target.value,
                          })
                        }
                        placeholder="T.ex. Takband norr"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs font-medium text-muted">
                        Fönster i rad
                      </span>
                      <select
                        value={post.fonsterIRad}
                        onChange={(e) =>
                          uppdateraKombination(post.id, {
                            fonsterIRad: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        {takfonsterIRadAlternativ.map((alt) => (
                          <option key={alt.id} value={alt.id}>
                            {alt.etikett}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="sm:col-span-2">
                      <TakfonsterStorlekValjare
                        storlekId={post.modulStorlekId}
                        breddMm={post.breddMm}
                        hojdMm={post.hojdMm}
                        etikett="Modul per fönster (yttre karm)"
                        hjalpText=""
                        onChange={(patch) =>
                          uppdateraKombination(post.id, {
                            modulStorlekId: patch.storlekId,
                            breddMm: patch.breddMm,
                            hojdMm: patch.hojdMm,
                          })
                        }
                      />
                    </div>

                    {norm.breddMm.trim() && norm.hojdMm.trim() && (
                      <p className="text-xs text-muted sm:col-span-2">
                        Kombination:{" "}
                        <span className="font-medium text-foreground">
                          {takfonsterKombinationStorlekEtikett(norm)}
                        </span>
                      </p>
                    )}

                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Antal kombinationer
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={post.antal}
                          onChange={(e) =>
                            uppdateraKombination(post.id, {
                              antal: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                        <span className="shrink-0 text-xs text-muted">st</span>
                      </div>
                    </label>

                    <label className="block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Enhetspris
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={post.enhetsprisKr}
                          onChange={(e) =>
                            uppdateraKombination(post.id, {
                              enhetsprisKr: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                        <span className="shrink-0 text-xs text-muted">
                          kr/komb.
                        </span>
                      </div>
                    </label>
                  </div>

                  {beraknaTakfonsterKombinationSumma(post) > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      Radsumma:{" "}
                      <span className="font-medium text-foreground">
                        {formatKr(beraknaTakfonsterKombinationSumma(post))}
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
            uppdatera({
              kombinationer: [
                ...d.kombinationer,
                skapaTomTakfonsterKombinationPost(
                  d.kombinationer.length === 0
                    ? "Kombination 1"
                    : `Kombination ${d.kombinationer.length + 1}`,
                ),
              ],
            })
          }
          className="mt-3 w-full rounded-lg border border-dashed border-primary/40 bg-white px-3 py-2.5 text-sm font-medium text-primary hover:bg-[#eef6f0]/50"
        >
          + Lägg till kombination
        </button>
      </fieldset>

      {totaltKr > 0 && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 px-3 py-2 text-sm">
          <span className="font-semibold text-primary-dark">
            Totalt takfönster: {formatKr(totaltKr)}
          </span>
        </p>
      )}

      {(d.singel.length > 0 || d.kombinationer.length > 0) && (
        <ListaSummeringPanel
          titel="Summering takfönster"
          rader={summeraTakfonsterData(d)}
        />
      )}
    </div>
  );
}
