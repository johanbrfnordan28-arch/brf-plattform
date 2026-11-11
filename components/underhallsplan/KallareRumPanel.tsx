"use client";

import { useMemo, useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  kallareInnehallTyper,
  kallareMangdEnheter,
  kallareRumRubrik,
  kallareRumTyper,
  kallareSammanstallningDetaljer,
  normaliseraKallareRumPost,
  skapaTomKallareInnehallPost,
  skapaTomKallareRumPost,
  summeraKallareRumPoster,
  type KallareInnehallMangdEnhet,
  type KallareInnehallTypId,
  type KallareRumPost,
  type KallareRumTypId,
} from "@/components/underhallsplan/kallare-rum";

type KallareRumPanelProps = {
  poster: KallareRumPost[];
  onChange: (poster: KallareRumPost[]) => void;
};

export function KallareRumPanel({ poster, onChange }: KallareRumPanelProps) {
  const rum = poster.map(normaliseraKallareRumPost);
  const [filter, setFilter] = useState<KallareInnehallTypId[]>([]);
  const [visaSammanstallning, setVisaSammanstallning] = useState(false);

  const aktivaInnehallstyper = useMemo(() => {
    const satta = new Set<KallareInnehallTypId>();
    for (const r of rum) {
      for (const i of r.innehall) satta.add(i.typ);
    }
    return kallareInnehallTyper.filter((t) => satta.has(t.id));
  }, [rum]);

  function spara(nasta: KallareRumPost[]) {
    onChange(nasta.map((p, i) => normaliseraKallareRumPost(p, i)));
  }

  function uppdateraRum(id: string, patch: Partial<KallareRumPost>) {
    spara(rum.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function laggTillRum() {
    spara([...rum, skapaTomKallareRumPost()]);
  }

  function taBortRum(id: string) {
    spara(rum.filter((r) => r.id !== id));
  }

  function laggTillInnehall(rumId: string, typ: KallareInnehallTypId) {
    const r = rum.find((x) => x.id === rumId);
    if (!r) return;
    uppdateraRum(rumId, {
      innehall: [...r.innehall, skapaTomKallareInnehallPost(typ)],
    });
  }

  function uppdateraInnehall(
    rumId: string,
    innehallId: string,
    patch: Partial<KallareRumPost["innehall"][number]>,
  ) {
    const r = rum.find((x) => x.id === rumId);
    if (!r) return;
    uppdateraRum(rumId, {
      innehall: r.innehall.map((i) =>
        i.id === innehallId ? { ...i, ...patch } : i,
      ),
    });
  }

  function taBortInnehall(rumId: string, innehallId: string) {
    const r = rum.find((x) => x.id === rumId);
    if (!r) return;
    uppdateraRum(rumId, {
      innehall: r.innehall.filter((i) => i.id !== innehallId),
    });
  }

  function toggleFilter(typ: KallareInnehallTypId) {
    setFilter((prev) =>
      prev.includes(typ) ? prev.filter((t) => t !== typ) : [...prev, typ],
    );
  }

  const summering = summeraKallareRumPoster(
    rum,
    filter.length > 0 ? filter : undefined,
  );
  const detaljer = kallareSammanstallningDetaljer(
    rum,
    filter.length > 0 ? filter : undefined,
  );

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Bygg upp källaren rum för rum. Välj placering (t.ex. skyddsrum eller
        barnvagnsförråd) och lägg till vad rummet innehåller — armaturer,
        träförråd, gallerförråd m.m. Enhet per innehåll väljs på raden, inte
        som gemensam enhet för hela källaren.
      </p>

      {rum.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-4 text-center text-xs text-muted">
          Inga rum registrerade — lägg till nedan.
        </p>
      ) : (
        <ul className="space-y-3">
          {rum.map((post, index) => (
            <li
              key={post.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-dark">
                  {kallareRumRubrik(post) || `Rum ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => taBortRum(post.id)}
                  className="text-xs text-muted hover:text-red-700"
                >
                  Ta bort rum
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Placering / rumstyp
                  </span>
                  <select
                    value={post.typ}
                    onChange={(e) =>
                      uppdateraRum(post.id, {
                        typ: e.target.value as KallareRumTypId,
                        typAnnan:
                          e.target.value === "annat" ? post.typAnnan : "",
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    {kallareRumTyper.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.etikett}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[11px] text-muted">
                    {
                      kallareRumTyper.find((t) => t.id === post.typ)
                        ?.beskrivning
                    }
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Eget namn (valfritt)
                  </span>
                  <input
                    type="text"
                    value={post.namn}
                    onChange={(e) =>
                      uppdateraRum(post.id, { namn: e.target.value })
                    }
                    placeholder="t.ex. Skyddsrum hus A"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
                {post.typ === "annat" && (
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Ange rumstyp
                    </span>
                    <input
                      type="text"
                      value={post.typAnnan}
                      onChange={(e) =>
                        uppdateraRum(post.id, { typAnnan: e.target.value })
                      }
                      placeholder="t.ex. föreningslokal"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </div>

              <p className="mt-4 text-xs font-semibold text-primary-dark">
                Innehåll i rummet
              </p>
              {post.innehall.length === 0 ? (
                <p className="mt-1 text-[11px] text-muted">
                  Inget innehåll ännu — lägg till armaturer, förråd m.m. nedan.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {post.innehall.map((rad) => (
                    <li
                      key={rad.id}
                      className="rounded-md border border-border/80 bg-[#fafcfa] p-2.5"
                    >
                      <div className="grid gap-2 sm:grid-cols-3">
                        <label className="block text-sm sm:col-span-1">
                          <span className="text-[11px] text-muted">Typ</span>
                          <select
                            value={rad.typ}
                            onChange={(e) => {
                              const typ = e.target.value as KallareInnehallTypId;
                              const def = kallareInnehallTyper.find(
                                (t) => t.id === typ,
                              );
                              uppdateraInnehall(post.id, rad.id, {
                                typ,
                                typAnnan: typ === "annat" ? rad.typAnnan : "",
                                mangdEnhet:
                                  def?.defaultEnhet ?? rad.mangdEnhet,
                              });
                            }}
                            className="mt-0.5 w-full rounded border border-border bg-white px-2 py-1.5 text-sm"
                          >
                            {kallareInnehallTyper.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.etikett}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm">
                          <span className="text-[11px] text-muted">Mängd</span>
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={rad.mangd}
                            onChange={(e) =>
                              uppdateraInnehall(post.id, rad.id, {
                                mangd: e.target.value,
                              })
                            }
                            className="mt-0.5 w-full rounded border border-border bg-white px-2 py-1.5 text-sm"
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="text-[11px] text-muted">Enhet</span>
                          <select
                            value={rad.mangdEnhet}
                            onChange={(e) =>
                              uppdateraInnehall(post.id, rad.id, {
                                mangdEnhet: e.target
                                  .value as KallareInnehallMangdEnhet,
                              })
                            }
                            className="mt-0.5 w-full rounded border border-border bg-white px-2 py-1.5 text-sm"
                          >
                            {kallareMangdEnheter.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.etikett} ({e.enhet})
                              </option>
                            ))}
                          </select>
                        </label>
                        {rad.typ === "annat" && (
                          <label className="block text-sm sm:col-span-3">
                            <span className="text-[11px] text-muted">
                              Ange innehåll
                            </span>
                            <input
                              type="text"
                              value={rad.typAnnan}
                              onChange={(e) =>
                                uppdateraInnehall(post.id, rad.id, {
                                  typAnnan: e.target.value,
                                })
                              }
                              className="mt-0.5 w-full rounded border border-border bg-white px-2 py-1.5 text-sm"
                            />
                          </label>
                        )}
                        <label className="block text-sm sm:col-span-2">
                          <span className="text-[11px] text-muted">
                            Anteckning
                          </span>
                          <input
                            type="text"
                            value={rad.anteckning}
                            onChange={(e) =>
                              uppdateraInnehall(post.id, rad.id, {
                                anteckning: e.target.value,
                              })
                            }
                            placeholder="valfritt"
                            className="mt-0.5 w-full rounded border border-border bg-white px-2 py-1.5 text-sm"
                          />
                        </label>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => taBortInnehall(post.id, rad.id)}
                            className="text-xs text-muted hover:text-red-700"
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {(["armatur", "traforrad", "gallerforrad", "dorr"] as const).map(
                  (typ) => (
                    <button
                      key={typ}
                      type="button"
                      onClick={() => laggTillInnehall(post.id, typ)}
                      className="rounded-md border border-primary/30 px-2 py-1 text-[11px] font-medium text-primary-dark hover:bg-[#eef6f0]"
                    >
                      +{" "}
                      {
                        kallareInnehallTyper.find((t) => t.id === typ)?.etikett
                      }
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => laggTillInnehall(post.id, "annat")}
                  className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted hover:bg-white"
                >
                  + Annat
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={laggTillRum}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        + Lägg till rum
      </button>

      {rum.length > 0 && (
        <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
          <p className="text-xs font-semibold text-primary-dark">
            Sammanställning
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Kryssa i vad du vill se — t.ex. bara träförråd eller bara armaturer
            — och öppna sammanställningen.
          </p>

          {aktivaInnehallstyper.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {aktivaInnehallstyper.map((t) => {
                const vald = filter.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
                      vald
                        ? "border-primary/40 bg-[#eef6f0] text-primary-dark"
                        : "border-border bg-white text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={vald}
                      onChange={() => toggleFilter(t.id)}
                      className="rounded border-border"
                    />
                    {t.etikett}
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-muted">
              Lägg innehåll i rummen först — då visas filterval här.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVisaSammanstallning(true)}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Visa sammanställning
              {filter.length > 0 ? ` (${filter.length} filter)` : ""}
            </button>
            {filter.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter([])}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-[#fafcfa]"
              >
                Rensa filter
              </button>
            )}
          </div>

          {visaSammanstallning && (
            <div className="mt-4 space-y-3">
              <ListaSummeringPanel
                titel={
                  filter.length > 0
                    ? "Filtrerad sammanställning"
                    : "Sammanställning källarrum"
                }
                rader={summering}
              />
              {detaljer.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-[#f5f8f6] text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">Rum</th>
                        <th className="px-3 py-2 font-medium">Innehåll</th>
                        <th className="px-3 py-2 font-medium">Mängd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detaljer.map((rad, i) => (
                        <tr
                          key={`${rad.rum}-${rad.innehall}-${i}`}
                          className="border-t border-border"
                        >
                          <td className="px-3 py-2 text-foreground">
                            {rad.rum}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {rad.innehall}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {rad.mangd}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
