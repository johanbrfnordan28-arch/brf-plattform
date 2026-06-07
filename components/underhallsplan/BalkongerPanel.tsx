"use client";

import { useState } from "react";
import { ListaSummeringPanel } from "@/components/underhallsplan/ListaSummeringPanel";
import {
  balkongArInvestering,
  balkongAtgardAlternativ,
  balkongAtgardEtikett,
  balkongKonstruktioner,
  balkongRakeMaterial,
  balkongTyper,
  balkongVisarKonstruktion,
  hamtaBalkongDelar,
  hamtaBalkongGolvAlternativ,
  normaliseraBalkongPost,
  skapaTomBalkongDelar,
  skapaTomBalkongPost,
  standardBalkongGolv,
  standardBalkongKonstruktion,
  summeraBalkongPoster,
  type BalkongAtgardId,
  type BalkongDelRad,
  type BalkongKonstruktionId,
  type BalkongPost,
  type BalkongRakeMaterialId,
  type BalkongTypId,
} from "@/components/underhallsplan/balkonger";
import { BalkongPrisPanel } from "@/components/underhallsplan/BalkongPrisPanel";
import { beraknaBalkongListaPris } from "@/components/underhallsplan/balkong-pris";
import { formatKr } from "@/components/underhallsplan/besiktningar";
import { formatSummeringTal, parseNummerSumma } from "@/components/underhallsplan/lista-summering";

type BalkongerPanelProps = {
  poster: BalkongPost[];
  onChange: (poster: BalkongPost[]) => void;
};

function NummerFalt({
  label,
  value,
  onChange,
  enhet,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  enhet?: string;
  step?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        {enhet && (
          <span className="shrink-0 text-xs text-muted">{enhet}</span>
        )}
      </div>
    </label>
  );
}

function tillämpaAtgardPaKonstruktion(
  post: BalkongPost,
  atgard: BalkongAtgardId,
): Partial<BalkongPost> {
  if (
    atgard !== "renovering" &&
    balkongVisarKonstruktion(post.balkongTyp)
  ) {
    return { konstruktion: "tillbyggd" };
  }
  return {};
}

export function BalkongerPanel({ poster, onChange }: BalkongerPanelProps) {
  const [nyBalkongTyp, setNyBalkongTyp] =
    useState<BalkongTypId>("utvandig-balkong");
  const [nyAtgard, setNyAtgard] = useState<BalkongAtgardId>("renovering");

  function uppdateraPost(id: string, patch: Partial<BalkongPost>) {
    onChange(
      poster.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        if (patch.atgard && patch.atgard !== p.atgard) {
          Object.assign(merged, tillämpaAtgardPaKonstruktion(merged, patch.atgard));
        }
        const next = normaliseraBalkongPost(merged);
        if (patch.balkongTyp && patch.balkongTyp !== p.balkongTyp) {
          const alt = hamtaBalkongGolvAlternativ(patch.balkongTyp);
          const golvMaterial = alt.some((a) => a.id === next.golvMaterial)
            ? next.golvMaterial
            : standardBalkongGolv(patch.balkongTyp);
          return {
            ...next,
            golvMaterial,
            golvAnnanText: golvMaterial === "annat" ? next.golvAnnanText : "",
            konstruktion: standardBalkongKonstruktion(patch.balkongTyp),
            delar: skapaTomBalkongDelar(patch.balkongTyp).map((m) => {
              const bef = next.delar.find((r) => r.delId === m.delId);
              return bef ? { ...m, aktiv: bef.aktiv, mangd: bef.mangd } : m;
            }),
          };
        }
        return next;
      }),
    );
  }

  function läggTillBalkong(
    typ: BalkongTypId = nyBalkongTyp,
    atgard: BalkongAtgardId = nyAtgard,
  ) {
    const etikett =
      balkongTyper.find((t) => t.id === typ)?.etikett ?? "Balkong";
    const nr = poster.length + 1;
    onChange([
      ...poster,
      skapaTomBalkongPost(
        poster.length === 0 ? etikett : `Balkong ${nr} (${etikett})`,
        typ,
        atgard,
      ),
    ]);
  }

  function taBort(id: string) {
    onChange(poster.filter((p) => p.id !== id));
  }

  function uppdateraDel(
    postId: string,
    delId: string,
    patch: Partial<BalkongDelRad>,
  ) {
    uppdateraPost(postId, {
      delar: (poster.find((p) => p.id === postId)?.delar ?? []).map((r) =>
        r.delId === delId ? { ...r, ...patch } : r,
      ),
    });
  }

  const läggTillSektion = (
    <div className="rounded-lg border border-primary/30 bg-[#fafcfa] p-3 space-y-3 sm:p-4">
      <p className="text-xs font-semibold text-primary-dark">
        {poster.length === 0 ? "Lägg till balkong" : "Lägg till fler balkonger"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Åtgärd</span>
          <select
            value={nyAtgard}
            onChange={(e) => setNyAtgard(e.target.value as BalkongAtgardId)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {balkongAtgardAlternativ.map((alt) => (
              <option key={alt.id} value={alt.id}>
                {alt.etikett}
              </option>
            ))}
          </select>
          {balkongAtgardAlternativ.find((a) => a.id === nyAtgard)?.beskrivning && (
            <span className="mt-1 block text-xs text-muted">
              {balkongAtgardAlternativ.find((a) => a.id === nyAtgard)?.beskrivning}
            </span>
          )}
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Balkongtyp</span>
          <select
            value={nyBalkongTyp}
            onChange={(e) => setNyBalkongTyp(e.target.value as BalkongTypId)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {balkongTyper.map((t) => (
              <option key={t.id} value={t.id}>
                {t.etikett}
              </option>
            ))}
          </select>
          {balkongTyper.find((t) => t.id === nyBalkongTyp)?.beskrivning && (
            <span className="mt-1 block text-xs text-muted">
              {balkongTyper.find((t) => t.id === nyBalkongTyp)?.beskrivning}
            </span>
          )}
        </label>
      </div>
      <button
        type="button"
        onClick={() => läggTillBalkong()}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        + Lägg till balkong
      </button>
      <p className="text-xs text-muted">Snabbval med vald åtgärd:</p>
      <div className="flex flex-wrap gap-2">
        {balkongTyper.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setNyBalkongTyp(t.id);
              läggTillBalkong(t.id, nyAtgard);
            }}
            className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]/40"
          >
            + {t.etikett}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        En fastighet kan ha flera olika balkonger — lägg till en rad per balkong
        eller avsnitt. Välj om det gäller renovering av befintlig balkong, ny
        inskaffning (t.ex. tillbyggd modul) eller ny investering (helt ny
        balkong). Varje rad har egen typ, konstruktion och underhållsdelar.
      </p>

      {poster.length === 0 && läggTillSektion}

      {poster.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-white px-3 py-3 text-center text-xs text-muted">
          Inga balkonger registrerade ännu.
        </p>
      )}

      {poster.length > 0 && (
        <ul className="space-y-3">
          {poster.map((post, index) => {
            const p = normaliseraBalkongPost(post);
            const golvAlt = hamtaBalkongGolvAlternativ(p.balkongTyp);
            const delarDef = hamtaBalkongDelar(p.balkongTyp);
            const typInfo = balkongTyper.find((t) => t.id === p.balkongTyp);
            const typEtikett = typInfo?.etikett ?? "Balkong";
            return (
              <li
                key={post.id}
                className="rounded-lg border border-border bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-primary-dark">
                        Balkong {index + 1}
                      </span>
                      {balkongArInvestering(p.atgard) && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                          {balkongAtgardEtikett(p.atgard)}
                        </span>
                      )}
                    </div>
                    <span className="mt-0.5 block text-xs text-muted">
                      {balkongAtgardEtikett(p.atgard)} · {typEtikett}
                      {p.namn.trim() ? ` · ${p.namn.trim()}` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => taBort(p.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>

                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-muted">Åtgärd</span>
                    <select
                      value={p.atgard}
                      onChange={(e) =>
                        uppdateraPost(p.id, {
                          atgard: e.target.value as BalkongAtgardId,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {balkongAtgardAlternativ.map((alt) => (
                        <option key={alt.id} value={alt.id}>
                          {alt.etikett}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Namn / plats (valfritt)
                    </span>
                    <input
                      type="text"
                      value={p.namn}
                      onChange={(e) =>
                        uppdateraPost(p.id, { namn: e.target.value })
                      }
                      placeholder={`T.ex. ${typEtikett} väster`}
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-sm sm:col-span-2">
                    <span className="text-xs font-medium text-muted">
                      Balkongtyp
                    </span>
                    <select
                      value={p.balkongTyp}
                      onChange={(e) =>
                        uppdateraPost(p.id, {
                          balkongTyp: e.target.value as BalkongTypId,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      {balkongTyper.map((t) => (
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

                  {balkongVisarKonstruktion(p.balkongTyp) && (
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs font-medium text-muted">
                        Konstruktion
                      </span>
                      <select
                        value={p.konstruktion}
                        onChange={(e) =>
                          uppdateraPost(p.id, {
                            konstruktion: e.target.value as BalkongKonstruktionId,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        {balkongKonstruktioner.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.etikett}
                          </option>
                        ))}
                      </select>
                      <span className="mt-1 block text-xs text-muted">
                        {
                          balkongKonstruktioner.find((k) => k.id === p.konstruktion)
                            ?.beskrivning
                        }
                      </span>
                    </label>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                  <p className="text-xs font-semibold text-primary-dark">
                    Balkongräcke
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Finns på alla balkongtyper — ange total räckeslängd.
                  </p>

                  <fieldset className="mt-3 space-y-2">
                    <legend className="sr-only">Material balkongräcke</legend>
                    {balkongRakeMaterial.map((alt) => (
                      <label
                        key={alt.id}
                        className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
                      >
                        <input
                          type="radio"
                          name={`rake-material-${post.id}`}
                          checked={p.rakeMaterial === alt.id}
                          onChange={() =>
                            uppdateraPost(p.id, {
                              rakeMaterial: alt.id as BalkongRakeMaterialId,
                            })
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
                        />
                        <span className="font-medium">{alt.etikett}</span>
                      </label>
                    ))}
                  </fieldset>

                  <div className="mt-3 max-w-xs">
                    <NummerFalt
                      label="Balkongräcke"
                      value={p.rakeLopmeter}
                      onChange={(v) =>
                        uppdateraPost(p.id, { rakeLopmeter: v })
                      }
                      enhet="m"
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                  <p className="text-xs font-semibold text-primary-dark">
                    Ytskikt / golvbeläggning
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Synlig beläggning ovanpå tätskikt — klinker, trädäck m.m.
                  </p>

                  <fieldset className="mt-3 space-y-2">
                    <legend className="sr-only">Golvmaterial</legend>
                    {golvAlt.map((alt) => (
                      <label
                        key={alt.id}
                        className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef6f0]/50"
                      >
                        <input
                          type="radio"
                          name={`golv-${post.id}`}
                          checked={p.golvMaterial === alt.id}
                          onChange={() =>
                            uppdateraPost(p.id, {
                              golvMaterial: alt.id,
                              golvAnnanText:
                                alt.id === "annat" ? p.golvAnnanText : "",
                            })
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 border-border text-primary"
                        />
                        <span className="font-medium">{alt.etikett}</span>
                      </label>
                    ))}
                  </fieldset>

                  {p.golvMaterial === "annat" && (
                    <label className="mt-3 block text-sm">
                      <span className="text-xs font-medium text-muted">
                        Beskriv ytskikt
                      </span>
                      <input
                        type="text"
                        value={p.golvAnnanText}
                        onChange={(e) =>
                          uppdateraPost(p.id, {
                            golvAnnanText: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  )}

                  {p.golvMaterial !== "ingen-platta" && (
                    <div className="mt-3 max-w-xs">
                      <NummerFalt
                        label="Ytskiktsyta (valfritt)"
                        value={p.golvKvm}
                        onChange={(v) =>
                          uppdateraPost(p.id, { golvKvm: v })
                        }
                        enhet="m²"
                        step={0.1}
                      />
                    </div>
                  )}
                </div>

                {delarDef.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border/80 bg-[#fafcfa] p-3">
                    <p className="text-xs font-semibold text-primary-dark">
                      Underhållskomponenter
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Markera delar som ingår i planen och ange mängd där det
                      behövs.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {delarDef.map((def) => {
                        const rad =
                          p.delar.find((r) => r.delId === def.id) ??
                          ({ delId: def.id, aktiv: false, mangd: "" } satisfies BalkongDelRad);
                        const enhet =
                          def.enhet === "m2"
                            ? "m²"
                            : def.enhet === "m"
                              ? "m"
                              : "st";
                        return (
                          <li
                            key={def.id}
                            className="rounded-lg border border-border bg-white p-3"
                          >
                            <label className="flex cursor-pointer items-start gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={rad.aktiv}
                                onChange={(e) =>
                                  uppdateraDel(p.id, def.id, {
                                    aktiv: e.target.checked,
                                  })
                                }
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                              />
                              <span>
                                <span className="font-medium">{def.etikett}</span>
                                <span className="mt-0.5 block text-xs text-muted">
                                  {def.beskrivning}
                                </span>
                              </span>
                            </label>
                            {rad.aktiv && (
                              <div className="mt-2 max-w-xs pl-6">
                                <NummerFalt
                                  label="Mängd"
                                  value={rad.mangd}
                                  onChange={(v) =>
                                    uppdateraDel(p.id, def.id, { mangd: v })
                                  }
                                  enhet={enhet}
                                  step={def.enhet === "st" ? 1 : 0.1}
                                />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <BalkongPrisPanel
                    post={p}
                    onChange={(next) =>
                      onChange(
                        poster.map((row) =>
                          row.id === p.id ? normaliseraBalkongPost(next) : row,
                        ),
                      )
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {poster.length > 0 && (() => {
        const summering = summeraBalkongPoster(poster);
        const kostnad = beraknaBalkongListaPris(poster);
        const rakeLm = parseNummerSumma(
          poster.map((p) => normaliseraBalkongPost(p).rakeLopmeter),
        );
        const raderUtanAntal = summering.filter(
          (r) => r.etikett !== "Antal balkongrader",
        );
        return (
          <>
            {kostnad.totaltKr > 0 && (
              <div className="rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3 sm:p-4">
                <p className="text-xs font-semibold text-primary-dark">
                  Uppskattad kostnad per balkongrad
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {kostnad.poster
                    .filter((p) => p.totaltKr > 0)
                    .map((p) => (
                      <li
                        key={p.postId}
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5"
                      >
                        <span className="text-foreground">{p.namn}</span>
                        <span className="font-medium tabular-nums text-primary-dark">
                          {formatKr(p.totaltKr)}
                        </span>
                      </li>
                    ))}
                </ul>
                <p className="mt-3 border-t border-primary/20 pt-2 text-sm font-semibold text-primary-dark">
                  Totalt balkonger: {formatKr(kostnad.totaltKr)}
                </p>
              </div>
            )}
            <ListaSummeringPanel
              titel="Summering balkonger"
              rader={raderUtanAntal}
              totaletikett="Antal balkonger"
              totaltVarde={
                rakeLm > 0
                  ? `${poster.length} st · räcke ${formatSummeringTal(rakeLm)} m`
                  : `${poster.length} st`
              }
            />
          </>
        );
      })()}

      {poster.length > 0 && läggTillSektion}
    </div>
  );
}
