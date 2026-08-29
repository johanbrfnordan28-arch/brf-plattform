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
import {
  arKundForening,
  KUND_LOGIN_KNAPP_RUBRIK,
  KUND_LOGIN_PATH,
  listaKundForeningar,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import { arSailorForening } from "@/lib/sailor-forening";
import { hamtaForeningStartPath } from "@/lib/styrelse-kontakt";
import {
  arStandardTestForening,
  rensaStandardTestForening,
} from "@/lib/testforeningar";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export type LoginLage = "test" | "kund";

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
  lage: LoginLage;
  onLoggaIn: () => void;
  onBekraftaRensa?: () => void;
}

function ForeningKort({
  forening,
  lage,
  onLoggaIn,
  onBekraftaRensa,
}: ForeningKortProps) {
  const ini = initial(forening.namn);
  const egen = arEgenTestForening(forening.id);
  const kund = arKundForening(forening);
  const visaDemo = !egen && !arSailorForening(forening.id);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white shadow-sm">
          {ini}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-foreground">{forening.namn}</p>
            {kund ? (
              <span className="rounded-full border border-primary/40 bg-[#eef6f0] px-2 py-0.5 text-xs font-semibold text-primary-dark">
                Kund
              </span>
            ) : egen ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Testperiod
              </span>
            ) : visaDemo ? (
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                Demo
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
            {forening.skapadTidpunkt && (
              <span>Skapad {formatDatum(forening.skapadTidpunkt)}</span>
            )}
            {kund && forening.avtalGodkantTidpunkt && (
              <span className="font-medium text-primary-dark">
                Avtal {formatDatum(forening.avtalGodkantTidpunkt)}
              </span>
            )}
            {!kund && forening.grundinfoPaborjad && (
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
          {lage === "kund"
            ? "Endast er förening — andra föreningars uppgifter syns inte"
            : egen
              ? "Sparad i den här webbläsaren — godkänn avtal för att bli kund"
              : "Fast demoförening för test"}
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

type StyrelseLoginModulProps = {
  /** test = testperiod/demo · kund = endast föreningar med tecknat avtal */
  lage?: LoginLage;
};

export function StyrelseLoginModul({ lage = "test" }: StyrelseLoginModulProps) {
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [sok, setSok] = useState(INLOGGNING_BRF_PREFIX);
  const [rensaId, setRensaId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const listaRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inloggningsPath = lage === "kund" ? KUND_LOGIN_PATH : TEST_LOGIN_PATH;

  function ladda() {
    setForeningar(
      lage === "kund" ? listaKundForeningar() : listaInloggningsForeningar(),
    );
  }

  useEffect(() => {
    ladda();
    setHydrated(true);
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ladda beror av lage
  }, [lage]);

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
  const arKundLage = lage === "kund";

  function loggaIn(id: string) {
    // Kundläge: aktivera bara den valda föreningen — aldrig andras data.
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
          {arKundLage
            ? KUND_LOGIN_KNAPP_RUBRIK
            : "Logga in på er testförening"}
        </p>
        <p className="mb-4 text-center text-sm text-muted">
          {arKundLage ? (
            foreningar.length === 0 ? (
              <>
                Här visas bara föreningar med tecknat avtal. Skapa en testförening,
                spara uppgifterna och godkänn avtalet på föreningssidan — sedan
                syns den här.
              </>
            ) : (
              <>
                Endast er förening med tecknat avtal. Andra föreningar och demos
                visas inte. Skriv vidare efter{" "}
                <strong className="text-foreground">Brf</strong> för att filtrera
                {foreningar[0]
                  ? ` (t.ex. «${föreslaSokExempel(foreningar[0].namn)}»)`
                  : ""}
                .
              </>
            )
          ) : endastEgna ? (
            <>
              Er testförening visas nedan. När ni godkänt avtal loggar ni in via{" "}
              <Link
                href={KUND_LOGIN_PATH}
                className="font-medium text-primary-dark underline hover:no-underline"
              >
                {KUND_LOGIN_KNAPP_RUBRIK}
              </Link>{" "}
              i stället.
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
          {arKundLage
            ? foreningar.length === 0
              ? "Inga kundföreningar i den här webbläsaren ännu"
              : filtrerade.length === 1
                ? "1 förening med avtal"
                : `${filtrerade.length} av ${foreningar.length} med avtal`
            : endastEgna
              ? filtrerade.length === 1
                ? "1 sparad testförening"
                : `${filtrerade.length} av ${foreningar.length} sparade`
              : `${foreningar.length} demoföreningar — skapa er egen via Pröva gratis`}
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
                {arKundLage && foreningar.length === 0
                  ? "Ingen kundförening ännu"
                  : `Ingen förening matchar «${sok.trim()}»`}
              </p>
              <p className="mt-2 text-sm text-muted">
                {arKundLage ? (
                  <>
                    Gå till er testförening, spara uppgifterna och{" "}
                    <Link
                      href="/forening/uppgifter"
                      className="font-medium text-primary-dark underline hover:no-underline"
                    >
                      godkänn avtalet
                    </Link>
                    , eller{" "}
                    <Link
                      href={PROVA_GRATIS_PATH}
                      className="font-medium text-primary-dark underline hover:no-underline"
                    >
                      skapa en testförening
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Kontrollera stavningen, eller{" "}
                    <Link
                      href={PROVA_GRATIS_PATH}
                      className="font-medium text-primary-dark underline hover:no-underline"
                    >
                      skapa er testförening
                    </Link>
                    .
                  </>
                )}
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
                    lage={lage}
                    onLoggaIn={() => loggaIn(f.id)}
                    onBekraftaRensa={
                      !arKundLage && arStandardTestForening(f.id)
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
              {arKundLage
                ? "Varje föreningssida är bara er egen"
                : "Från test till kund"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {arKundLage ? (
                <>
                  När ni loggar in aktiveras endast den valda föreningen.
                  Moduler, dokument och uppgifter är isolerade — andras data
                  syns inte.
                </>
              ) : (
                <>
                  1) Skapa testförening · 2) Spara föreningsuppgifter · 3)
                  Godkänn avtal på föreningssidan · 4) Logga in via{" "}
                  <strong className="text-foreground">
                    {KUND_LOGIN_KNAPP_RUBRIK}
                  </strong>
                  .
                </>
              )}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}${inloggningsPath}`
                  : inloggningsPath}
              </code>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${inloggningsPath}`,
                    );
                  }
                }}
                className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-foreground"
              >
                Kopiera
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
