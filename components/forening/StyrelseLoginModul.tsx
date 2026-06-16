"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  listaForeningar,
  sattAktivForeningId,
  taBortForening,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { SkapaForeningPanel } from "@/components/forening/SkapaForeningPanel";

function föreningInitial(namn: string): string {
  return namn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";
}

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function StyrelseLoginModul() {
  const router = useRouter();
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [bekraftaId, setBekraftaId] = useState<string | null>(null);
  const [visaSkapaForm, setVisaSkapaForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  function ladda() {
    setForeningar(
      listaForeningar().filter((f) => f.id !== GRUNDMALL_FORENING_ID),
    );
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  function loggaIn(id: string) {
    sattAktivForeningId(id);
    router.push("/forening");
  }

  function bekraftaTaBort(id: string) {
    taBortForening(id);
    setBekraftaId(null);
    ladda();
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-xl animate-pulse space-y-3 px-4">
        <div className="h-20 rounded-2xl bg-border/40" />
        <div className="h-20 rounded-2xl bg-border/40" />
      </div>
    );
  }

  const harForeningar = foreningar.length > 0;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-4">
      {/* ── Välj förening (om de finns) ──────────────────────────────── */}
      {harForeningar && (
        <section>
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Välj förening
            </h2>
            <p className="mt-1 text-sm text-muted">
              Klicka för att logga in på föreningen
            </p>
          </div>

          <ul className="space-y-3">
            {foreningar.map((f) => {
              const initial = föreningInitial(f.namn);
              const isBekrafta = bekraftaId === f.id;

              return (
                <li key={f.id}>
                  {isBekrafta ? (
                    /* Bekräfta borttagning */
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                      <p className="font-semibold text-red-900">
                        Ta bort {f.namn}?
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        All data för föreningen raderas permanent. Åtgärden
                        kan inte ångras.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => bekraftaTaBort(f.id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Ja, ta bort permanent
                        </button>
                        <button
                          type="button"
                          onClick={() => setBekraftaId(null)}
                          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Föreningskort */
                    <div className="group relative rounded-2xl border-2 border-border bg-white shadow-sm transition-all hover:border-primary hover:shadow-md">
                      {/* Klickbar login-yta */}
                      <button
                        type="button"
                        onClick={() => loggaIn(f.id)}
                        className="flex w-full items-center gap-4 p-5 text-left"
                        aria-label={`Logga in på ${f.namn}`}
                      >
                        {/* Initial-cirkel */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white shadow-sm">
                          {initial}
                        </div>

                        {/* Namn + info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-bold leading-tight text-foreground">
                            {f.namn}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                            {f.skapadTidpunkt && (
                              <span>
                                Skapad {formatDatum(f.skapadTidpunkt)}
                              </span>
                            )}
                            {f.grundinfoPaborjad && (
                              <span className="font-medium text-primary-dark">
                                Uppgifter ifyllda
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Logga in-pil */}
                        <div className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-primary-dark">
                          Logga in →
                        </div>
                      </button>

                      {/* Ta bort-knapp (diskret, höger hörn) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBekraftaId(f.id);
                        }}
                        className="absolute right-3 top-3 rounded-lg px-2 py-1 text-xs text-muted/60 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                        title={`Ta bort ${f.namn}`}
                      >
                        Ta bort
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Skapa ny / separator */}
          <div className="mt-6 border-t border-border pt-5">
            {visaSkapaForm ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Skapa ny testförening
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisaSkapaForm(false)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Stäng ↑
                  </button>
                </div>
                <SkapaForeningPanel visaSnabbstart kompakt />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVisaSkapaForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
                Skapa ny testförening
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Inga föreningar ännu — visa skapandeformuläret ───────────── */}
      {!harForeningar && (
        <section>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e2f0e6] text-3xl">
              🏠
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Skapa er testförening
            </h2>
            <p className="mt-2 text-sm text-muted">
              Fyll i föreningens namn och tryck på den gröna knappen.
              Testperioden är gratis.
            </p>
          </div>
          <SkapaForeningPanel visaSnabbstart />
        </section>
      )}
    </div>
  );
}
