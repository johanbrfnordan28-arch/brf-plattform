"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  hamtaAktivForeningId,
} from "@/lib/forening-registry";
import {
  formateraPersonnummer,
  laggTillInloggningsBehorig,
  lasInloggningsBehorigheter,
  lasInloggningsSession,
  maskeraPersonnummer,
  rollEtikett,
  taBortInloggningsBehorig,
  type InloggningsBehorig,
  type InloggningsRoll,
} from "@/lib/kund-inloggning";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

const ROLLER: { value: InloggningsRoll; label: string }[] = [
  { value: "ordforande", label: "Ordförande" },
  { value: "ledamot", label: "Ledamot" },
  { value: "revisor", label: "Revisor" },
  { value: "ovrigt", label: "Övrig behörig" },
];

export function InloggningsBehorigheterPanel() {
  const [foreningId, setForeningId] = useState("");
  const [poster, setPoster] = useState<InloggningsBehorig[]>([]);
  const [namn, setNamn] = useState("");
  const [personnummer, setPersonnummer] = useState("");
  const [roll, setRoll] = useState<InloggningsRoll>("ledamot");
  const [fel, setFel] = useState("");
  const [ok, setOk] = useState("");
  const [supportLage, setSupportLage] = useState(false);

  const ladda = useCallback(() => {
    const id = hamtaAktivForeningId();
    setForeningId(id);
    setPoster(lasInloggningsBehorigheter(id));
    const session = lasInloggningsSession();
    setSupportLage(Boolean(session?.support && session.foreningId === id));
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) {
    return (
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <h2 className="text-lg font-bold text-foreground">Aktuell styrelse</h2>
        <p className="mt-2 text-sm text-muted">
          Styrelsens inloggningsbehörigheter hanteras per förening. Välj en
          förening för att lägga till eller ta bort personer.
        </p>
      </div>
    );
  }

  function laggTill() {
    setFel("");
    setOk("");
    const resultat = laggTillInloggningsBehorig(foreningId, {
      namn,
      personnummer,
      roll,
    });
    if (!resultat.ok) {
      setFel(resultat.fel);
      return;
    }
    setNamn("");
    setPersonnummer("");
    setOk("Personen är tillagd och kan logga in med BankID.");
    ladda();
  }

  function taBort(id: string) {
    taBortInloggningsBehorig(foreningId, id);
    setOk("Personen är borttagen och kan inte längre logga in.");
    ladda();
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Aktuell styrelse</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Lägg till personer som ska kunna logga in till föreningens sida med
        BankID. Ta bort personer som lämnat styrelsen — de kan då inte längre
        logga in. Listan syns bara här, inte publikt.
      </p>
      <p className="mt-2 rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-xs leading-relaxed text-primary-dark">
        Personal från {BRF_NAVET_NAMN} kan alltid logga in för att hjälpa er —
        oavsett vilka som står i listan nedan.
        {supportLage ? (
          <span className="mt-1 block font-semibold">
            Ni är inloggade som support och kan justera listan.
          </span>
        ) : null}
      </p>

      <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
        {poster.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted">
            Ingen i styrelsen har behörighet ännu. Lägg till minst en person.
          </li>
        ) : (
          poster.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{p.namn}</p>
                <p className="text-xs text-muted">
                  {maskeraPersonnummer(p.personnummer)} · {rollEtikett(p.roll)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => taBort(p.id)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
              >
                Ta bort person
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-foreground sm:col-span-2">
          Namn
          <input
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="För- och efternamn"
          />
        </label>
        <label className="block text-xs font-medium text-foreground">
          Personnummer
          <input
            value={personnummer}
            onChange={(e) => setPersonnummer(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="ÅÅÅÅMMDD-XXXX"
          />
        </label>
        <label className="block text-xs font-medium text-foreground">
          Roll i styrelsen
          <select
            value={roll}
            onChange={(e) => setRoll(e.target.value as InloggningsRoll)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {ROLLER.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={laggTill}
        className="brf-knapp-gron mt-4 px-5 py-2.5 text-sm"
      >
        Lägg till person
      </button>

      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
      {ok && (
        <p className="mt-3 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {ok}
        </p>
      )}

      <p className="mt-4 text-xs text-muted">
        Demo: lägg till personnummer {formateraPersonnummer("198003151234")}{" "}
        (Anna) för att testa kundinloggning.
      </p>
    </div>
  );
}
