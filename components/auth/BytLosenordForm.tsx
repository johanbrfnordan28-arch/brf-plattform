"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hamtaKontoKontext } from "@/lib/auth/konto-kontext";
import {
  hamtaLokalKonto,
  uppdateraLokalLosenord,
  sparaLokalKonto,
} from "@/lib/auth/lokal-konto";
import { sparaLokalSession } from "@/lib/auth/lokal-session";

type BytLosenordFormProps = {
  /** Om true: ingen egen sidtitel, mer kompakt. */
  inbaddad?: boolean;
  /** Anropas efter lyckat byte (t.ex. för att ladda om "visa lösenord"). */
  onLyckat?: () => void;
};

/**
 * Byt lösenord — när du är inloggad fylls nuvarande lösenord i automatiskt
 * (endast ditt eget, aldrig andras).
 */
export function BytLosenordForm({
  inbaddad = false,
  onLyckat,
}: BytLosenordFormProps) {
  const [epost, setEpost] = useState<string | null>(null);
  const [foreningId, setForeningId] = useState<string | null>(null);
  const [nuvarande, setNuvarande] = useState("");
  const [nytt, setNytt] = useState("");
  const [bekrafta, setBekrafta] = useState("");
  const [visaNuvarande, setVisaNuvarande] = useState(false);
  const [harSparatNuvarande, setHarSparatNuvarande] = useState(false);
  const [laddarKonto, setLaddarKonto] = useState(true);
  const [fel, setFel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [laddar, setLaddar] = useState(false);

  useEffect(() => {
    let aktiv = true;
    async function laddaSparat() {
      setLaddarKonto(true);
      try {
        const kontext = await hamtaKontoKontext();
        if (!aktiv || !kontext) return;

        setEpost(kontext.epost);
        setForeningId(kontext.foreningId);
        if (kontext.losenord) {
          setNuvarande(kontext.losenord);
          setHarSparatNuvarande(true);
        }
      } catch {
        /* låt fältet vara tomt */
      } finally {
        if (aktiv) setLaddarKonto(false);
      }
    }
    void laddaSparat();
    return () => {
      aktiv = false;
    };
  }, []);

  function sparaLokaltEfterByte(nyttLosenord: string) {
    if (!epost) return;
    const befintligt = hamtaLokalKonto(epost, foreningId || undefined);
    sparaLokalKonto({
      epost,
      losenord: nyttLosenord,
      foreningId: foreningId || befintligt?.foreningId || "",
      namn: befintligt?.namn || "",
      roll: befintligt?.roll || "Ledamot",
    });
    sparaLokalSession({
      epost,
      foreningId: foreningId || befintligt?.foreningId || "",
      namn: befintligt?.namn || "",
      inloggadTidpunkt: new Date().toISOString(),
    });
  }

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setOk(false);
    if (nytt !== bekrafta) {
      setFel("De nya lösenorden stämmer inte överens.");
      return;
    }
    if (!nuvarande.trim()) {
      setFel("Ange ditt nuvarande lösenord.");
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
        sparaLokaltEfterByte(nytt);
        setOk(true);
        setNuvarande(nytt);
        setHarSparatNuvarande(true);
        setNytt("");
        setBekrafta("");
        onLyckat?.();
        return;
      }

      // Lokal fallback när databas saknas
      if (res.status === 503 || res.status === 401) {
        if (epost) {
          const lokal = uppdateraLokalLosenord(
            epost,
            nuvarande,
            nytt,
            foreningId || undefined,
          );
          if (lokal.ok) {
            sparaLokaltEfterByte(nytt);
            setOk(true);
            setNuvarande(nytt);
            setHarSparatNuvarande(true);
            setNytt("");
            setBekrafta("");
            onLyckat?.();
            return;
          }
          setFel(lokal.fel);
          return;
        }
      }

      setFel(data.fel || "Kunde inte byta lösenord.");
    } catch {
      if (epost) {
        const lokal = uppdateraLokalLosenord(
          epost,
          nuvarande,
          nytt,
          foreningId || undefined,
        );
        if (lokal.ok) {
          sparaLokaltEfterByte(nytt);
          setOk(true);
          setNuvarande(nytt);
          setHarSparatNuvarande(true);
          setNytt("");
          setBekrafta("");
          onLyckat?.();
          return;
        }
        setFel(lokal.fel);
      } else {
        setFel("Kunde inte nå servern.");
      }
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
        {epost ? (
          <>
            Inloggad som{" "}
            <strong className="font-medium text-foreground">{epost}</strong>
            . Endast du ser ditt lösenord — aldrig andra i styrelsen.
            {harSparatNuvarande
              ? " Nuvarande lösenord är ifyllt automatiskt."
              : ""}
          </>
        ) : (
          <>
            Öppna föreningen du skapade, eller{" "}
            <Link href="/styrelse-login" className="text-primary-dark underline">
              logga in
            </Link>
            .
          </>
        )}
      </p>

      {!harSparatNuvarande && epost ? (
        <p className="text-sm text-muted">
          Lösenordet kunde inte fyllas i automatiskt. Ange det du fick vid
          skapande, eller{" "}
          <Link
            href="/konto/glomt-losenord"
            className="font-medium text-primary-dark underline"
          >
            begär en återställningslänk
          </Link>
          .
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="font-medium">Nuvarande lösenord</span>
        <div className="mt-1 flex gap-2">
          <input
            type={visaNuvarande ? "text" : "password"}
            value={nuvarande}
            onChange={(e) => {
              setNuvarande(e.target.value);
              setHarSparatNuvarande(false);
            }}
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2"
            required
            autoComplete="current-password"
            disabled={laddarKonto}
            placeholder={laddarKonto ? "Hämtar sparat lösenord…" : ""}
          />
          <button
            type="button"
            onClick={() => setVisaNuvarande((v) => !v)}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-foreground"
          >
            {visaNuvarande ? "Dölj" : "Visa"}
          </button>
        </div>
        {harSparatNuvarande ? (
          <span className="mt-1 block text-xs text-primary-dark">
            Hämtat från ditt sparade lösenord (bara synligt för dig).
          </span>
        ) : null}
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
          autoFocus={harSparatNuvarande}
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
          Lösenordet är bytt och sparat — bara du kan se det under «Spara/visa
          mitt lösenord».
        </p>
      ) : null}
      <button
        type="submit"
        disabled={laddar || laddarKonto || !epost}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {laddar ? "Sparar …" : "Spara nytt lösenord"}
      </button>
    </form>
  );
}
