"use client";

import { useState } from "react";
import { registreraOverenskommelseMejl } from "@/components/lagenhetsarkiv/overenskommelse-mejl";
import {
  AVTAL_UNDERTECKNARE_ANTAL,
  tomAvtalsUndertecknare,
  undertecknareFranLedamot,
  undertecknareSaknas,
  type AvtalsUndertecknareVal,
} from "@/lib/avtal-undertecknare-val";
import {
  AVTAL_LANGD_AR,
  AVTAL_UPPSAGNING_MANADER,
  PROVOPERIODE_DAGAR,
} from "@/lib/forening-avtal";
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { sparaKundavtal } from "@/components/foreningsinformation/kundavtal-lager";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";

type Props = {
  foreningId: string;
  foreningsNamn: string;
  ledamoter: StyrelseLedamot[];
  personer: AvtalsUndertecknareVal[];
  onChange: (personer: AvtalsUndertecknareVal[]) => void;
  /** Bekräftelse som tidigare låg i en egen ruta längre ner. */
  bekraftat?: boolean;
  onBekraftatChange?: (checked: boolean) => void;
  /** Hela avtalstexten — läggs i mejlet och sparas i biblioteket. */
  avtalText?: string;
};

function mejlAdressOk(epost: string): boolean {
  return epost.trim().includes("@");
}

function byggBrodtext(opts: {
  namn: string;
  foreningsNamn: string;
  lank: string;
  avtalText: string;
}): string {
  const halsning = opts.namn.trim() ? `Hej ${opts.namn.trim()},` : "Hej,";
  return [
    halsning,
    "",
    `${opts.foreningsNamn} ska teckna kundavtal med Styrelse-Navet.`,
    "Du är en av två personer i styrelsen som tecknar avtalet.",
    "Avtalet följer i det här mejlet. Mejladressen används för att nå den som ska signera.",
    "",
    "Öppna avtalet som PDF och signera med BankID:",
    opts.lank,
    "",
    "—— Avtalet ——",
    "",
    opts.avtalText.trim(),
    "",
    "När båda personerna har signerat sparas avtalet i Styrning och Dokument, under Styrelse Arkiv → Avtal.",
    "",
    "Vänliga hälsningar",
    "Styrelse-Navet",
  ].join("\n");
}

export function AvtalsUndertecknarePanel({
  foreningsNamn,
  ledamoter,
  personer,
  onChange,
  bekraftat = false,
  onBekraftatChange,
  avtalText = "",
}: Props) {
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const namngivna = ledamoter.filter((l) => l.namn.trim());
  const valda = personer.filter((person) => !undertecknareSaknas(person));
  const saknade = AVTAL_UNDERTECKNARE_ANTAL - valda.length;

  function arVald(ledamotId: string): boolean {
    return valda.some((person) => person.ledamotId === ledamotId);
  }

  function toggleLedamot(ledamotId: string) {
    const ledamot = namngivna.find((rad) => rad.id === ledamotId);
    if (!ledamot) return;
    const redan = arVald(ledamotId);
    if (!redan && valda.length >= AVTAL_UNDERTECKNARE_ANTAL) return;
    const nasta = redan
      ? valda.filter((person) => person.ledamotId !== ledamotId)
      : [...valda, undertecknareFranLedamot(ledamot)];
    while (nasta.length < AVTAL_UNDERTECKNARE_ANTAL) {
      nasta.push(tomAvtalsUndertecknare());
    }
    onChange(nasta.slice(0, AVTAL_UNDERTECKNARE_ANTAL));
    setStatus(null);
    setFel(null);
  }

  async function skickaMejl() {
    setFel(null);
    setStatus(null);
    const utanMejl = personer.filter(
      (p) => !undertecknareSaknas(p) && !mejlAdressOk(p.epost),
    );
    if (onBekraftatChange && !bekraftat) {
      setFel("Bekräfta att ni är behöriga att teckna avtalet.");
      return;
    }
    if (saknade > 0 || personer.some((p) => !mejlAdressOk(p.epost))) {
      setFel(
        saknade > 0
          ? "Två personer ska teckna avtalet. En person saknas — välj eller fyll i namn och e-post."
          : `Ange e-post till ${utanMejl.map((p) => p.namn).join(" och ") || "båda personerna"}.`,
      );
      return;
    }
    if (!avtalText.trim()) {
      setFel("Avtalstexten saknas och kan inte mejlas.");
      return;
    }
    setSkickar(true);
    try {
      const lank = `${window.location.origin}/forening/teckna-avtal`;
      for (const person of personer) {
        await registreraOverenskommelseMejl({
          till: person.epost.trim(),
          amne: `Kundavtal ${foreningsNamn} — signera med BankID`,
          brodtext: byggBrodtext({
            namn: person.namn,
            foreningsNamn,
            lank,
            avtalText,
          }),
        });
      }
      sparaKundavtal({
        foreningsNamn,
        text: avtalText,
        status: "utkast",
        undertecknare: personer.map((p) => ({
          namn: p.namn,
          epost: p.epost.trim(),
        })),
      });
      setStatus(
        `Mejlet med avtalet är skickat till ${personer
          .map((p) => p.epost.trim())
          .join(" och ")}. Samma avtal är sparat under Styrning och Dokument → Styrelse Arkiv → Avtal.`,
      );
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Mejlet kunde inte skickas.");
    } finally {
      setSkickar(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Två personer tecknar avtalet
      </p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">
        Styrelsens undertecknare
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Avtalet tecknas av två personer i styrelsen. Kryssa i dem här, eller
        under Föreningsuppgifter. Mejladress krävs för båda — avtalet skickas
        dit, och samma text sparas under Styrning och Dokument.
      </p>
      {onBekraftatChange ? (
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={bekraftat}
            onChange={(e) => {
              onBekraftatChange(e.target.checked);
              setFel(null);
            }}
            className="mt-1"
          />
          <span>
            Jag är behörig att teckna avtal för <strong>{foreningsNamn}</strong>{" "}
            och godkänner villkoren i avtalet ovan (prövoperiod{" "}
            {PROVOPERIODE_DAGAR} dagar, därefter årsavtal {AVTAL_LANGD_AR} år,
            uppsägningstid {AVTAL_UPPSAGNING_MANADER} månader,{" "}
            {ARSAVTAL_RABATT_PROCENT}&nbsp;% årsrabatt och KPI-justering).
          </span>
        </label>
      ) : null}
      {namngivna.length === 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Lägg in styrelsen under Föreningsuppgifter. Personerna dyker upp här
          och kan kryssas i.
        </p>
      )}
      {saknade > 0 && namngivna.length > 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {saknade === 1
            ? "En person saknas. Kryssa i en till i styrelsen."
            : "Kryssa i två personer i styrelsen som ska signera."}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {namngivna.map((ledamot) => {
          const vald = arVald(ledamot.id);
          const mejlSaknas = !mejlAdressOk(ledamot.epost);
          return (
            <li key={ledamot.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  vald
                    ? "border-primary/40 bg-[#eef6f0]"
                    : "border-border bg-white"
                } ${!vald && valda.length >= AVTAL_UNDERTECKNARE_ANTAL ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={vald}
                  disabled={!vald && valda.length >= AVTAL_UNDERTECKNARE_ANTAL}
                  onChange={() => toggleLedamot(ledamot.id)}
                />
                <span>
                  <span className="font-medium text-foreground">
                    {ledamot.namn}
                  </span>
                  {ledamot.roll.trim() ? (
                    <span className="text-muted"> · {ledamot.roll}</span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-muted">
                    {mejlSaknas
                      ? "E-post saknas — fyll i den under Föreningsuppgifter."
                      : `Avtalet mejlas till ${ledamot.epost.trim()}`}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {fel && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
      {status && (
        <p className="mt-4 text-sm text-primary-dark" role="status">
          {status}
        </p>
      )}
      <button
        type="button"
        onClick={() => void skickaMejl()}
        disabled={skickar || (Boolean(onBekraftatChange) && !bekraftat)}
        className="brf-knapp-gron mt-4 px-5 py-2.5 text-sm disabled:opacity-50"
      >
        {skickar ? "Skickar mejl…" : "Skicka mejl med avtal för BankID-signering"}
      </button>
    </div>
  );
}
