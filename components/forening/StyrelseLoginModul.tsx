"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  markeraPendingAktivForening,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  arEgenTestForening,
  arEndastEgnaForeningar,
  filtreraForeningarPaSok,
  föreslaSokExempel,
  INLOGGNING_BRF_PREFIX,
  listaInloggningsForeningar,
  normaliseraBrfSoktext,
} from "@/lib/forening-inloggning";
import { arSailorForening } from "@/lib/sailor-forening";
import { hamtaForeningStartPath } from "@/lib/styrelse-kontakt";
import {
  arStandardTestForening,
  rensaStandardTestForening,
} from "@/lib/testforeningar";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

const INLOGGNING_PATH = "/styrelse-login";

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
  onBekraftaRensa?: () => void;
}

function ForeningKort({
  forening,
  onLoggaIn,
  onBekraftaRensa,
}: ForeningKortProps) {
  const ini = initial(forening.namn);
  const egen = arEgenTestForening(forening.id);
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
            {egen ? (
              <span className="rounded-full border border-primary/40 bg-[#eef6f0] px-2 py-0.5 text-xs font-semibold text-primary-dark">
                Er testförening
              </span>
            ) : visaTestperiod ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Demo
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
            {forening.skapadTidpunkt && (
              <span>Skapad {formatDatum(forening.skapadTidpunkt)}</span>
            )}
            {forening.grundinfoPaborjad && (
              <span className="font-medium text-primary-dark">
                ✓ Föreningsuppgifter sparade
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
          {egen
            ? "Sparad i den här webbläsaren — syns när ni söker på namnet"
            : visaTestperiod
              ? "Fast demoförening för test"
              : "Data sparas lokalt i webbläsaren"}
        </p>
        {onBekraftaRensa && (
          <button
            type="button"
            onClick={onBekraftaRensa}
            className="text-xs text-muted hover:text-red-600"
          >
            Rensa all data
          </button>
        )}
      </div>
    </div>
  );
}

export function StyrelseLoginModul() {
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [sok, setSok] = useState(INLOGGNING_BRF_PREFIX);
  const [rensaId, setRensaId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const listaRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function ladda() {
    setForeningar(listaInloggningsForeningar());
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    inputRef.current?.focus();
    const el = inputRef.current;
    if (el) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [hydrated]);

  const filtrerade = useMemo(
    () => filtreraForeningarPaSok(foreningar, sok),
    [foreningar, sok],
  );

  const endastEgna = arEndastEgnaForeningar(foreningar);

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

  function onSokChange(varde: string) {
    setSok(normaliseraBrfSoktext(varde));
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-3 px-4">
        <div className="h-12 rounded-2xl bg-border/40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-border/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      <section>
        <p className="mb-1 text-center text-sm font-medium text-foreground">
          Logga in på er testförening
        </p>
        <p className="mb-4 text-center text-sm text-muted">
          {endastEgna ? (
            <>
              Er sparade testförening visas nedan. Skriv vidare efter{" "}
              <strong className="text-foreground">Brf</strong> för att filtrera
              (t.ex. «{föreslaSokExempel(foreningar[0]?.namn ?? "Brf St")}»).
              Övriga demoföreningar syns inte.
            </>
          ) : (
            <>
              Börja med <strong className="text-foreground">Brf</strong> och
              skriv fler bokstäver — listan filtreras. Har ni skapat en egen
              testförening syns den i stället för demoföreningarna.
            </>
          )}
        </p>

        <label className="block">
          <span className="sr-only">Sök förening</span>
          <div className="flex overflow-hidden rounded-2xl border-2 border-primary/40 bg-white shadow-sm focus-within:border-primary">
            <span className="flex items-center bg-[#eef6f0] px-3 text-sm font-semibold text-primary-dark">
              Sök
            </span>
            <input
              ref={inputRef}
              type="text"
              value={sok}
              onChange={(e) => onSokChange(e.target.value)}
              placeholder={INLOGGNING_BRF_PREFIX}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base font-medium text-foreground outline-none"
              aria-controls="forening-sok-lista"
              aria-expanded={filtrerade.length > 0}
            />
          </div>
        </label>

        <p className="mt-2 text-center text-xs text-muted">
          {endastEgna
            ? filtrerade.length === 1
              ? "1 sparad testförening"
              : `${filtrerade.length} av ${foreningar.length} sparade`
            : `${foreningar.length} demoföreningar — skapa er egen via Pröva gratis så syns bara den`}
        </p>

        <ul
          id="forening-sok-lista"
          ref={listaRef}
          className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto overscroll-contain pr-1"
          role="listbox"
        >
          {filtrerade.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-white px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Ingen förening matchar «{sok.trim()}»
              </p>
              <p className="mt-2 text-sm text-muted">
                {endastEgna && foreningar.length > 0 ? (
                  <>
                    Rensa sökningen till «Brf » för att se alla sparade, eller{" "}
                  </>
                ) : null}
                Kontrollera stavningen, eller{" "}
                <Link
                  href={PROVA_GRATIS_PATH}
                  className="font-medium text-primary-dark underline hover:no-underline"
                >
                  skapa er testförening
                </Link>
                .
              </p>
            </li>
          ) : (
            filtrerade.map((f) =>
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
                <li key={f.id} role="option">
                  <ForeningKort
                    forening={f}
                    onLoggaIn={() => loggaIn(f.id)}
                    onBekraftaRensa={
                      arStandardTestForening(f.id)
                        ? () => setRensaId(f.id)
                        : undefined
                    }
                  />
                </li>
              ),
            )
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
              Hur hittar ni er förening nästa gång?
            </p>
            <p className="mt-1 text-sm text-muted">
              Från Styrelse-Navets startsida:{" "}
              <strong className="text-foreground">Testföreningar</strong> eller{" "}
              <strong className="text-foreground">Logga in styrelse</strong>.
              Er sparade testförening visas direkt — övriga demoföreningar syns
              inte när ni har skapat en egen.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}${INLOGGNING_PATH}`
                  : INLOGGNING_PATH}
              </code>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${INLOGGNING_PATH}`,
                    );
                  }
                }}
                className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-foreground"
              >
                Kopiera
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Data sparas i webbläsaren på den här datorn. Fyll i och spara
              föreningsuppgifter inne på föreningssidan så är ni lätta att hitta
              igen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
