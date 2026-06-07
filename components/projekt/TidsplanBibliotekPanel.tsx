"use client";

import { useEffect, useState } from "react";
import { safeSetLocalStorage } from "@/lib/localStorage";
import {
  appliceraMallPaProjekt,
  lasTidsplanBibliotek,
  skapaMallId,
  sparaTidsplanBibliotek,
  standardTidsplanMallar,
  tidsplanBibliotekStorageKey,
  type TidsplanMall,
  type TidsplanMallMilstolpe,
} from "@/components/projekt/tidsplan-bibliotek";
import { idagIso } from "@/components/projekt/tidsplan";

type TidsplanBibliotekPanelProps = {
  /** Om satt visas knapp för att applicera mall direkt på projekt. */
  projektStartDatum?: string | null;
  onAppliceraMall?: (mall: TidsplanMall, startDatum: string) => void;
};

export function TidsplanBibliotekPanel({
  projektStartDatum,
  onAppliceraMall,
}: TidsplanBibliotekPanelProps) {
  const [mallar, setMallar] = useState<TidsplanMall[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [nyTitel, setNyTitel] = useState("");
  const [nyBeskrivning, setNyBeskrivning] = useState("");
  const [nyaMilstolpar, setNyaMilstolpar] = useState<TidsplanMallMilstolpe[]>([
    { titel: "Byggstart", dagarFranStart: 0 },
    { titel: "Slutbesiktning", dagarFranStart: 90 },
  ]);
  const [valtStart, setValtStart] = useState(projektStartDatum ?? idagIso());

  useEffect(() => {
    setMallar(lasTidsplanBibliotek());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (projektStartDatum) setValtStart(projektStartDatum);
  }, [projektStartDatum]);

  function sparaEgenMallar(egen: TidsplanMall[]) {
    const standardIds = new Set(standardTidsplanMallar.map((m) => m.id));
    const onlyEgen = egen.filter((m) => !standardIds.has(m.id));
    safeSetLocalStorage(tidsplanBibliotekStorageKey(), JSON.stringify(onlyEgen));
    setMallar(lasTidsplanBibliotek());
  }

  function skapaMall(event: React.FormEvent) {
    event.preventDefault();
    if (!nyTitel.trim() || nyaMilstolpar.length === 0) return;
    const ny: TidsplanMall = {
      id: skapaMallId(),
      titel: nyTitel.trim(),
      beskrivning: nyBeskrivning.trim(),
      milstolpar: nyaMilstolpar.filter((m) => m.titel.trim()),
      skapad: new Date().toLocaleDateString("sv-SE"),
    };
    const standardIds = new Set(standardTidsplanMallar.map((m) => m.id));
    const egen = mallar.filter((m) => !standardIds.has(m.id));
    sparaEgenMallar([...egen, ny]);
    setNyTitel("");
    setNyBeskrivning("");
    setNyaMilstolpar([
      { titel: "Byggstart", dagarFranStart: 0 },
      { titel: "Slutbesiktning", dagarFranStart: 90 },
    ]);
    setSkapaOppen(false);
  }

  function taBortEgenMall(mallId: string) {
    if (standardTidsplanMallar.some((m) => m.id === mallId)) return;
    sparaEgenMallar(mallar.filter((m) => m.id !== mallId));
  }

  if (!hydrated) return null;

  return (
    <details className="rounded-2xl border border-border bg-surface">
      <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-foreground">Tidsplansbibliotek</span>
        <p className="mt-1 text-xs text-muted">
          Skapa mallar här — applicera på projekt och bjud in entreprenör att fylla i
          datum (demo).
        </p>
      </summary>

      <div className="space-y-4 border-t border-border px-5 pb-5 pt-2">
        <ul className="space-y-3">
          {mallar.map((mall) => (
            <li
              key={mall.id}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{mall.titel}</p>
                  <p className="mt-1 text-xs text-muted">{mall.beskrivning}</p>
                  <p className="mt-2 text-xs text-muted">
                    {mall.milstolpar.length} milstolpar
                    {mall.skapad !== "standard" && ` · Egen mall (${mall.skapad})`}
                  </p>
                </div>
                {onAppliceraMall && (
                  <button
                    type="button"
                    onClick={() => onAppliceraMall(mall, valtStart)}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                  >
                    Importera till projekt
                  </button>
                )}
              </div>
              <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-xs text-foreground">
                {mall.milstolpar.map((m, i) => (
                  <li key={`${mall.id}-${i}`}>
                    {m.titel}
                    <span className="text-muted">
                      {" "}
                      (dag {m.dagarFranStart >= 0 ? "+" : ""}
                      {m.dagarFranStart} från start)
                    </span>
                  </li>
                ))}
              </ol>
              {!standardTidsplanMallar.some((s) => s.id === mall.id) && (
                <button
                  type="button"
                  onClick={() => taBortEgenMall(mall.id)}
                  className="mt-2 text-xs text-muted hover:text-red-700"
                >
                  Ta bort mall
                </button>
              )}
            </li>
          ))}
        </ul>

        {onAppliceraMall && (
          <label className="block text-sm">
            <span className="font-medium text-foreground">Projektstart vid import</span>
            <input
              type="date"
              value={valtStart}
              onChange={(e) => setValtStart(e.target.value)}
              className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        )}

        <details
          open={skapaOppen || undefined}
          onToggle={(e) => setSkapaOppen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer text-sm font-medium text-primary-dark">
            + Skapa egen mall i biblioteket
          </summary>
          <form onSubmit={skapaMall} className="mt-3 space-y-3 rounded-lg border border-dashed border-primary/40 p-4">
            <label className="block text-sm">
              <span className="font-medium">Mallnamn</span>
              <input
                required
                value={nyTitel}
                onChange={(e) => setNyTitel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="t.ex. Takrenovering"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Beskrivning</span>
              <textarea
                value={nyBeskrivning}
                onChange={(e) => setNyBeskrivning(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs font-medium text-muted">Milstolpar (dagar från start)</p>
            {nyaMilstolpar.map((m, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <input
                  value={m.titel}
                  onChange={(e) => {
                    const next = [...nyaMilstolpar];
                    next[i] = { ...next[i], titel: e.target.value };
                    setNyaMilstolpar(next);
                  }}
                  placeholder="Milstolpe"
                  className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={m.dagarFranStart}
                  onChange={(e) => {
                    const next = [...nyaMilstolpar];
                    next[i] = {
                      ...next[i],
                      dagarFranStart: Number(e.target.value) || 0,
                    };
                    setNyaMilstolpar(next);
                  }}
                  className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm"
                  title="Dagar från start"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setNyaMilstolpar([
                  ...nyaMilstolpar,
                  { titel: "", dagarFranStart: 30 },
                ])
              }
              className="text-xs text-primary-dark hover:underline"
            >
              + Milstolpe
            </button>
            <button
              type="submit"
              className="block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Spara mall
            </button>
          </form>
        </details>
      </div>
    </details>
  );
}

/** För förhandsvisning utan att spara — används internt. */
export { appliceraMallPaProjekt };
