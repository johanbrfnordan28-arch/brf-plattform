"use client";

import { useEffect, useState, type ReactNode } from "react";

const SESSION_KEY = "brf-navet-upphandling-bankid";

type BankidSteg = "idle" | "pågår" | "klar";

type Props = {
  children: ReactNode;
  /** Kort rubrik ovanför inloggningsytan. */
  rubrik?: string;
};

/**
 * Demo-BankID-grind för intern upphandling.
 * Endast inloggade (session) får skapa/uppdatera projektinformation.
 */
export function NavetBankIdGrind({
  children,
  rubrik = "Logga in med BankID",
}: Props) {
  const [inloggad, setInloggad] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [steg, setSteg] = useState<BankidSteg>("idle");
  const [namn, setNamn] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { namn?: string; ok?: boolean };
        if (parsed.ok) {
          setInloggad(true);
          setNamn(parsed.namn ?? "");
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function loggaIn() {
    if (!namn.trim()) return;
    setSteg("pågår");
    window.setTimeout(() => {
      const sparad = { ok: true, namn: namn.trim(), tid: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sparad));
      setInloggad(true);
      setSteg("klar");
      window.setTimeout(() => setSteg("idle"), 1200);
    }, 1800);
  }

  function loggaUt() {
    sessionStorage.removeItem(SESSION_KEY);
    setInloggad(false);
    setNamn("");
    setSteg("idle");
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Kontrollerar behörighet…</p>;
  }

  if (!inloggad) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-5 sm:p-6">
        <h3 className="font-semibold text-foreground">{rubrik}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Endast Styrelse-Navet kan lägga in och uppdatera projektinformation.
          Handlingar mejlas ut — de publiceras inte på den publika sidan. Anbud
          som kommer in via mejl registreras här efter inloggning.
        </p>
        <p className="mt-2 text-xs text-muted">
          Demo: simulerad BankID-inloggning (ingen riktig e-legitimation ännu).
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-foreground">Namn (demo)</span>
          <input
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-border bg-white px-3 py-2"
            placeholder="För- och efternamn"
            disabled={steg === "pågår"}
          />
        </label>
        <button
          type="button"
          disabled={!namn.trim() || steg === "pågår"}
          onClick={loggaIn}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {steg === "pågår"
            ? "Öppnar BankID…"
            : steg === "klar"
              ? "Inloggad"
              : "Identifiera dig med BankID"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-[#eef6f0]/70 px-3 py-2 text-sm">
        <p className="text-primary-dark">
          Inloggad med BankID
          {namn ? (
            <>
              {" "}
              · <span className="font-medium">{namn}</span>
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={loggaUt}
          className="text-xs font-medium text-muted hover:text-foreground"
        >
          Logga ut
        </button>
      </div>
      {children}
    </div>
  );
}
