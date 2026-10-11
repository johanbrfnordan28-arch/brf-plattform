"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hamtaKontoKontext } from "@/lib/auth/konto-kontext";
import { hamtaLokalKonto, sattLokalLosenord } from "@/lib/auth/lokal-konto";
import { sparaLokalSession } from "@/lib/auth/lokal-session";

type BytLosenordFormProps = {
  /** Om true: ingen egen sidtitel, mer kompakt. */
  inbaddad?: boolean;
  /** Anropas efter lyckat byte (t.ex. för att ladda om "visa lösenord"). */
  onLyckat?: () => void;
};

/**
 * Sätt nytt lösenord när du är inne i föreningen — utan att behöva det gamla.
 */
export function BytLosenordForm({
  inbaddad = false,
  onLyckat,
}: BytLosenordFormProps) {
  const [epost, setEpost] = useState<string | null>(null);
  const [foreningId, setForeningId] = useState<string | null>(null);
  const [nytt, setNytt] = useState("");
  const [bekrafta, setBekrafta] = useState("");
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
    const id = foreningId || "";
    const lokal = sattLokalLosenord(epost, nyttLosenord, id);
    if (!lokal.ok) return;
    const befintligt = hamtaLokalKonto(epost, id || undefined);
    sparaLokalSession({
      epost,
      foreningId: id || befintligt?.foreningId || "",
      namn: befintligt?.namn || "",
      inloggadTidpunkt: new Date().toISOString(),
    });
  }

  function sattEndastLokalt(nyttLosenord: string): boolean {
    if (!epost) return false;
    const lokal = sattLokalLosenord(
      epost,
      nyttLosenord,
      foreningId || "",
    );
    if (!lokal.ok) {
      setFel(lokal.fel);
      return false;
    }
    sparaLokaltEfterByte(nyttLosenord);
    setOk(true);
    setNytt("");
    setBekrafta("");
    onLyckat?.();
    return true;
  }

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
        body: JSON.stringify({ nytt }),
      });
      const data = (await res.json()) as { fel?: string; ok?: boolean };

      if (res.ok) {
        sparaLokaltEfterByte(nytt);
        setOk(true);
        setNytt("");
        setBekrafta("");
        onLyckat?.();
        return;
      }

      if (res.status === 503 || res.status === 401) {
        if (sattEndastLokalt(nytt)) return;
        return;
      }

      setFel(data.fel || "Kunde inte byta lösenord.");
    } catch {
      if (!sattEndastLokalt(nytt)) {
        if (!epost) setFel("Kunde inte nå servern.");
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
            . Välj ett nytt lösenord — du behöver inte det gamla. Endast du ser
            det, aldrig andra i styrelsen.
          </>
        ) : (
          <>
            Öppna föreningen du skapade, eller{" "}
            <Link href="/styrelse-login" className="text-primary-dark underline">
              logga in
            </Link>
            . Har du glömt lösenordet?{" "}
            <Link
              href="/konto/glomt-losenord"
              className="text-primary-dark underline"
            >
              Begär en återställningslänk
            </Link>
            .
          </>
        )}
      </p>

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
          autoFocus={Boolean(epost)}
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
