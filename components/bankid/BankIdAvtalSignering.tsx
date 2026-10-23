"use client";

import { useState } from "react";
import {
  BANKID_KRAV_SIGNATURER,
  formateraBankIdSignatur,
  harTillrackligaBankIdSignaturer,
  type BankIdPart,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import {
  hashaPersonnummer,
  maskeraPersonnummer,
  personnummerFelmeddelande,
} from "@/lib/personnummer-format";
import type { StyrelseLedamot } from "@/lib/styrelse-ledamot";

type Props = {
  part: BankIdPart;
  partEtikett: string;
  signaturer: BankIdSignatur[];
  disabled?: boolean;
  disabledOrsak?: string;
  knaptext?: string;
  /** Styrelsens registrerade namn — väljs som undertecknare. */
  ledamoter?: StyrelseLedamot[];
  onSignera: (
    signatur: BankIdSignatur,
    personnummerKlartext: string,
  ) => void | Promise<void>;
};

/**
 * Demo-BankID för avtal: namn + personnummer på den som ska signera.
 * Två olika personer per part.
 */
export function BankIdAvtalSignering({
  part,
  partEtikett,
  signaturer,
  disabled = false,
  disabledOrsak,
  knaptext,
  ledamoter,
  onSignera,
}: Props) {
  const [namn, setNamn] = useState("");
  const [epost, setEpost] = useState("");
  const [personnummer, setPersonnummer] = useState("");
  const [valdLedamotId, setValdLedamotId] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [steg, setSteg] = useState<"idle" | "pagar">("idle");
  const klart = harTillrackligaBankIdSignaturer(signaturer);
  const namngivna = (ledamoter ?? []).filter((ledamot) => ledamot.namn.trim());

  function valjLedamot(id: string) {
    setValdLedamotId(id);
    setFel(null);
    const ledamot = namngivna.find((rad) => rad.id === id);
    if (!ledamot) {
      setNamn("");
      setEpost("");
      setPersonnummer("");
      return;
    }
    setNamn(ledamot.namn.trim());
    setEpost(ledamot.epost.trim());
    setPersonnummer(ledamot.personnummer.trim());
  }

  async function signera() {
    setFel(null);
    if (disabled) {
      setFel(disabledOrsak || "Signering är inte öppen ännu.");
      return;
    }
    if (!namn.trim()) {
      setFel("Ange namn för den som ska signera med BankID.");
      return;
    }
    const pnrFel = personnummerFelmeddelande(personnummer);
    if (pnrFel) {
      setFel(pnrFel);
      return;
    }
    setSteg("pagar");
    try {
      await new Promise((r) => window.setTimeout(r, 1600));
      const nyckel = await hashaPersonnummer(personnummer);
      if (!nyckel) {
        setFel("Kunde inte läsa personnummer för BankID.");
        setSteg("idle");
        return;
      }
      await onSignera(
        {
          namn: namn.trim(),
          personnummerMaskerat: maskeraPersonnummer(personnummer),
          personnummerNyckel: nyckel,
          tidpunkt: new Date().toISOString(),
          part,
        },
        personnummer.trim(),
      );
      setNamn("");
      setEpost("");
      setPersonnummer("");
      setValdLedamotId("");
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Signering misslyckades.");
    } finally {
      setSteg("idle");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">
        BankID · {partEtikett} ({signaturer.length} av {BANKID_KRAV_SIGNATURER})
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        BankID-signeringen är knuten till undertecknarens personnummer. Två
        olika personer från {partEtikett} måste signera.
      </p>

      {signaturer.length > 0 && (
        <ul className="mt-3 space-y-2">
          {signaturer.map((s) => (
            <li
              key={s.personnummerNyckel}
              className="rounded-lg bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
            >
              Signerat: {formateraBankIdSignatur(s)} ·{" "}
              {new Date(s.tidpunkt).toLocaleString("sv-SE")}
            </li>
          ))}
        </ul>
      )}

      {klart ? (
        <p className="mt-3 text-sm font-medium text-primary-dark">
          {partEtikett} har två BankID-signaturer.
        </p>
      ) : (
        <>
          {disabled && disabledOrsak && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {disabledOrsak}
            </p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {namngivna.length > 0 ? (
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground">
                  Välj person från föreningsuppgifter
                </span>
                <select
                  value={valdLedamotId}
                  onChange={(e) => valjLedamot(e.target.value)}
                  disabled={disabled || steg === "pagar"}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                >
                  <option value="">Välj person</option>
                  {namngivna.map((ledamot) => (
                    <option key={ledamot.id} value={ledamot.id}>
                      {ledamot.namn}
                      {ledamot.roll.trim() ? ` · ${ledamot.roll}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block text-sm">
                <span className="font-medium text-foreground">Namn</span>
                <input
                  type="text"
                  value={namn}
                  onChange={(e) => setNamn(e.target.value)}
                  disabled={disabled || steg === "pagar"}
                  placeholder="Namn på den som signerar"
                  autoComplete="name"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                />
              </label>
            )}
            {namngivna.length > 0 && (
              <label className="block text-sm">
                <span className="font-medium text-foreground">E-post</span>
                <input
                  type="email"
                  value={epost}
                  onChange={(e) => setEpost(e.target.value)}
                  disabled={disabled || steg === "pagar"}
                  placeholder="Hämtas från föreningsuppgifter"
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                />
              </label>
            )}
            <label className="block text-sm">
              <span className="font-medium text-foreground">
                Personnummer på den som ska signera
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={personnummer}
                onChange={(e) => setPersonnummer(e.target.value)}
                disabled={disabled || steg === "pagar"}
                placeholder="Hämtas från föreningsuppgifter"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
              />
            </label>
          </div>
          {valdLedamotId && !epost.trim() && (
            <p className="mt-2 text-xs text-amber-950">
              E-post saknas på personen i föreningsuppgifter.
            </p>
          )}
          {valdLedamotId && !personnummer.trim() && (
            <p className="mt-2 text-xs text-amber-950">
              Personnummer saknas på personen i föreningsuppgifter.
            </p>
          )}
          {fel && (
            <p
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {fel}
            </p>
          )}
          <button
            type="button"
            onClick={() => void signera()}
            disabled={disabled || steg === "pagar"}
            className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {steg === "pagar"
              ? "Öppnar BankID…"
              : knaptext ??
                `Signera med BankID (${signaturer.length + 1} av ${BANKID_KRAV_SIGNATURER})`}
          </button>
          <p className="mt-2 text-xs text-muted">
            Demo: simulerad BankID. Personnumret används för att binda
            undertecknaren och sparas bara maskerat (sista fyra dolda).
          </p>
        </>
      )}
    </div>
  );
}
