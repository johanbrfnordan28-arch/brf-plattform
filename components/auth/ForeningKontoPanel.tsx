"use client";

import { useState } from "react";
import Link from "next/link";
import { BytLosenordForm } from "@/components/auth/BytLosenordForm";
import { MittLosenordKort } from "@/components/auth/MittLosenordKort";

/**
 * Styrelsens kontosida — spara/visa lösenord + byt lösenord på samma ställe.
 */
export function ForeningKontoPanel() {
  const [nyckel, setNyckel] = useState(0);
  const [skickar, setSkickar] = useState(false);
  const [skickatMeddelande, setSkickatMeddelande] = useState<string | null>(
    null,
  );
  const [skickatFel, setSkickatFel] = useState<string | null>(null);

  async function skickaLosenordMejl() {
    setSkickatFel(null);
    setSkickatMeddelande(null);
    setSkickar(true);
    try {
      const res = await fetch("/api/auth/skicka-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { fel?: string; meddelande?: string };
      if (!res.ok) {
        setSkickatFel(data.fel || "Kunde inte skicka lösenordet.");
        return;
      }
      setSkickatMeddelande(
        data.meddelande ||
          "Ett nytt tillfälligt lösenord har skickats till din e-post.",
      );
      setNyckel((n) => n + 1);
    } catch {
      setSkickatFel("Kunde inte nå servern.");
    } finally {
      setSkickar(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Konto
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Ditt inloggningskonto
        </h2>
        <p className="mt-2 text-sm text-muted">
          Här hanterar du ditt eget lösenord. Andra i styrelsen ser aldrig ditt
          lösenord — och du ser aldrig deras.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            <strong className="font-medium text-foreground">
              Spara/visa mitt lösenord
            </strong>{" "}
            — se det lösenord som sparats för dig (aldrig andras)
          </li>
          <li>
            <strong className="font-medium text-foreground">Byt lösenord</strong>{" "}
            — nuvarande lösenord fylls i automatiskt när du är inloggad
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Skicka lösenord via e-post
            </strong>{" "}
            — får du ett nytt tillfälligt lösenord till din mejl
          </li>
        </ul>
      </div>

      <MittLosenordKort key={nyckel} />

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Skicka lösenord via e-post
        </h2>
        <p className="mt-2 text-sm text-muted">
          Skapar ett nytt tillfälligt lösenord och skickar det till din
          e-postadress. Det tidigare lösenordet slutar då gälla.
        </p>
        <button
          type="button"
          disabled={skickar}
          onClick={() => void skickaLosenordMejl()}
          className="brf-knapp-gron mt-4 px-5 py-2.5 text-sm shadow-sm disabled:opacity-50"
        >
          {skickar ? "Skickar …" : "Skicka nytt lösenord till min e-post"}
        </button>
        {skickatMeddelande ? (
          <p className="mt-3 text-sm text-primary-dark" role="status">
            {skickatMeddelande}
          </p>
        ) : null}
        {skickatFel ? (
          <p className="mt-3 text-sm text-red-800" role="alert">
            {skickatFel}
          </p>
        ) : null}
      </div>

      <BytLosenordForm
        inbaddad
        onLyckat={() => setNyckel((n) => n + 1)}
      />

      <p className="text-sm text-muted">
        Glömt lösenordet?{" "}
        <Link
          href="/konto/glomt-losenord"
          className="font-medium text-primary-dark underline"
        >
          Återställ via e-post
        </Link>
        . Översikt över vilka som har inloggning finns under{" "}
        <Link
          href="/forening/uppgifter#inloggning"
          className="font-medium text-primary-dark underline"
        >
          Uppgifter → Inloggning
        </Link>
        .
      </p>
    </div>
  );
}
