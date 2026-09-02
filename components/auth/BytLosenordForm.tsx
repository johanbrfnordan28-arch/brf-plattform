"use client";

import Link from "next/link";
import { useState } from "react";
import { uppdateraLokalLosenord } from "@/lib/auth/lokal-konto";

type BytLosenordFormProps = {
  /** Om true: ingen egen sidtitel, mer kompakt. */
  inbaddad?: boolean;
  /** Anropas efter lyckat byte (t.ex. för att ladda om "visa lösenord"). */
  onLyckat?: () => void;
};

export function BytLosenordForm({
  inbaddad = false,
  onLyckat,
}: BytLosenordFormProps) {
  const [nuvarande, setNuvarande] = useState("");
  const [nytt, setNytt] = useState("");
  const [bekrafta, setBekrafta] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [laddar, setLaddar] = useState(false);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(false);
    if (nytt !== bekrafta) {
      setFel("De nya lösenorden stämmer inte överens.");
      return;
    }
    setLaddar(true);
    try {
      const res = await fetch("/api/auth/byt-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuvarande, nytt }),
      });
      const data = (await res.json()) as { fel?: string; ok?: boolean };

      if (res.ok) {
        setOk(true);
        setNuvarande("");
        setNytt("");
        setBekrafta("");
        onLyckat?.();
        return;
      }

      // Lokal fallback när databas saknas (503) eller ej inloggad via server
      if (res.status === 503 || res.status === 401) {
        const sessionRes = await fetch("/api/auth/session");
        const session = (await sessionRes.json()) as {
          inloggad?: boolean;
          epost?: string;
        };
        const epost = session.epost?.trim();
        if (epost) {
          const lokal = uppdateraLokalLosenord(epost, nuvarande, nytt);
          if (lokal.ok) {
            setOk(true);
            setNuvarande("");
            setNytt("");
            setBekrafta("");
            onLyckat?.();
            return;
          }
          setFel(lokal.fel);
          return;
        }
        // Försök lokal utan session — användaren kan ha lokalt konto
        // men då behöver vi e-post. Visa tydligt fel.
      }

      setFel(data.fel || "Kunde inte byta lösenord.");
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }

  return (
    <form
      id="byt-losenord"
      onSubmit={skicka}
      className={`space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm ${
        inbaddad ? "" : "mx-auto max-w-md"
      }`}
    >
      {inbaddad ? (
        <h2 className="text-lg font-bold text-foreground">Byt lösenord</h2>
      ) : (
        <h1 className="text-xl font-bold text-foreground">Byt lösenord</h1>
      )}
      <p className="text-sm text-muted">
        Det nya lösenordet sparas automatiskt så att du kan visa det under Konto
        → Spara/visa mitt lösenord.{" "}
        {!inbaddad && (
          <>
            Du måste vara inloggad.{" "}
            <Link href="/styrelse-login" className="text-primary-dark underline">
              Logga in
            </Link>
          </>
        )}
      </p>
      <label className="block text-sm">
        <span className="font-medium">Nuvarande lösenord</span>
        <input
          type="password"
          value={nuvarande}
          onChange={(e) => setNuvarande(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          autoComplete="current-password"
        />
      </label>
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
        <span className="font-medium">Bekräfta nytt lösenord</span>
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
      {ok ? (
        <p
          className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
          role="status"
        >
          Lösenordet är bytt och sparat — du kan visa det ovan under «Spara/visa
          mitt lösenord».
        </p>
      ) : null}
      <button
        type="submit"
        disabled={laddar}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Sparar …" : "Spara nytt lösenord"}
      </button>
    </form>
  );
}
