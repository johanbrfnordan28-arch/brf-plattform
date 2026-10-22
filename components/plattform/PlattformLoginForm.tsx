"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  PLATTFORM_LOGIN_PATH,
  PLATTFORM_START_PATH,
} from "@/lib/auth/projekt-admin";

function PlattformLoginFormInre() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [epost, setEpost] = useState("");
  const [kod, setKod] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);
  const bankidStartUrl = `/api/auth/idura/start?returnTo=${encodeURIComponent(PLATTFORM_START_PATH)}&loginSida=${encodeURIComponent(PLATTFORM_LOGIN_PATH)}`;
  const bankidKoppla =
    searchParams.get("bankid") === "koppla"
      ? searchParams.get("namn")
        ? `BankID verifierat (${searchParams.get("namn")}). Logga in med e-post och kod en gång — då kopplas BankID till kontot.`
        : "BankID verifierat. Logga in med e-post och kod en gång — då kopplas BankID till kontot."
      : null;
  const bankidFel =
    searchParams.get("bankid") === "fel"
      ? searchParams.get("meddelande") || "BankID-inloggning misslyckades."
      : null;

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
        Logga in med e-post och kod, eller med BankID. Endast behörig personal —
        styrelser och allmänheten har ingen tillgång hit. Första gången med
        BankID loggar ni in med koden direkt efteråt. Fungerar även i demoläge
        utan databas (mässa), då utan BankID.
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
      {bankidKoppla ? (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {bankidKoppla}
        </p>
      ) : null}
      {fel || bankidFel ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel || bankidFel}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={laddar}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Loggar in …" : "Logga in med kod"}
      </button>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">Logga in med BankID</p>
        <p className="mt-1 text-xs text-muted">
          Samma testmiljö via Idura som styrelsen. Kräver databas. Ett BankID
          som redan hör till en förening kan inte användas här.
        </p>
        <a
          href={bankidStartUrl}
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border-2 border-primary/40 bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0]"
        >
          Identifiera med BankID
        </a>
      </div>
    </form>
  );
}

export function PlattformLoginForm() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-md text-sm text-muted">Laddar inloggning …</p>
      }
    >
      <PlattformLoginFormInre />
    </Suspense>
  );
}
