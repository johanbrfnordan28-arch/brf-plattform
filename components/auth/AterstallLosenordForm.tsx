"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { aterstallLokalMedToken } from "@/lib/auth/lokal-aterstallning";
import { hamtaLokalKonto } from "@/lib/auth/lokal-konto";
import { sparaLokalSession } from "@/lib/auth/lokal-session";

export function AterstallLosenordForm() {
  const params = useSearchParams();
  const tokenFranUrl = params.get("token") || "";
  const arLokal = params.get("lokal") === "1";
  const [token, setToken] = useState(tokenFranUrl);
  const [nytt, setNytt] = useState("");
  const [bekrafta, setBekrafta] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [laddar, setLaddar] = useState(false);

  function hanteraLokalOk(epost: string) {
    const konto = hamtaLokalKonto(epost);
    if (konto) {
      sparaLokalSession({
        epost: konto.epost,
        foreningId: konto.foreningId,
        namn: konto.namn,
        inloggadTidpunkt: new Date().toISOString(),
      });
    }
    setOk(true);
  }

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    if (nytt !== bekrafta) {
      setFel("Lösenorden stämmer inte överens.");
      return;
    }
    setLaddar(true);
    try {
      if (arLokal) {
        const lokal = aterstallLokalMedToken(token, nytt);
        if (!lokal.ok) {
          setFel(lokal.fel);
          return;
        }
        hanteraLokalOk(lokal.epost);
        return;
      }

      const res = await fetch("/api/auth/aterstall-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nytt }),
      });
      const data = (await res.json()) as { fel?: string };
      if (res.ok) {
        setOk(true);
        return;
      }

      if (res.status === 503) {
        const lokal = aterstallLokalMedToken(token, nytt);
        if (!lokal.ok) {
          setFel(lokal.fel);
          return;
        }
        hanteraLokalOk(lokal.epost);
        return;
      }

      setFel(data.fel || "Kunde inte återställa.");
    } catch {
      const lokal = aterstallLokalMedToken(token, nytt);
      if (!lokal.ok) {
        setFel(lokal.fel);
      } else {
        hanteraLokalOk(lokal.epost);
      }
    } finally {
      setLaddar(false);
    }
  }

  if (ok) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">
          Lösenordet är återställt
        </h1>
        <p className="mt-2 text-sm text-muted">
          Logga in med det nya lösenordet — det sparas då för visning under
          Konto.
        </p>
        <Link
          href="/styrelse-login"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Logga in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={skicka}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-bold text-foreground">Välj nytt lösenord</h1>
      {arLokal ? (
        <p className="text-sm text-muted">
          Lokal återställning i den här webbläsaren (databasen saknas på
          servern).
        </p>
      ) : null}
      {!tokenFranUrl ? (
        <label className="block text-sm">
          <span className="font-medium">Återställningstoken</span>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            required
          />
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="font-medium">Nytt lösenord</span>
        <input
          type="password"
          value={nytt}
          onChange={(e) => setNytt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Bekräfta</span>
        <input
          type="password"
          value={bekrafta}
          onChange={(e) => setBekrafta(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      {fel ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={laddar || !token}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Sparar …" : "Spara lösenord"}
      </button>
    </form>
  );
}
