"use client";

import { useEffect, useState } from "react";
import { useHubbNamn } from "@/components/forening/useHubbNamn";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
} from "@/lib/forening-registry";

const FORENING_PATH = "/forening";

type DelaForeningslankRutaProps = {
  /** Server-renderad baslänk så fältet fungerar även innan klient-JS laddats. */
  initialUrl?: string;
};

/** Tillfällig ruta — ta bort när delning inte längre behövs. */
export function DelaForeningslankRuta({ initialUrl = "" }: DelaForeningslankRutaProps) {
  const hubbNamn = useHubbNamn();
  const [visa, setVisa] = useState(false);
  const [lank, setLank] = useState(initialUrl);
  const [kopierad, setKopierad] = useState(false);
  const [kopieraFel, setKopieraFel] = useState(false);

  useEffect(() => {
    function uppdatera() {
      setVisa(arGrundmallForening(lasAktivForeningId()));
      setLank(`${window.location.origin}${FORENING_PATH}`);
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  if (!visa) return null;

  async function kopiera() {
    if (!lank) return;
    setKopieraFel(false);

    try {
      await navigator.clipboard.writeText(lank);
      setKopierad(true);
    } catch {
      const input = document.getElementById("dela-foreningslank") as HTMLInputElement | null;
      if (!input) {
        setKopieraFel(true);
        return;
      }
      input.focus();
      input.select();
      const ok = document.execCommand("copy");
      if (ok) {
        setKopierad(true);
      } else {
        setKopieraFel(true);
      }
    }

    window.setTimeout(() => {
      setKopierad(false);
      setKopieraFel(false);
    }, 2500);
  }

  return (
    <div className="border-b border-amber-200/80 bg-amber-50/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
            Dela {hubbNamn}
          </p>
          <p className="text-sm text-amber-950">
            Kopiera länken och skicka till en kollega som ska se {hubbNamn}.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              id="dela-foreningslank"
              type="text"
              readOnly
              value={lank}
              placeholder="Laddar länk…"
              className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-foreground"
              onFocus={(event) => event.target.select()}
            />
            <button
              type="button"
              onClick={kopiera}
              disabled={!lank}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {kopierad ? "Kopierad!" : "Kopiera"}
            </button>
          </div>
          {kopieraFel && (
            <p className="mt-2 text-xs text-amber-950">
              Kunde inte kopiera automatiskt — markera länken ovan och kopiera manuellt (Ctrl+C / Cmd+C).
            </p>
          )}
          {lank && (
            <p className="mt-2 text-xs text-amber-900/80">
              Eller öppna direkt:{" "}
              <a href={lank} className="font-medium underline underline-offset-2">
                {lank}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
