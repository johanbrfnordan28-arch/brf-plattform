"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLATTFORM_START_PATH } from "@/lib/auth/projekt-admin";

export function PlattformLoginForm() {
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [kod, setKod] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setLaddar(true);
    try {
      const res = await fetch("/api/auth/plattform-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost, losenord: kod }),
      });
      const data = (await res.json()) as { fel?: string };
      if (!res.ok) {
        setFel(data.fel || "Inloggning misslyckades.");
        return;
      }
      router.push(PLATTFORM_START_PATH);
      router.refresh();
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }

  return (
    <form
      onSubmit={skicka}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-bold text-foreground">Personalinloggning</h1>
      <p className="text-sm text-muted">
        Logga in med e-post och kod. BankID kommer snart. Endast behörig personal
        — styrelser och allmänheten har ingen tillgång hit.
      </p>
      <label className="block text-sm">
        <span className="font-medium">E-post</span>
        <input
          type="email"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          autoComplete="username"
          placeholder="johancarlsen@icloud.com"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Kod</span>
        <input
          type="password"
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          required
          minLength={8}
          autoComplete="current-password"
        />
        <span className="mt-1 block text-xs text-muted">
          Använd er startkod eller den kod ni fått. Byts inne på plattformen.
        </span>
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
        disabled={laddar}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Loggar in …" : "Logga in med kod"}
      </button>
      <p className="text-center text-xs text-muted">BankID-inloggning kommer inom kort.</p>
    </form>
  );
}
