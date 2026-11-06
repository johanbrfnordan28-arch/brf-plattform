"use client";

import { useState } from "react";
import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulArEnergideklaration,
  arshjulArOvk,
  arshjulArRadon,
  arshjulArSotning,
  arshjulBesiktningKanUnderkannas,
  arshjulNastaBesiktningAr,
} from "@/components/arshjul/arshjul-handelse-falt";
import { BesiktningUnderkandFalt } from "@/components/BesiktningUnderkandFalt";
import { arFranDatum, kontrolleraOrdinarieAr, tolkaAr } from "@/lib/besiktning-intervall";

const inputKlass =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";

function texter(h: ArshjulHandelse) {
  if (arshjulArOvk(h)) {
    return {
      utforare: "Utförd av (besiktningsföretag)",
      placeholder: "Certifierat OVK-företag",
      datum: "Datum för godkänd OVK",
      nasta: "Nästa OVK",
    };
  }
  if (arshjulArEnergideklaration(h)) {
    return {
      utforare: "Utförd av (energiexpert)",
      placeholder: "Certifierad energiexpert",
      datum: "Datum då energideklarationen blev klar",
      nasta: "Nästa energideklaration",
    };
  }
  if (arshjulArRadon(h)) {
    return {
      utforare: "Utförd av (mätföretag eller laboratorium)",
      placeholder: "Företag som utförde mätningen",
      datum: "Datum då radonmätningen blev klar",
      nasta: "Nästa radonmätning",
    };
  }
  if (arshjulArSotning(h)) {
    return {
      utforare: "Utförd av (sotare eller brandskyddskontrollant)",
      placeholder: "Företag som utförde kontrollen",
      datum: "Datum för godkänd kontroll",
      nasta: "Nästa kontroll",
    };
  }
  return {
    utforare: "Utförd av (besiktningsföretag)",
    placeholder: "Företag som utförde besiktningen",
    datum: "Datum för godkänd besiktning",
    nasta: "Nästa besiktning",
  };
}

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

/** Vem som utförde, datum för godkännande och nästa besiktning — sparas med knapp. */
export function ArshjulBesiktningUppgifter({ handelse, onSpara }: Props) {
  const t = texter(handelse);
  const kanUnderkannas = arshjulBesiktningKanUnderkannas(handelse);
  const [leverantor, setLeverantor] = useState(handelse.leverantor ?? "");
  const [godkandDatum, setGodkandDatum] = useState(handelse.besiktningSenastDatum ?? "");
  const [underkand, setUnderkand] = useState(Boolean(handelse.besiktningUnderkandForst));
  const [ordinarieAr, setOrdinarieAr] = useState(
    handelse.besiktningOrdinarieAr ? String(handelse.besiktningOrdinarieAr) : "",
  );
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  const godkandAr = arFranDatum(godkandDatum);
  const ordinarie = kanUnderkannas && underkand ? tolkaAr(ordinarieAr) : null;
  const utkast: ArshjulHandelse = {
    ...handelse,
    besiktningSenastDatum: godkandDatum || undefined,
    besiktningUnderkandForst: Boolean(ordinarie) || undefined,
    besiktningOrdinarieAr: ordinarie ?? undefined,
    senastKlarAr: ordinarie ?? godkandAr ?? handelse.senastKlarAr,
  };
  const nastaAr = arshjulNastaBesiktningAr(utkast);

  const andrad =
    leverantor.trim() !== (handelse.leverantor ?? "") ||
    godkandDatum !== (handelse.besiktningSenastDatum ?? "") ||
    (kanUnderkannas && underkand) !== Boolean(handelse.besiktningUnderkandForst) ||
    (ordinarie ?? undefined) !== handelse.besiktningOrdinarieAr;

  function spara() {
    if (kanUnderkannas && underkand) {
      const fel = kontrolleraOrdinarieAr(ordinarie, godkandAr);
      if (fel) {
        setStatus({ fel: true, text: fel });
        return;
      }
    }
    onSpara({
      leverantor: leverantor.trim() || undefined,
      besiktningSenastDatum: utkast.besiktningSenastDatum,
      besiktningUnderkandForst: utkast.besiktningUnderkandForst,
      besiktningOrdinarieAr: utkast.besiktningOrdinarieAr,
      senastKlarAr: utkast.senastKlarAr,
    });
    setStatus({ fel: false, text: "Uppgifterna är sparade." });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white p-3">
      <p className="text-sm font-medium text-foreground">Senaste besiktning</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-foreground">{t.utforare}</span>
          <input
            value={leverantor}
            onChange={(e) => {
              setLeverantor(e.target.value);
              setStatus(null);
            }}
            placeholder={t.placeholder}
            className={inputKlass}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">{t.datum}</span>
          <input
            type="date"
            value={godkandDatum}
            onChange={(e) => {
              setGodkandDatum(e.target.value);
              setStatus(null);
            }}
            className={inputKlass}
          />
        </label>
      </div>

      {kanUnderkannas ? (
        <BesiktningUnderkandFalt
          underkand={underkand}
          ordinarieAr={ordinarieAr}
          onUnderkand={(v) => {
            setUnderkand(v);
            setStatus(null);
          }}
          onOrdinarieAr={(v) => {
            setOrdinarieAr(v);
            setStatus(null);
          }}
        />
      ) : null}

      <div className="rounded-lg border border-border bg-[#f7f9f8] px-3 py-2 text-sm">
        <span className="font-medium text-foreground">{t.nasta}</span>
        <p className="mt-0.5 text-muted">
          {!nastaAr
            ? "Ange datum ovan så räknas nästa år ut."
            : handelse.intervallAr && (godkandAr || ordinarie || handelse.senastKlarAr)
              ? `År ${nastaAr} (vart ${handelse.intervallAr}:e år, räknat från ${
                  ordinarie ? `ordinarie år ${ordinarie}` : "senaste tillfället"
                }).`
              : `Planerat år ${nastaAr}.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={spara}
          disabled={!andrad}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Spara uppgifter
        </button>
        {andrad && !status ? (
          <span className="text-xs text-amber-800">Ändringarna är inte sparade än.</span>
        ) : null}
        {status ? (
          <span
            className={`text-sm ${status.fel ? "text-red-800" : "text-primary-dark"}`}
            role={status.fel ? "alert" : "status"}
          >
            {status.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
