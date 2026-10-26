"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formateraUppdragsDatum,
  hamtaDriftStateFranServer,
  lasDriftState,
  skapaUppdrag,
  skapaUppdragLank,
  sparaDriftState,
} from "@/components/rondering/drift-avtal-lager";
import {
  DRIFT_AVTAL_EVENT,
  type DriftState,
} from "@/components/rondering/drift-avtal-typer";
import { senasteGodkandaAvtal } from "@/lib/drift-tjanst-logik";
import {
  signeringRollInfo,
  type SigneringRoll,
} from "@/components/rondering/signering";

const roller: SigneringRoll[] = ["fastighetsskotare", "stadning"];

function idag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DriftUppdragStyrelse() {
  const [roll, setRoll] = useState<SigneringRoll>("stadning");
  const [state, setState] = useState<DriftState>(lasDriftState);
  const [datum, setDatum] = useState(idag);
  const [anteckning, setAnteckning] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [kopieradId, setKopieradId] = useState<string | null>(null);

  const uppdatera = useCallback(() => {
    setState(lasDriftState());
  }, []);

  useEffect(() => {
    uppdatera();
    void hamtaDriftStateFranServer().then((server) => {
      if (!server) return;
      sparaDriftState(server, undefined, { synkaServer: false });
      setState(server);
    });
    window.addEventListener(DRIFT_AVTAL_EVENT, uppdatera);
    window.addEventListener("focus", uppdatera);
    return () => {
      window.removeEventListener(DRIFT_AVTAL_EVENT, uppdatera);
      window.removeEventListener("focus", uppdatera);
    };
  }, [uppdatera]);

  const avtal = senasteGodkandaAvtal(state, roll);
  const uppdrag = useMemo(
    () =>
      state.uppdrag
        .filter((u) => u.roll === roll)
        .sort((a, b) => b.utforandedatum.localeCompare(a.utforandedatum)),
    [state.uppdrag, roll],
  );

  function skapa() {
    setFel(null);
    if (!avtal) {
      setFel("Entreprenören måste godkänna avtalet innan ni skapar uppdrag.");
      return;
    }
    const resultat = skapaUppdrag({
      avtalId: avtal.id,
      utforandedatum: datum,
      anteckning,
    });
    if ("fel" in resultat) {
      setFel(resultat.fel);
      return;
    }
    setAnteckning("");
    uppdatera();
  }

  async function kopieraLank(uppdragId: string, token: string) {
    const post = state.uppdrag.find((u) => u.id === uppdragId);
    if (!post) return;
    void token;
    const lank = skapaUppdragLank(post);
    try {
      await navigator.clipboard.writeText(lank);
      setKopieradId(uppdragId);
      window.setTimeout(() => setKopieradId(null), 2000);
    } catch {
      window.prompt("Kopiera kvittenslänken:", lank);
    }
  }

  return (
    <div id="drift-uppdrag" className="scroll-mt-24 space-y-6 border-t border-border pt-8">
      <p className="text-sm font-semibold text-foreground">
        Steg 3 — uppdrag och kvittens
      </p>
      <p className="text-sm leading-relaxed text-muted">
        Entreprenören signerar avtalet först, därefter styrelsen. Avtalet sparas
        här. Vid varje städning eller rondering signerar personalen med BankID
        och anger vilka som är på plats, om någon bytts ut och om
        underentreprenör används. Det syns i portalen.
      </p>

      <div className="flex flex-wrap gap-2">
        {roller.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoll(r)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              roll === r
                ? "border-primary bg-[#eef6f0] text-primary-dark"
                : "border-border text-muted hover:border-primary/40"
            }`}
          >
            {signeringRollInfo[r].titel}
          </button>
        ))}
      </div>

      {!avtal ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Inget godkänt avtal för {signeringRollInfo[roll].titel.toLowerCase()}{" "}
          ännu. Skapa avtal i steget ovan och låt entreprenören signera med
          BankID.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <p className="text-sm text-foreground">
            Gällande avtal: <strong>{avtal.entreprenorNamn}</strong>
            {avtal.kravBankIdKvittens ? " · BankID krävs vid kvittens" : ""}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Datum för uppdraget
              </span>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Anteckning (valfritt)
              </span>
              <input
                type="text"
                value={anteckning}
                onChange={(e) => setAnteckning(e.target.value)}
                placeholder="T.ex. extra trapphus 3"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={skapa}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Skapa uppdrag och kvittenslänk
          </button>
        </div>
      )}

      {fel && (
        <p className="text-sm text-amber-950" role="status">
          {fel}
        </p>
      )}

      <ul className="space-y-3">
        {uppdrag.map((u) => {
          const utfort = u.status === "utfort";
          const lank = skapaUppdragLank(u);
          return (
            <li
              key={u.id}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {formateraUppdragsDatum(u.utforandedatum)}
                  </p>
                  {u.anteckning ? (
                    <p className="mt-1 text-sm text-muted">{u.anteckning}</p>
                  ) : null}
                  {utfort && (
                    <div className="mt-1 space-y-1 text-sm text-foreground">
                      <p>
                        {u.signeradNamn}
                        {u.signeradPersonnummerMaskerat
                          ? ` · ${u.signeradPersonnummerMaskerat}`
                          : ""}{" "}
                        ·{" "}
                        {u.signeradTidpunkt
                          ? new Date(u.signeradTidpunkt).toLocaleString("sv-SE")
                          : ""}{" "}
                        · {u.metod === "bankid" ? "BankID" : "Namnkvittens"}
                      </p>
                      {u.personalNamn && u.personalNamn.length > 0 && (
                        <p>Personal: {u.personalNamn.join(", ")}</p>
                      )}
                      {u.personalByte ? (
                        <p>Personalbyte: {u.personalByte}</p>
                      ) : null}
                      <p>
                        Underentreprenör:{" "}
                        {u.anvanderUnderentreprenor
                          ? u.underentreprenorNamn || "Ja"
                          : "Nej"}
                      </p>
                    </div>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    utfort
                      ? "bg-[#e2f0e6] text-primary-dark"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >
                  {utfort ? "Utfört och kvitterat" : "Väntar kvittens"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void kopieraLank(u.id, u.token)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {kopieradId === u.id ? "Länk kopierad" : "Kopiera kvittenslänk"}
                </button>
                <a
                  href={lank}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50"
                >
                  Förhandsgranska
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
