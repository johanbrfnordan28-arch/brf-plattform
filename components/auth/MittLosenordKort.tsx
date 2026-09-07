"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { hamtaKontoKontext } from "@/lib/auth/konto-kontext";

type MittLosenordKortProps = {
  /** Visa kortare hjälptext. */
  kompakt?: boolean;
};

/**
 * Visar det sparade lösenordet för den inloggade — aldrig andras.
 * Fungerar med server-session eller lokal session (när DB saknas).
 */
export function MittLosenordKort({ kompakt = false }: MittLosenordKortProps) {
  const [epost, setEpost] = useState<string | null>(null);
  const [losenord, setLosenord] = useState<string | null>(null);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [visa, setVisa] = useState(false);
  const [kopierat, setKopierat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(true);

  const ladda = useCallback(async () => {
    setLaddar(true);
    setFel(null);
    try {
      const kontext = await hamtaKontoKontext();
      if (!kontext) {
        setEpost(null);
        setLosenord(null);
        setMeddelande(null);
        setFel("Skapa eller öppna er förening, eller logga in för att se lösenordet.");
        return;
      }

      setEpost(kontext.epost);
      setLosenord(kontext.losenord);
      setMeddelande(
        kontext.losenord
          ? kontext.kalla === "server"
            ? "Ditt lösenord är sparat och syns bara för dig."
            : "Ditt lösenord är sparat i den här webbläsaren (bara synligt för dig)."
          : "Inget sparat lösenord — byt lösenord eller logga in så sparas det här.",
      );
    } catch {
      setFel("Kunde inte hämta lösenord.");
    } finally {
      setLaddar(false);
    }
  }, []);

  useEffect(() => {
    void ladda();
  }, [ladda]);

  async function kopiera() {
    if (!losenord) return;
    try {
      await navigator.clipboard.writeText(losenord);
      setKopierat(true);
      window.setTimeout(() => setKopierat(false), 2000);
    } catch {
      setFel("Kunde inte kopiera.");
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-5 shadow-sm">
      <h2 className="text-base font-bold text-foreground">
        Spara / visa mitt lösenord
      </h2>
      {!kompakt && (
        <p className="mt-1 text-sm text-muted">
          När du loggar in eller byter lösenord sparas det så att{" "}
          <strong className="font-medium text-foreground">bara du</strong> kan
          visa det här. Andra i styrelsen ser aldrig ditt lösenord.
        </p>
      )}

      {laddar ? (
        <p className="mt-3 text-sm text-muted">Laddar…</p>
      ) : fel && !epost ? (
        <p className="mt-3 text-sm text-amber-950">
          {fel}{" "}
          <Link href="/styrelse-login" className="font-medium underline">
            Logga in
          </Link>
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {epost ? (
            <p className="text-sm text-muted">
              Inloggad som{" "}
              <span className="font-medium text-foreground">{epost}</span>
            </p>
          ) : null}
          {meddelande ? (
            <p className="text-xs text-muted">{meddelande}</p>
          ) : null}
          {losenord ? (
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded bg-white px-3 py-1.5 font-mono text-sm text-foreground">
                {visa ? losenord : "••••••••••••"}
              </code>
              <button
                type="button"
                onClick={() => setVisa((v) => !v)}
                className="text-sm font-medium text-primary-dark underline"
              >
                {visa ? "Dölj" : "Visa mitt lösenord"}
              </button>
              <button
                type="button"
                onClick={() => void kopiera()}
                className="text-sm font-medium text-primary-dark underline"
              >
                {kopierat ? "Kopierat!" : "Kopiera"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Inget lösenord sparat för visning ännu.{" "}
              <Link href="/styrelse-login" className="font-medium underline">
                Logga in med e-post och lösenord
              </Link>{" "}
              så sparas det, eller{" "}
              <a href="#byt-losenord" className="font-medium underline">
                byt lösenord
              </a>
              .
            </p>
          )}
          {fel && epost ? (
            <p className="text-sm text-red-700">{fel}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
