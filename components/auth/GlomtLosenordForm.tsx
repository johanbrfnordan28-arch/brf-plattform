"use client";

import Link from "next/link";
import { useState } from "react";

export function GlomtLosenordForm() {
  const [epost, setEpost] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setMeddelande(null);
    setLaddar(true);
    try {
      const res = await fetch("/api/auth/glomt-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost }),
      });
      const data = (await res.json()) as { fel?: string; meddelande?: string };
      if (!res.ok) {
        setFel(data.fel || "Kunde inte skicka återställning.");
        return;
      }
      setMeddelande(
        data.meddelande ||
          "Om kontot finns skickas en återställningslänk till e-postadressen.",
      );
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }

  return (
    <form onSubmit={skicka} className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-foreground">Glömt lösenord</h1>
      <p className="text-sm text-muted">
        Ange e-postadressen som användes när föreningen skapades. Du får en länk
        för att välja nytt lösenord.
      </p>
      <label className="block text-sm">
        <span className="font-medium">E-post</span>
        <input
          type="email"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          autoComplete="email"
        />
      </label>
      {fel ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {fel}
        </p>
      ) : null}
      {meddelande ? (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark" role="status">
          {meddelande}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={laddar}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Skickar …" : "Skicka återställningslänk"}
      </button>
      <Link href="/styrelse-login" className="block text-sm text-primary-dark underline">
        Tillbaka till inloggning
      </Link>
    </form>
  );
}
