"use client";

import { useState } from "react";
import {
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

type Props = {
  part: BankIdPart;
  partEtikett: string;
  signaturer: BankIdSignatur[];
  disabled?: boolean;
  disabledOrsak?: string;
  knaptext?: string;
  forvaltNamn?: string;
  onSignera: (
    signatur: BankIdSignatur,
    personnummerKlartext: string,
  ) => void | Promise<void>;
};

/** En undertecknare per block (t.ex. egenkontroll). */
export function BankIdEnkelSignering({
  part,
  partEtikett,
  signaturer,
  disabled = false,
  disabledOrsak,
  knaptext,
  forvaltNamn,
  onSignera,
}: Props) {
  const [namn, setNamn] = useState(forvaltNamn?.trim() ?? "");
  const [personnummer, setPersonnummer] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [steg, setSteg] = useState<"idle" | "pagar">("idle");
  const klart = harTillrackligaBankIdSignaturer(signaturer, 1);

  async function signera() {
    setFel(null);
    if (disabled) {
      setFel(disabledOrsak || "Signering är inte öppen ännu.");
      return;
    }
    const signNamn = namn.trim() || forvaltNamn?.trim() || "";
    if (!signNamn) {
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
          namn: signNamn,
          personnummerMaskerat: maskeraPersonnummer(personnummer),
          personnummerNyckel: nyckel,
          tidpunkt: new Date().toISOString(),
          part,
        },
        personnummer.trim(),
      );
      setPersonnummer("");
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Signering misslyckades.");
    } finally {
      setSteg("idle");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-sm font-semibold text-foreground">
        BankID · {partEtikett}
      </p>
      {signaturer.length > 0 && (
        <p className="mt-2 rounded-lg bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          Signerat: {formateraBankIdSignatur(signaturer[0])} ·{" "}
          {new Date(signaturer[0].tidpunkt).toLocaleString("sv-SE")}
        </p>
      )}
      {klart ? (
        <p className="mt-2 text-sm font-medium text-primary-dark">
          Signering klar.
        </p>
      ) : (
        <>
          {disabled && disabledOrsak && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {disabledOrsak}
            </p>
          )}
          <label className="mt-3 block text-sm">
            <span className="font-medium text-foreground">Namn</span>
            <input
              type="text"
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              disabled={disabled || steg === "pagar" || Boolean(forvaltNamn?.trim())}
              placeholder={forvaltNamn || "Namn på undertecknare"}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-foreground">Personnummer</span>
            <input
              type="text"
              inputMode="numeric"
              value={personnummer}
              onChange={(e) => setPersonnummer(e.target.value)}
              disabled={disabled || steg === "pagar"}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
            />
          </label>
          {fel && (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {fel}
            </p>
          )}
          <button
            type="button"
            onClick={() => void signera()}
            disabled={disabled || steg === "pagar"}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {steg === "pagar" ? "Öppnar BankID…" : knaptext ?? "Signera med BankID"}
          </button>
        </>
      )}
    </div>
  );
}
