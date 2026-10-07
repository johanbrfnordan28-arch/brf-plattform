"use client";

import { useState } from "react";
import type { RaderaPersonResultat } from "@/lib/gdpr-server";

/** Registerutdrag och radering på begäran (art. 15 och 17 GDPR). */
export function PlattformGdprPanel() {
  const [epost, setEpost] = useState("");
  const [bekrafta, setBekrafta] = useState("");
  const [arbetar, setArbetar] = useState(false);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const trimmad = epost.trim().toLowerCase();
  const kanRadera = trimmad.length > 0 && bekrafta.trim().toLowerCase() === trimmad;

  async function radera() {
    if (!kanRadera) return;
    setArbetar(true);
    setFel(null);
    setMeddelande(null);
    try {
      const res = await fetch("/api/plattform/gdpr/person", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost: trimmad }),
      });
      const data = (await res.json()) as {
        fel?: string;
        resultat?: RaderaPersonResultat;
      };
      if (!res.ok || !data.resultat) {
        setFel(data.fel ?? "Kunde inte radera.");
        return;
      }
      const r = data.resultat;
      setMeddelande(
        `Klart. Konto ${r.kontoRaderat ? "raderat" : "fanns inte"}, ${r.inloggningar} inloggningar, ${r.intresseanmalningar} intresseanmälningar och ${r.mejl} mejl raderade, ${r.felanmalningarAnonymiserade} felanmälningar anonymiserade.`,
      );
      setBekrafta("");
    } catch {
      setFel("Nätverksfel — försök igen.");
    } finally {
      setArbetar(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">
        Personuppgifter på begäran
      </h2>
      <p className="mt-1 text-sm text-muted">
        När någon begär ut eller vill få sina uppgifter raderade. Sök på
        e-postadressen. Exporten innehåller konto, styrelseuppdrag,
        inloggningshistorik, intresseanmälningar, felanmälningar och skickade
        mejl. Gäller begäran en hel förening använder ni «Exportera data» i
        föreningslistan ovan.
      </p>

      <label className="mt-4 block text-sm font-medium text-foreground">
        E-postadress
        <input
          type="email"
          value={epost}
          onChange={(e) => {
            setEpost(e.target.value);
            setMeddelande(null);
            setFel(null);
          }}
          className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="namn@exempel.se"
        />
      </label>

      <div className="mt-3">
        <a
          href={
            trimmad
              ? `/api/plattform/gdpr/person?epost=${encodeURIComponent(trimmad)}`
              : undefined
          }
          aria-disabled={!trimmad}
          className={`inline-block rounded-lg border border-border px-3 py-2 text-sm font-medium ${
            trimmad
              ? "bg-white text-foreground hover:bg-slate-50"
              : "pointer-events-none bg-slate-50 text-muted"
          }`}
        >
          Ladda ner registerutdrag (JSON)
        </a>
      </div>

      <div className="mt-5 rounded-xl border border-red-200 bg-red-50/60 p-4">
        <p className="text-sm font-semibold text-red-950">Radera personen</p>
        <p className="mt-1 text-xs text-red-900">
          Raderar konto, inloggningshistorik, intresseanmälningar och mejl.
          Felanmälningar tillhör föreningen och anonymiseras i stället. Gäller
          det en boende bör begäran normalt komma via föreningen. Går inte att
          ångra.
        </p>
        <label className="mt-3 block text-xs font-medium text-red-950">
          Skriv e-postadressen igen för att bekräfta
          <input
            type="email"
            value={bekrafta}
            onChange={(e) => setBekrafta(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={!kanRadera || arbetar}
          onClick={radera}
          className="mt-3 rounded-lg border border-red-300 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {arbetar ? "Raderar …" : "Radera permanent"}
        </button>
      </div>

      {meddelande ? (
        <p className="mt-3 text-sm text-primary-dark">{meddelande}</p>
      ) : null}
      {fel ? <p className="mt-3 text-sm text-red-700">{fel}</p> : null}
    </section>
  );
}
