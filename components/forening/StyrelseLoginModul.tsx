"use client";

import { useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  markeraPendingAktivForening,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  listaInloggningsTestForeningar,
  rensaStandardTestForening,
} from "@/lib/testforeningar";
import { hamtaForeningStartPath } from "@/lib/styrelse-kontakt";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { arSailorForening } from "@/lib/sailor-forening";

function initial(namn: string): string {
  return namn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";
}

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

interface ForeningKortProps {
  forening: ForeningProfil;
  onLoggaIn: () => void;
  onBekraftaRensa: () => void;
}

function ForeningKort({ forening, onLoggaIn, onBekraftaRensa }: ForeningKortProps) {
  const ini = initial(forening.namn);
  const visaTestperiod = !arSailorForening(forening.id);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white shadow-sm">
          {ini}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-foreground">{forening.namn}</p>
            {visaTestperiod && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Testperiod
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
            {forening.skapadTidpunkt && (
              <span>Skapad {formatDatum(forening.skapadTidpunkt)}</span>
            )}
            {forening.grundinfoPaborjad && (
              <span className="font-medium text-primary-dark">
                ✓ Grunduppgifter ifyllda
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onLoggaIn}
          className="group flex shrink-0 flex-col items-center rounded-xl bg-primary px-5 py-2.5 text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <span className="text-xs font-medium opacity-90">Logga in</span>
          <span className="mt-0.5 max-w-[10rem] text-center text-sm font-bold leading-tight">
            {forening.namn}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-surface/40 px-5 py-2.5">
        <p className="text-xs text-muted">
          {visaTestperiod
            ? "All data sparas enbart i den här testföreningen"
            : "Data sparas lokalt i webbläsaren för den här föreningen"}
        </p>
        <button
          type="button"
          onClick={onBekraftaRensa}
          className="text-xs text-muted hover:text-red-600"
        >
          Rensa all data
        </button>
      </div>
    </div>
  );
}

export function StyrelseLoginModul() {
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [rensaId, setRensaId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  function ladda() {
    setForeningar(listaInloggningsTestForeningar());
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  function loggaIn(id: string) {
    markeraPendingAktivForening(id);
    sattAktivForeningId(id);
    window.location.assign(hamtaForeningStartPath(id));
  }

  function bekraftaRensa(id: string) {
    rensaStandardTestForening(id);
    setRensaId(null);
    ladda();
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-3 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-border/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      <section>
        <p className="mb-1 text-center text-sm font-medium text-foreground">
          Välj testförening
        </p>
        <p className="mb-4 text-center text-sm text-muted">
          Fem separata testmiljöer — klicka{" "}
          <strong className="font-medium text-foreground">Logga in</strong> för
          att öppna er förening. Allt ni fyller i sparas bara i den valda
          föreningen.
        </p>

        <ul className="space-y-4">
          {foreningar.map((f) =>
            rensaId === f.id ? (
              <li key={f.id}>
                <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
                  <p className="font-bold text-red-900">
                    Rensa all data i {f.namn}?
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Underhållsplan, medlemmar och övriga uppgifter i den här
                    testföreningen raderas. Föreningen finns kvar i listan så
                    ni kan börja om.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => bekraftaRensa(f.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Ja, rensa all data
                    </button>
                    <button
                      type="button"
                      onClick={() => setRensaId(null)}
                      className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li key={f.id}>
                <ForeningKort
                  forening={f}
                  onLoggaIn={() => loggaIn(f.id)}
                  onBekraftaRensa={() => setRensaId(f.id)}
                />
              </li>
            ),
          )}
        </ul>
      </section>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden>
            💡
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Hur loggar du in nästa gång?
            </p>
            <p className="mt-1 text-sm text-muted">
              Bokmärk den här sidan — samma fem testföreningar finns kvar och
              ni loggar in med ett klick.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}${PROVA_GRATIS_PATH}`
                  : PROVA_GRATIS_PATH}
              </code>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${PROVA_GRATIS_PATH}`,
                    );
                  }
                }}
                className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-foreground"
              >
                Kopiera
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Data sparas i webbläsaren på den här datorn. Byter ni förening
              i listan ovan påverkas inte de andra testföreningarna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
