"use client";

import Link from "next/link";
import { useState } from "react";

export function BytLosenordForm() {
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
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte byta lösenord.");
        return;
      }
      setOk(true);
      setNuvarande("");
      setNytt("");
      setBekrafta("");
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }

  return (
    <form onSubmit={skicka} className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-foreground">Byt lösenord</h1>
      <p className="text-sm text-muted">
        Du måste vara inloggad.{" "}
        <Link href="/styrelse-login" className="text-primary-dark underline">
          Logga in
        </Link>
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
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {fel}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark" role="status">
          Lösenordet är bytt.
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
