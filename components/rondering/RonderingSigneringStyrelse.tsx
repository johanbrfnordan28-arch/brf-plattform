"use client";

import { useCallback, useEffect, useState } from "react";
import { SigneringSchemaKonfiguration } from "@/components/rondering/SigneringSchemaKonfiguration";
import {
  aktuellPeriod,
  formateraPeriod,
  hamtaSignering,
  signeringRollInfo,
  skapaSigneringLank,
  type SigneringRoll,
  type SigneringStatus,
} from "@/components/rondering/signering";
import { hamtaAktivaSchemaPunkter } from "@/components/rondering/signering-schema";

const roller: SigneringRoll[] = ["fastighetsskotare", "stadning"];

export function RonderingSigneringStyrelse() {
  const [period, setPeriod] = useState(aktuellPeriod);
  const [status, setStatus] = useState<Record<SigneringRoll, SigneringStatus | null>>({
    fastighetsskotare: null,
    stadning: null,
  });
  const [kopierad, setKopierad] = useState<SigneringRoll | null>(null);

  const uppdatera = useCallback(() => {
    setStatus({
      fastighetsskotare: hamtaSignering("fastighetsskotare", period),
      stadning: hamtaSignering("stadning", period),
    });
  }, [period]);

  useEffect(() => {
    uppdatera();
    const onFocus = () => uppdatera();
    const onSchema = () => uppdatera();
    window.addEventListener("focus", onFocus);
    window.addEventListener("rondering-signering-schema-uppdaterad", onSchema);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("rondering-signering-schema-uppdaterad", onSchema);
    };
  }, [uppdatera]);

  async function kopieraLank(roll: SigneringRoll) {
    const lank = skapaSigneringLank(roll, period);
    try {
      await navigator.clipboard.writeText(lank);
      setKopierad(roll);
      window.setTimeout(() => setKopierad(null), 2000);
    } catch {
      window.prompt("Kopiera signeringslänken:", lank);
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted">
        Bygg månadsschemat (vilka moment som ska ingå), skicka signeringslänk till
        entreprenören och följ status. Entreprenören bockar av utförda moment innan
        signering — samma princip som nyckelkvittering.
      </p>

      <SigneringSchemaKonfiguration />

      <div
        id="manadssignering-lankar"
        className="scroll-mt-24 space-y-6 border-t border-border pt-8"
      >
        <p className="text-sm font-semibold text-foreground">
          Steg 2 — period och signeringslänkar
        </p>

      <label className="block max-w-xs">
        <span className="text-sm font-medium text-foreground">Period</span>
        <input
          type="month"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-muted">{formateraPeriod(period)}</span>
      </label>

      <ul className="space-y-4">
        {roller.map((roll) => {
          const info = signeringRollInfo[roll];
          const entry = status[roll];
          const signerad = entry?.status === "signerad";
          const lank = skapaSigneringLank(roll, period);
          const antalMoment = hamtaAktivaSchemaPunkter(roll).length;

          return (
            <li
              key={roll}
              className="rounded-xl border border-border bg-background/80 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{info.titel}</p>
                  <p className="mt-1 text-sm text-muted">
                    {info.dokument} · {antalMoment}{" "}
                    {antalMoment === 1 ? "moment" : "moment"} i schemat
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    signerad
                      ? "bg-[#e2f0e6] text-primary-dark"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >
                  {signerad ? "Signerad" : "Väntar signering"}
                </span>
              </div>

              {signerad && entry && (
                <p className="mt-3 text-sm text-foreground">
                  {entry.foretagsnamn} · {entry.signeradDatum} ·{" "}
                  {entry.metod === "bankid"
                    ? "BankID"
                    : `Uppladdat${entry.filnamn ? `: ${entry.filnamn}` : ""}`}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => kopieraLank(roll)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {kopierad === roll ? "Länk kopierad" : "Kopiera signeringslänk"}
                </button>
                <a
                  href={lank}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50"
                >
                  Förhandsgranska (entreprenörsvy)
                </a>
                <button
                  type="button"
                  onClick={uppdatera}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
                >
                  Uppdatera status
                </button>
              </div>
              <p className="mt-2 break-all text-xs text-muted">{lank}</p>
            </li>
          );
        })}
      </ul>

      <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted">
        I produktion skickas länken via e-post till entreprenören. Entreprenören
        signeringar en gång per månad och kommer inte åt styrelsens övriga moduler.
        I demo: använd <strong>Förhandsgranska</strong> i samma webbläsare direkt
        efter att ni bockat i moment — annars kan schemat se tomt ut.
      </p>
      </div>
    </div>
  );
}
