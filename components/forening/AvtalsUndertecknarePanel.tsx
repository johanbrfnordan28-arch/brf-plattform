"use client";

import { useState } from "react";
import { registreraOverenskommelseMejl } from "@/components/lagenhetsarkiv/overenskommelse-mejl";
import {
  AVTAL_UNDERTECKNARE_ANTAL,
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
};

function mejlAdressOk(epost: string): boolean {
  return epost.trim().includes("@");
}

function byggBrodtext(opts: {
  namn: string;
  foreningsNamn: string;
  lank: string;
}): string {
  const halsning = opts.namn.trim() ? `Hej ${opts.namn.trim()},` : "Hej,";
  return [
    halsning,
    "",
    `${opts.foreningsNamn} ska teckna kundavtal med Styrelse-Navet.`,
    "Du är en av två personer i styrelsen som tecknar avtalet.",
    "",
    "Öppna länken, läs avtalet och signera med BankID:",
    opts.lank,
    "",
    "När båda personerna har signerat sparas avtalet i föreningens portal.",
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
}: Props) {
  const [skickar, setSkickar] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const namngivna = ledamoter.filter((l) => l.namn.trim());
  const saknade = personer.filter(undertecknareSaknas).length;

  function uppdatera(index: number, nasta: AvtalsUndertecknareVal) {
    onChange(personer.map((rad, i) => (i === index ? nasta : rad)));
    setStatus(null);
    setFel(null);
  }

  function valjLedamot(index: number, ledamotId: string) {
    if (!ledamotId) {
      uppdatera(index, {
        ledamotId: "",
        namn: "",
        roll: "",
        epost: "",
      });
      return;
    }
    if (ledamotId === "annan") {
      uppdatera(index, {
        ledamotId: "",
        namn: personer[index]?.namn ?? "",
        roll: personer[index]?.roll ?? "",
        epost: personer[index]?.epost ?? "",
      });
      return;
    }
    const ledamot = namngivna.find((l) => l.id === ledamotId);
    if (!ledamot) return;
    uppdatera(index, undertecknareFranLedamot(ledamot));
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
    setSkickar(true);
    try {
      const lank = `${window.location.origin}/forening/uppgifter#signera`;
      for (const person of personer) {
        await registreraOverenskommelseMejl({
          till: person.epost.trim(),
          amne: `Kundavtal ${foreningsNamn} — signera med BankID`,
          brodtext: byggBrodtext({
            namn: person.namn,
            foreningsNamn,
            lank,
          }),
        });
      }
      setStatus(
        `Mejlet med avtalet och länken för BankID-signering är skickat till ${personer
          .map((p) => p.epost.trim())
          .join(" och ")}. När båda har signerat sparas avtalet i portalen.`,
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
        Avtalet tecknas alltid av två personer. De två första i styrelsen är
        förvalda. Byt person om någon annan ska signera, och fyll i
        mejladressen. Mejlet innehåller avtalet och en länk där personen
        signerar med BankID.
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
      {saknade > 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {saknade === 1
            ? "En person saknas. Välj någon från styrelsen eller fyll i namn och e-post."
            : "Båda personerna saknas. Välj två från styrelsen eller fyll i namn och e-post."}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {personer.slice(0, AVTAL_UNDERTECKNARE_ANTAL).map((person, index) => {
          const saknas = undertecknareSaknas(person);
          const upptagen = new Set(
            personer
              .filter((_, i) => i !== index)
              .map((p) => p.ledamotId)
              .filter(Boolean),
          );
          return (
            <div
              key={index}
              className={`rounded-xl border p-4 ${
                saknas
                  ? "border-amber-300 bg-amber-50"
                  : "border-border bg-surface/40"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">
                Person {index + 1}
                {saknas ? " — en person saknas" : ""}
              </p>
              <label className="mt-3 block text-sm">
                <span className="font-medium text-foreground">
                  Välj från styrelsen
                </span>
                <select
                  value={person.ledamotId}
                  onChange={(e) => valjLedamot(index, e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="">
                    {saknas ? "Välj person" : "Annan person"}
                  </option>
                  {namngivna.map((l) => (
                    <option
                      key={l.id}
                      value={l.id}
                      disabled={upptagen.has(l.id)}
                    >
                      {l.namn}
                      {l.roll.trim() ? ` · ${l.roll}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-sm">
                <span className="font-medium text-foreground">Namn</span>
                <input
                  value={person.namn}
                  onChange={(e) =>
                    uppdatera(index, {
                      ...person,
                      ledamotId: "",
                      namn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="font-medium text-foreground">Funktion</span>
                <input
                  value={person.roll}
                  onChange={(e) =>
                    uppdatera(index, { ...person, roll: e.target.value })
                  }
                  placeholder="t.ex. Ordförande"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="font-medium text-foreground">E-post</span>
                <input
                  type="email"
                  value={person.epost}
                  onChange={(e) =>
                    uppdatera(index, { ...person, epost: e.target.value })
                  }
                  placeholder="namn@forening.se"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          );
        })}
      </div>

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
