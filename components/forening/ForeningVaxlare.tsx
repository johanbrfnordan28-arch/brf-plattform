"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  GRUNDMALL_NAMN,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
  lasForeningProfil,
  listaAllaForeningerForVaxlare,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { sakraStandardTestForeningar } from "@/lib/testforeningar";

function foreningInitial(namn: string, id: string): string {
  if (id === GRUNDMALL_FORENING_ID) return "G";
  return namn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";
}

export function ForeningVaxlare() {
  const router = useRouter();
  const [aktivId, setAktivId] = useState(GRUNDMALL_FORENING_ID);
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [redo, setRedo] = useState(false);
  const [öppen, setÖppen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ladda = useCallback(() => {
    sakraStandardTestForeningar();
    const id = lasAktivForeningId();
    setAktivId(id);
    let lista = listaAllaForeningerForVaxlare();
    if (id && !lista.some((f) => f.id === id)) {
      const profil = lasForeningProfil(id);
      lista = [
        ...lista,
        profil ?? {
          id,
          namn: hamtaAktivForeningsNamn(),
          skapadTidpunkt: new Date().toISOString(),
          organisationsnummer: "",
          epost: "",
          postadress: "",
          ort: "",
          kontaktperson: "",
          grundinfoPaborjad: false,
        },
      ];
    }
    setForeningar(lista);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  // Stäng dropdown vid klick utanför
  useEffect(() => {
    function hanteraKlickUtanför(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setÖppen(false);
      }
    }
    document.addEventListener("mousedown", hanteraKlickUtanför);
    return () => document.removeEventListener("mousedown", hanteraKlickUtanför);
  }, []);

  function bytForening(id: string) {
    if (id === aktivId) { setÖppen(false); return; }
    sattAktivForeningId(id);
    setAktivId(id);
    setÖppen(false);
  }

  if (!redo) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-lg bg-border/40" />
    );
  }

  const aktivForening = foreningar.find((f) => f.id === aktivId);
  const aktivNamn = aktivForening?.namn ?? GRUNDMALL_NAMN;
  const arTest = aktivId !== GRUNDMALL_FORENING_ID;
  const ini = foreningInitial(aktivNamn, aktivId);

  const andraBörjan = foreningar.filter((f) => f.id !== aktivId);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger-knapp */}
      <button
        type="button"
        onClick={() => setÖppen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={öppen}
        className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-sm transition-colors hover:border-primary/40 hover:bg-surface"
      >
        {/* Initial */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
          {ini}
        </span>

        {/* Namn */}
        <span className="max-w-[120px] truncate text-sm font-semibold text-foreground sm:max-w-[160px]">
          {aktivNamn}
        </span>

        {/* Test-badge */}
        {arTest && (
          <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 sm:inline-flex">
            Test
          </span>
        )}

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${öppen ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {öppen && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
        >
          {/* Aktiv förening */}
          <div className="bg-[#eef6f0] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Inloggad som
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                {ini}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {aktivNamn}
                </p>
                {arTest && (
                  <p className="text-xs text-amber-700">Testperiod · Gratis</p>
                )}
              </div>
            </div>
            {arTest && (
              <button
                type="button"
                onClick={() => { router.push("/styrelse-login"); setÖppen(false); }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                <span>⭐</span>
                Köp föreningssida
              </button>
            )}
          </div>

          {/* Andra föreningar */}
          {andraBörjan.filter((f) => f.id !== GRUNDMALL_FORENING_ID).length > 0 && (
            <div className="border-t border-border px-2 py-2">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Byt förening
              </p>
              {andraBörjan
                .filter((f) => f.id !== GRUNDMALL_FORENING_ID)
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="option"
                    onClick={() => bytForening(f.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary-dark">
                      {foreningInitial(f.namn, f.id)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {f.namn}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {/* Åtgärder */}
          <div className="border-t border-border px-2 py-2">
            <button
              type="button"
              onClick={() => { router.push(PROVA_GRATIS_PATH); setÖppen(false); }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
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
              Lägg till förening
            </button>
            <button
              type="button"
              onClick={() => { router.push("/styrelse-login"); setÖppen(false); }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75C2 3.784 2.784 3 3.75 3h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 12h-8.5A1.75 1.75 0 0 1 2 10.25v-5.5Zm1.5.25v5h9v-5h-9Z"
                  clipRule="evenodd"
                />
              </svg>
              Inloggningssida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
