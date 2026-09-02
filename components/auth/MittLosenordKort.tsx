"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { hamtaLokalKonto } from "@/lib/auth/lokal-konto";

type MittLosenordKortProps = {
  /** Visa kortare hjälptext. */
  kompakt?: boolean;
};

/**
 * Visar det sparade lösenordet för den inloggade — aldrig andras.
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
      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as {
        inloggad?: boolean;
        epost?: string;
      };
      if (!session.inloggad || !session.epost) {
        setEpost(null);
        setLosenord(null);
        setMeddelande(null);
        setFel("Logga in för att se ditt sparade lösenord.");
        return;
      }
      setEpost(session.epost);

      const losRes = await fetch("/api/auth/mitt-losenord");
      if (losRes.ok) {
        const data = (await losRes.json()) as {
          losenord?: string | null;
          meddelande?: string;
          lokalFallback?: boolean;
        };
        if (data.lokalFallback) {
          const lokal = hamtaLokalKonto(session.epost);
          setLosenord(lokal?.losenord ?? null);
          setMeddelande(
            lokal
              ? "Ditt lösenord är sparat i den här webbläsaren."
              : data.meddelande ||
                  "Inget sparat lösenord — byt lösenord så sparas det här.",
          );
        } else {
          setLosenord(data.losenord ?? null);
          setMeddelande(
            data.meddelande ||
              (data.losenord
                ? "Ditt lösenord är sparat och syns bara för dig."
                : "Inget sparat lösenord — byt lösenord så sparas det för visning här."),
          );
        }
      } else {
        const lokal = hamtaLokalKonto(session.epost);
        if (lokal) {
          setLosenord(lokal.losenord);
          setMeddelande("Ditt lösenord är sparat i den här webbläsaren.");
        } else {
          setLosenord(null);
          setMeddelande(
            "Kunde inte hämta sparat lösenord. Byt lösenord så sparas det här.",
          );
        }
      }
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
          När du skapar förening eller byter lösenord sparas det så att{" "}
          <strong className="font-medium text-foreground">bara du</strong> kan
          visa det här. Styrelsen ser aldrig andras lösenord.
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
              <a href="#byt-losenord" className="font-medium underline">
                Byt lösenord
              </a>{" "}
              så sparas det här.
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
