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

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function TestForeningLista() {
  const router = useRouter();
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [bekraftaId, setBekraftaId] = useState<string | null>(null);
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

  if (!hydrated || foreningar.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-[#eef6f0] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Era testföreningar
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Klicka på en förening för att logga in. Alla ändringar sparas
            separat per förening.
          </p>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-0.5 text-sm font-medium text-primary-dark">
          {foreningar.length}{" "}
          {foreningar.length === 1 ? "förening" : "föreningar"}
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {foreningar.map((f) => (
          <li
            key={f.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Info */}
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{f.namn}</p>
              <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted">
                {f.skapadTidpunkt && (
                  <span>Skapad {formatDatum(f.skapadTidpunkt)}</span>
                )}
                {f.ort && <span>{f.ort}</span>}
                {f.grundinfoPaborjad && (
                  <span className="text-primary-dark">Grunduppgifter påbörjat</span>
                )}
              </div>
            </div>

            {/* Knappar */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Login-knapp med föreningsnamnet */}
              <button
                type="button"
                onClick={() => loggaIn(f.id)}
                className="group flex flex-col items-center rounded-xl bg-primary px-5 py-2.5 text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                <span className="text-xs font-medium opacity-80">
                  Logga in
                </span>
                <span className="mt-0.5 text-sm font-bold leading-tight">
                  {f.namn}
                </span>
              </button>

              {/* Ta bort */}
              {bekraftaId === f.id ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <span className="text-xs text-red-800">
                    Ta bort permanent?
                  </span>
                  <button
                    type="button"
                    onClick={() => bekraftaTaBort(f.id)}
                    className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Ja, ta bort
                  </button>
                  <button
                    type="button"
                    onClick={() => setBekraftaId(null)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setBekraftaId(f.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-600"
                  title={`Ta bort ${f.namn}`}
                >
                  Ta bort
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted">
        Testperioden är gratis. Ta bort en förening raderar all dess data
        permanent i den här webbläsaren.
      </p>
    </div>
  );
}
