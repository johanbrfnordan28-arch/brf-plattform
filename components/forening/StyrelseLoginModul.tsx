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
  hamtaSokSuffix,
  INLOGGNING_BRF_PREFIX,
  listaInloggningsForeningar,
  MIN_SOK_BOKSTAVER_EFTER_BRF,
  normaliseraBrfSoktext,
  sokKräverFlerBokstaver,
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
            {kund && forening.avtalGodkantTidpunkt ? (
              <span className="font-medium text-primary-dark">
                Avtal {formatDatum(forening.avtalGodkantTidpunkt)}
              </span>
            ) : null}
            {!kund && forening.grundinfoPaborjad ? (
              <span className="font-medium text-primary-dark">
                ✓ Föreningsuppgifter sparade
              </span>
            ) : null}
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
            ? "Endast er förening öppnas — andras uppgifter syns inte"
            : egen
              ? "Er testförening i den här webbläsaren"
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
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [kontoFel, setKontoFel] = useState<string | null>(null);
  const [kontoLaddar, setKontoLaddar] = useState(false);
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
  const vantarPaSok = sokKräverFlerBokstaver(sok, foreningar);
  const arKundLage = lage === "kund";
  const kvarAttSkriva = Math.max(
    0,
    MIN_SOK_BOKSTAVER_EFTER_BRF - hamtaSokSuffix(sok).length,
  );

  function loggaIn(id: string) {
    markeraPendingAktivForening(id);
    sattAktivForeningId(id);
    window.location.assign(hamtaForeningStartPath(id));
  }

  async function loggaInMedKonto(event: React.FormEvent) {
    event.preventDefault();
    setKontoFel(null);
    setKontoLaddar(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost, losenord }),
      });
      const data = (await res.json()) as {
        fel?: string;
        foreningId?: string;
        epost?: string;
      };

      const { sparaLokalKonto } = await import("@/lib/auth/lokal-konto");
      const { sparaLokalSession } = await import("@/lib/auth/lokal-session");

      if (res.ok && data.foreningId) {
        // Spara lösenordet lokalt så det syns under Konto även om kuvert saknas
        sparaLokalKonto({
          epost: (data.epost || epost).trim().toLowerCase(),
          losenord,
          foreningId: data.foreningId,
          namn: "",
          roll: "Ledamot",
        });
        sparaLokalSession({
          epost: (data.epost || epost).trim().toLowerCase(),
          foreningId: data.foreningId,
          namn: "",
          inloggadTidpunkt: new Date().toISOString(),
        });
        markeraPendingAktivForening(data.foreningId);
        sattAktivForeningId(data.foreningId);
        window.location.assign(hamtaForeningStartPath(data.foreningId));
        return;
      }

      // Fallback: lokalt sparat konto (när servern saknar databas)
      if (res.status === 503 || !res.ok) {
        const { verifieraLokalKonto } = await import("@/lib/auth/lokal-konto");
        const lokal = verifieraLokalKonto(epost, losenord);
        if (lokal) {
          sparaLokalKonto(lokal);
          sparaLokalSession({
            epost: lokal.epost,
            foreningId: lokal.foreningId,
            namn: lokal.namn,
            inloggadTidpunkt: new Date().toISOString(),
          });
          markeraPendingAktivForening(lokal.foreningId);
          sattAktivForeningId(lokal.foreningId);
          window.location.assign(hamtaForeningStartPath(lokal.foreningId));
          return;
        }
      }

      setKontoFel(data.fel || "Inloggning misslyckades.");
    } catch {
      try {
        const { verifieraLokalKonto, sparaLokalKonto } = await import(
          "@/lib/auth/lokal-konto"
        );
        const { sparaLokalSession } = await import("@/lib/auth/lokal-session");
        const lokal = verifieraLokalKonto(epost, losenord);
        if (lokal) {
          sparaLokalKonto(lokal);
          sparaLokalSession({
            epost: lokal.epost,
            foreningId: lokal.foreningId,
            namn: lokal.namn,
            inloggadTidpunkt: new Date().toISOString(),
          });
          markeraPendingAktivForening(lokal.foreningId);
          sattAktivForeningId(lokal.foreningId);
          window.location.assign(hamtaForeningStartPath(lokal.foreningId));
          return;
        }
      } catch {
        /* ignore */
      }
      setKontoFel("Kunde inte nå servern.");
    } finally {
      setKontoLaddar(false);
    }
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
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-border/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4">
      <section className="rounded-2xl border-2 border-primary/30 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">
          Logga in med e-post och lösenord
        </h2>
        <p className="mt-1 text-sm text-muted">
          Lösenordet skickades när föreningen skapades.{" "}
          <Link
            href="/konto/glomt-losenord"
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            Glömt lösenord?
          </Link>
          . När du är inloggad byter du lösenord under{" "}
          <strong className="font-medium text-foreground">Konto</strong>.
        </p>
        <form onSubmit={loggaInMedKonto} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-foreground">E-post</span>
            <input
              type="email"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Lösenord</span>
            <input
              type="password"
              value={losenord}
              onChange={(e) => setLosenord(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              required
            />
          </label>
          {kontoFel ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {kontoFel}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={kontoLaddar}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {kontoLaddar ? "Loggar in …" : "Logga in"}
          </button>
        </form>
      </section>

      <section>
        <p className="mb-1 text-center text-sm font-medium text-foreground">
          {arKundLage
            ? "Eller öppna via föreningsnamn"
            : "Eller öppna demoförening / sparad förening"}
        </p>
        <p className="mb-4 text-center text-sm text-muted">
          {arKundLage ? (
            <>
              Skriv er förenings namn efter{" "}
              <strong className="text-foreground">Brf</strong> (minst{" "}
              {MIN_SOK_BOKSTAVER_EFTER_BRF} bokstäver, t.ex. «{föreslaSokExempel()}»).
              Då visas bara den förening som matchar — aldrig en lista över andra.
            </>
          ) : endastEgna ? (
            <>
              Skriv er förenings namn efter{" "}
              <strong className="text-foreground">Brf</strong> (minst{" "}
              {MIN_SOK_BOKSTAVER_EFTER_BRF} bokstäver). Andra sparade föreningar
              listas inte upp. När ni har avtal:{" "}
              <Link
                href={KUND_LOGIN_PATH}
                className="font-medium text-primary-dark underline hover:no-underline"
              >
                {KUND_LOGIN_KNAPP_RUBRIK}
              </Link>
              .
            </>
          ) : (
            <>
              Börja med <strong className="text-foreground">Brf</strong> och
              skriv fler bokstäver för att filtrera demoföreningar — eller skapa
              er egen via Pröva gratis.
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
          {vantarPaSok
            ? `Skriv ${kvarAttSkriva} bokstav${kvarAttSkriva === 1 ? "" : "er"} till efter Brf`
            : filtrerade.length === 0
              ? endastEgna || arKundLage
                ? "Ingen träff — kontrollera stavningen"
                : "Ingen demoförening matchar"
              : filtrerade.length === 1
                ? "Träff — logga in på er förening"
                : "Flera träffar — skriv fler bokstäver för att begränsa"}
        </p>

        <ul
          id="forening-sok-lista"
          ref={listaRef}
          className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto overscroll-contain pr-1"
          role="listbox"
        >
          {vantarPaSok ? (
            <li className="rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/60 px-5 py-8 text-center">
              <p className="text-sm font-medium text-amber-950">
                Skriv föreningens namn
              </p>
              <p className="mt-2 text-sm text-amber-900/80">
                Av integritetsskäl visas ingen lista över sparade föreningar.
                Ange minst {MIN_SOK_BOKSTAVER_EFTER_BRF} bokstäver efter «Brf »
                så dyker er förening upp.
              </p>
            </li>
          ) : filtrerade.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-white px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                {arKundLage && foreningar.length === 0 && !hamtaSokSuffix(sok)
                  ? "Skriv föreningsnamnet för att logga in"
                  : `Ingen förening matchar «${sok.trim()}»`}
              </p>
              <p className="mt-2 text-sm text-muted">
                {arKundLage ? (
                  <>
                    Har ni inte tecknat avtal ännu? Öppna{" "}
                    <Link
                      href={TEST_LOGIN_PATH}
                      className="font-medium text-primary-dark underline hover:no-underline"
                    >
                      Testperiod
                    </Link>
                    , spara uppgifter och godkänn avtalet — eller{" "}
                    <Link
                      href={PROVA_GRATIS_PATH}
                      className="font-medium text-primary-dark underline hover:no-underline"
                    >
                      skapa er förening
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
                      testföreningen raderas.
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
              För styrelsen — enkelt att komma tillbaka
            </p>
            <p className="mt-1 text-sm text-muted">
              {arKundLage ? (
                <>
                  Kom ihåg föreningsnamnet. Sök → logga in → bara er sida öppnas.
                  Andra föreningar syns inte.
                </>
              ) : (
                <>
                  1) Skapa via Pröva gratis · 2) Spara uppgifter · 3) Godkänn
                  avtal · 4) Logga in via {KUND_LOGIN_KNAPP_RUBRIK}. Under
                  testperioden: sök på namnet här — utan att se andras föreningar.
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
