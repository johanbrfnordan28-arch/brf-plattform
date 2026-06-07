"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatKostnad } from "@/components/underhallsplan/renoveringar";
import {
  flyttaAtgardTillProjekt,
  frigörAllaProjektAtgarder,
  frigörAtgardFranProjekt,
  hamtaProjektArspann,
  sammanstallAtgarderForProjektLank,
  skapaKommandeProjektId,
  type AtgardForProjektLank,
  type KommandeProjekt,
  type PlaneradAtgardRef,
} from "@/components/underhallsplan/kommande-projekt";
import {
  lasKommandeProjektLager,
  sparaKommandeProjektLager,
} from "@/components/underhallsplan/kommande-projekt-lager";
import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";

type KommandeProjektStegProps = {
  unlocked: boolean;
  planStartAr: number;
  komponentDetaljer: Record<string, KomponentDetaljData>;
  onKomponentDetaljerChange: (
    register: Record<string, KomponentDetaljData>,
  ) => void;
};

const tomtProjektForm = {
  titel: "",
  beskrivning: "",
  planeratAr: "",
  uppskattadKostnadKr: "",
};

export function KommandeProjektSteg({
  unlocked,
  planStartAr,
  komponentDetaljer,
  onKomponentDetaljerChange,
}: KommandeProjektStegProps) {
  const { minAr, maxAr } = useMemo(
    () => hamtaProjektArspann(planStartAr),
    [planStartAr],
  );

  const [projekt, setProjekt] = useState<KommandeProjekt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(tomtProjektForm);
  const [öppetProjektId, setÖppetProjektId] = useState<string | null>(null);

  useEffect(() => {
    setProjekt(lasKommandeProjektLager().projekt);
    setHydrated(true);
  }, []);

  const persistProjekt = useCallback((lista: KommandeProjekt[]) => {
    setProjekt(lista);
    sparaKommandeProjektLager({ projekt: lista });
  }, []);

  const lankbaraAtgarder = useMemo(
    () => sammanstallAtgarderForProjektLank(komponentDetaljer, planStartAr),
    [komponentDetaljer, planStartAr],
  );

  const atgarderEjFlyttade = lankbaraAtgarder.filter((a) => !a.redanFlyttad);

  function uppdateraRegister(register: Record<string, KomponentDetaljData>) {
    onKomponentDetaljerChange(register);
  }

  function skapaProjekt(event: React.FormEvent) {
    event.preventDefault();
    if (!form.titel.trim()) return;
    const ar = Number.parseInt(form.planeratAr, 10);
    if (Number.isNaN(ar) || ar < minAr || ar > maxAr) return;
    const kostnad = form.uppskattadKostnadKr.trim()
      ? Number.parseInt(form.uppskattadKostnadKr.replace(/\s/g, ""), 10)
      : undefined;

    const nytt: KommandeProjekt = {
      id: skapaKommandeProjektId(),
      titel: form.titel.trim(),
      beskrivning: form.beskrivning.trim(),
      planeratAr: ar,
      uppskattadKostnadKr: Number.isNaN(kostnad ?? NaN) ? undefined : kostnad,
      atgarder: [],
      skapad: new Date().toISOString(),
      uppdaterad: new Date().toISOString(),
    };
    persistProjekt([...projekt, nytt]);
    setForm({ ...tomtProjektForm, planeratAr: String(ar) });
    setÖppetProjektId(nytt.id);
  }

  function taBortProjekt(id: string) {
    const p = projekt.find((x) => x.id === id);
    if (!p) return;
    let register = komponentDetaljer;
    register = frigörAllaProjektAtgarder(register, p);
    uppdateraRegister(register);
    persistProjekt(projekt.filter((x) => x.id !== id));
    if (öppetProjektId === id) setÖppetProjektId(null);
  }

  function flyttaAtgardTill(p: KommandeProjekt, atgard: AtgardForProjektLank) {
    const ref = {
      komponent: atgard.komponent,
      underkomponentId: atgard.underkomponentId,
      etikett: atgard.etikett,
      planeratAr: atgard.planeratAr,
      kostnadKr: atgard.kostnadKr,
    };
    const { register: nyRegister, projekt: uppdaterat } = flyttaAtgardTillProjekt(
      komponentDetaljer,
      p,
      ref,
    );
    uppdateraRegister(nyRegister);
    persistProjekt(
      projekt.map((x) => (x.id === p.id ? uppdaterat : x)),
    );
  }

  function taBortAtgardFranProjekt(p: KommandeProjekt, ref: PlaneradAtgardRef) {
    const nyRegister = frigörAtgardFranProjekt(komponentDetaljer, ref);
    uppdateraRegister(nyRegister);
    persistProjekt(
      projekt.map((x) =>
        x.id === p.id
          ? {
              ...x,
              atgarder: x.atgarder.filter(
                (a) =>
                  !(
                    a.komponent === ref.komponent &&
                    a.underkomponentId === ref.underkomponentId
                  ),
              ),
              uppdaterad: new Date().toISOString(),
            }
          : x,
      ),
    );
  }

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar kommande projekt…</p>;
  }

  return (
    <div className={`space-y-6 ${lockedClass}`}>
      <p className="text-sm leading-relaxed text-muted">
        Planera styrelseprojekt {minAr}–{maxAr} — t.ex. stambyte, fasadrenovering
        eller större investeringar. Detta avsnitt ingår{" "}
        <strong className="font-medium text-foreground">inte</strong> i PDF eller
        utskrift av underhållsplanen.
      </p>

      {!unlocked && (
        <p className="rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Spara grunduppgifterna i steg 1 först.
        </p>
      )}

      <div className="rounded-xl border border-[#d4e8da] bg-[#eef6f0]/50 px-4 py-3">
        <p className="text-sm font-semibold text-primary-dark">
          Länkning från underhållsplanen
        </p>
        <p className="mt-1 text-xs text-muted">
          Åtgärder med planerat år {minAr}–{maxAr} kan flyttas hit. De försvinner då
          från investeringsplanen, diagram och utskrifter — men finns kvar i
          komponentregistret.
        </p>
        {atgarderEjFlyttade.length === 0 ? (
          <p className="mt-2 text-xs text-muted">
            Inga fler åtgärder i perioden att flytta (eller alla är redan kopplade
            till projekt).
          </p>
        ) : (
          <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-sm">
            {atgarderEjFlyttade.map((a) => (
              <li
                key={`${a.komponent}-${a.underkomponentId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-white px-2.5 py-1.5"
              >
                <span>
                  <span className="font-medium tabular-nums">{a.planeratAr}</span>
                  {" · "}
                  {a.komponent} — {a.etikett}
                  {a.kostnadKr != null && (
                    <span className="text-muted">
                      {" "}
                      ({formatKostnad(a.kostnadKr)})
                    </span>
                  )}
                </span>
                {öppetProjektId && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = projekt.find((x) => x.id === öppetProjektId);
                      if (p) flyttaAtgardTill(p, a);
                    }}
                    className="shrink-0 rounded border border-primary px-2 py-0.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    → öppet projekt
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={skapaProjekt}
        className="rounded-xl border border-dashed border-border bg-background/80 p-4"
      >
        <p className="text-sm font-semibold text-foreground">Nytt projekt</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-muted">Rubrik</span>
            <input
              required
              value={form.titel}
              onChange={(e) => setForm((c) => ({ ...c, titel: e.target.value }))}
              placeholder="t.ex. Stambyte etapp 1"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Planerat år</span>
            <select
              required
              value={form.planeratAr}
              onChange={(e) =>
                setForm((c) => ({ ...c, planeratAr: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Välj år</option>
              {Array.from({ length: maxAr - minAr + 1 }, (_, i) => minAr + i).map(
                (ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Uppskattad kostnad (kr)
            </span>
            <input
              type="number"
              min={0}
              value={form.uppskattadKostnadKr}
              onChange={(e) =>
                setForm((c) => ({ ...c, uppskattadKostnadKr: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-muted">Beskrivning</span>
            <textarea
              value={form.beskrivning}
              onChange={(e) =>
                setForm((c) => ({ ...c, beskrivning: e.target.value }))
              }
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Lägg till projekt
        </button>
      </form>

      {projekt.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Inga kommande projekt ännu.
        </p>
      ) : (
        <ul className="space-y-3">
          {projekt
            .filter((p) => p.planeratAr >= minAr && p.planeratAr <= maxAr)
            .sort((a, b) => a.planeratAr - b.planeratAr)
            .map((p) => {
              const ärÖppen = öppetProjektId === p.id;
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-border bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => setÖppetProjektId(ärÖppen ? null : p.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {p.titel}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {p.planeratAr}
                        {p.uppskattadKostnadKr != null &&
                          ` · ${formatKostnad(p.uppskattadKostnadKr)}`}
                        {p.atgarder.length > 0 &&
                          ` · ${p.atgarder.length} kopplad${p.atgarder.length === 1 ? "" : "e"} åtgärd${p.atgarder.length === 1 ? "" : "er"}`}
                      </p>
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setÖppetProjektId(ärÖppen ? null : p.id)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium"
                      >
                        {ärÖppen ? "Stäng" : "Öppna"}
                      </button>
                      <button
                        type="button"
                        onClick={() => taBortProjekt(p.id)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>

                  {ärÖppen && (
                    <div className="border-t border-border px-4 py-3">
                      {p.beskrivning.trim() && (
                        <p className="mb-3 text-sm text-muted">{p.beskrivning}</p>
                      )}

                      {p.atgarder.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-foreground">
                            Flyttade från planen
                          </p>
                          <ul className="mt-2 space-y-1.5">
                            {p.atgarder.map((a) => (
                              <li
                                key={`${a.komponent}-${a.underkomponentId}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#eef6f0]/60 px-2.5 py-1.5 text-sm"
                              >
                                <span>
                                  {a.planeratAr} · {a.komponent} — {a.etikett}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => taBortAtgardFranProjekt(p, a)}
                                  className="text-xs text-muted hover:text-red-700"
                                >
                                  Återför till plan
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs font-semibold text-foreground">
                        Flytta åtgärd hit
                      </p>
                      {atgarderEjFlyttade.length === 0 ? (
                        <p className="mt-1 text-xs text-muted">
                          Inga åtgärder kvar att flytta i perioden.
                        </p>
                      ) : (
                        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                          {atgarderEjFlyttade.map((a) => (
                            <li key={`add-${a.komponent}-${a.underkomponentId}`}>
                              <button
                                type="button"
                                onClick={() => flyttaAtgardTill(p, a)}
                                className="w-full rounded-md border border-dashed border-primary/40 px-2.5 py-1.5 text-left text-xs hover:bg-[#e2f0e6]"
                              >
                                + {a.planeratAr} · {a.komponent} — {a.etikett}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
