"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PLATTFORM_LOGIN_PATH } from "@/lib/auth/projekt-admin";

type Inloggning = {
  id: string;
  epost: string;
  typ: string;
  foreningId: string | null;
  foreningsNamn: string | null;
  lyckad: boolean;
  ip: string;
  tidpunkt: string;
};

type ForeningRad = {
  id: string;
  namn: string;
  epost: string;
  avtalGodkant: boolean;
  medlemmar: Array<{ roll: string; epost: string; namn: string }>;
};

type MejlRad = {
  id: string;
  till: string;
  amne: string;
  brodtext: string;
  skickadVia: string;
  skapadTidpunkt: string;
};

export function PlattformDashboard() {
  const [epost, setEpost] = useState<string | null>(null);
  const [forbjuden, setForbjuden] = useState(false);
  const [inloggningar, setInloggningar] = useState<Inloggning[]>([]);
  const [foreningar, setForeningar] = useState<ForeningRad[]>([]);
  const [mejl, setMejl] = useState<MejlRad[]>([]);
  const [fel, setFel] = useState<string | null>(null);

  const ladda = useCallback(async () => {
    setFel(null);
    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json()) as {
      inloggad?: boolean;
      typ?: string;
      epost?: string;
    };
    if (!session.inloggad || session.typ !== "PLATTFORM") {
      setForbjuden(true);
      return;
    }
    setEpost(session.epost || null);
    setForbjuden(false);

    const [logRes, forRes, mejlRes] = await Promise.all([
      fetch("/api/plattform/inloggningar?limit=80"),
      fetch("/api/plattform/foreningar"),
      fetch("/api/plattform/mejl-outbox"),
    ]);

    if (!logRes.ok || !forRes.ok || !mejlRes.ok) {
      setFel("Kunde inte ladda plattformsdata.");
      return;
    }

    const logData = (await logRes.json()) as { inloggningar: Inloggning[] };
    const forData = (await forRes.json()) as { foreningar: ForeningRad[] };
    const mejlData = (await mejlRes.json()) as { mejl: MejlRad[] };
    setInloggningar(logData.inloggningar || []);
    setForeningar(forData.foreningar || []);
    setMejl(mejlData.mejl || []);
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function loggaUt() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = PLATTFORM_LOGIN_PATH;
  }

  if (forbjuden) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-muted">Du behöver plattformsinloggning.</p>
        <Link
          href={PLATTFORM_LOGIN_PATH}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Logga in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Intern yta — syns inte för styrelser
          </p>
          <h1 className="text-2xl font-bold text-foreground">Plattform</h1>
          {epost ? (
            <p className="mt-1 text-sm text-muted">Inloggad som {epost}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href="/konto/byt-losenord"
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Byt lösenord
          </Link>
          <button
            type="button"
            onClick={() => void loggaUt()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Logga ut
          </button>
        </div>
      </header>

      {fel ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {fel}
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Inloggningshistorik</h2>
        <p className="mt-1 text-sm text-muted">
          Visas bara här — aldrig för styrelsen.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-3">Tid</th>
                <th className="py-2 pr-3">E-post</th>
                <th className="py-2 pr-3">Typ</th>
                <th className="py-2 pr-3">Förening</th>
                <th className="py-2 pr-3">Resultat</th>
                <th className="py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {inloggningar.map((rad) => (
                <tr key={rad.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(rad.tidpunkt).toLocaleString("sv-SE")}
                  </td>
                  <td className="py-2 pr-3">{rad.epost}</td>
                  <td className="py-2 pr-3">{rad.typ}</td>
                  <td className="py-2 pr-3">
                    {rad.foreningsNamn || rad.foreningId || "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {rad.lyckad ? "OK" : "Misslyckad"}
                  </td>
                  <td className="py-2 text-muted">{rad.ip || "—"}</td>
                </tr>
              ))}
              {inloggningar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted">
                    Inga inloggningar ännu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Föreningar</h2>
        <ul className="mt-3 space-y-3">
          {foreningar.map((f) => (
            <li
              key={f.id}
              className="rounded-lg border border-border/80 bg-surface/40 px-3 py-3 text-sm"
            >
              <p className="font-semibold text-foreground">
                {f.namn}{" "}
                {f.avtalGodkant ? (
                  <span className="text-xs font-medium text-primary-dark">
                    · Kund
                  </span>
                ) : null}
              </p>
              <p className="text-muted">{f.epost || "—"}</p>
              <ul className="mt-2 text-xs text-muted">
                {f.medlemmar.map((m) => (
                  <li key={`${f.id}-${m.epost}-${m.roll}`}>
                    {m.roll}: {m.namn || "—"} ({m.epost})
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {foreningar.length === 0 ? (
            <li className="text-sm text-muted">Inga föreningar på servern.</li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Mejl-outbox</h2>
        <p className="mt-1 text-sm text-muted">
          När SMTP/Resend saknas sparas mejl här (t.ex. tillfälliga lösenord till
          admin).
        </p>
        <ul className="mt-3 space-y-3">
          {mejl.slice(0, 20).map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-border/80 px-3 py-3 text-sm"
            >
              <p className="font-medium">
                {m.amne}{" "}
                <span className="text-xs text-muted">({m.skickadVia})</span>
              </p>
              <p className="text-muted">Till: {m.till}</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-surface p-2 text-xs text-foreground">
                {m.brodtext}
              </pre>
            </li>
          ))}
          {mejl.length === 0 ? (
            <li className="text-sm text-muted">Outboxen är tom.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
