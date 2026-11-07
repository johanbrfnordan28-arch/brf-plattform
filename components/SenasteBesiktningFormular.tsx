"use client";

import { useState } from "react";
import { BesiktningResultatFalt } from "@/components/BesiktningResultatFalt";
import {
  beraknaNastaBesiktningDatum,
  type BesiktningTyp,
  type SenasteBesiktningUppgifter as SenasteBesiktningVarden,
} from "@/lib/besiktning-intervall";

const inputKlass =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";

function texter(typ: BesiktningTyp) {
  switch (typ) {
    case "ovk":
      return {
        utforare: "Utförd av (besiktningsföretag)",
        placeholder: "Certifierat OVK-företag",
        datum: "Besiktningsdatum",
        nasta: "Nästa ordinarie OVK",
        anteckning: "Information från protokollet",
        anteckningPlaceholder:
          "T.ex. vilka anmärkningar som finns och var, vem som ansvarar för åtgärden och vad som är beställt",
      };
    case "energideklaration":
      return {
        utforare: "Utförd av (energiexpert)",
        placeholder: "Certifierad energiexpert",
        datum: "Datum för energideklarationen",
        nasta: "Ny energideklaration senast",
        anteckning: "Anteckningar",
        anteckningPlaceholder: "T.ex. energiklass och energiprestanda (kWh/m² och år)",
      };
    case "radon":
      return {
        utforare: "Utförd av (mätföretag eller laboratorium)",
        placeholder: "Företag som utförde mätningen",
        datum: "Datum då mätningen avslutades",
        nasta: "Nästa radonmätning",
        anteckning: "Anteckningar",
        anteckningPlaceholder: "T.ex. uppmätta värden och i vilka lägenheter",
      };
    case "sotning":
      return {
        utforare: "Utförd av (sotare eller brandskyddskontrollant)",
        placeholder: "Företag som utförde kontrollen",
        datum: "Datum för kontrollen",
        nasta: "Nästa kontroll",
        anteckning: "Anteckningar",
        anteckningPlaceholder: "T.ex. anmärkningar från sotaren",
      };
    default:
      return {
        utforare: "Utförd av (besiktningsföretag)",
        placeholder: "Företag som utförde besiktningen",
        datum: "Besiktningsdatum",
        nasta: "Nästa ordinarie besiktning",
        anteckning: "Anteckningar",
        anteckningPlaceholder: "T.ex. anmärkningar och vad som ska åtgärdas",
      };
  }
}

function lika(a: SenasteBesiktningVarden, b: SenasteBesiktningVarden): boolean {
  return JSON.stringify(rensa(a)) === JSON.stringify(rensa(b));
}

function rensa(v: SenasteBesiktningVarden): SenasteBesiktningVarden {
  const a = v.anmarkningar;
  const harAnm = a && (a.utfall0 != null || a.utfall1 != null || a.utfall2 != null);
  return {
    utforsAv: v.utforsAv?.trim() || undefined,
    datum: v.datum || undefined,
    resultat: v.resultat,
    ombesiktningSenast: v.resultat === "ej_godkand" ? v.ombesiktningSenast || undefined : undefined,
    ombesiktningGodkand:
      v.resultat === "ej_godkand" ? v.ombesiktningGodkand || undefined : undefined,
    anmarkningar: harAnm
      ? { utfall0: a.utfall0, utfall1: a.utfall1, utfall2: a.utfall2 }
      : undefined,
    anteckning: v.anteckning?.trim() || undefined,
  };
}

type Props = {
  typ: BesiktningTyp;
  intervallAr: number | undefined;
  sparat: SenasteBesiktningVarden;
  onSpara: (varden: SenasteBesiktningVarden) => void;
  sparaEtikett?: string;
};

/** Senaste besiktning: utförare, datum, nästa tillfälle och resultat — sparas med knapp. */
export function SenasteBesiktningFormular({
  typ,
  intervallAr,
  sparat,
  onSpara,
  sparaEtikett = "Spara senaste besiktning",
}: Props) {
  const t = texter(typ);
  const [varden, setVarden] = useState<SenasteBesiktningVarden>(sparat);
  const [status, setStatus] = useState<{ fel: boolean; text: string } | null>(null);

  const nastaDatum = beraknaNastaBesiktningDatum(varden.datum, intervallAr);
  const andrad = !lika(varden, sparat);

  function andra(patch: Partial<SenasteBesiktningVarden>) {
    setVarden((cur) => ({ ...cur, ...patch }));
    setStatus(null);
  }

  function spara() {
    const v = rensa(varden);
    if (!v.datum && !v.utforsAv) {
      setStatus({ fel: true, text: "Fyll i minst datum eller vem som utförde besiktningen." });
      return;
    }
    if (v.ombesiktningGodkand && v.datum && v.ombesiktningGodkand < v.datum) {
      setStatus({
        fel: true,
        text: "Ombesiktningen kan inte vara godkänd före den ordinarie besiktningen.",
      });
      return;
    }
    onSpara(v);
    setVarden(v);
    setStatus({ fel: false, text: "Uppgifterna är sparade." });
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium text-foreground">{t.utforare}</span>
        <input
          value={varden.utforsAv ?? ""}
          onChange={(e) => andra({ utforsAv: e.target.value })}
          placeholder={t.placeholder}
          className={inputKlass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-foreground">{t.datum}</span>
          <input
            type="date"
            value={varden.datum ?? ""}
            onChange={(e) => andra({ datum: e.target.value || undefined })}
            className={inputKlass}
          />
        </label>
        <div className="text-sm">
          <span className="font-medium text-foreground">{t.nasta}</span>
          <p className="mt-1 rounded-lg border border-border bg-[#f7f9f8] px-3 py-2">
            {nastaDatum ? (
              <span className="font-medium text-foreground">{nastaDatum}</span>
            ) : (
              <span className="text-muted">Räknas ut från datumet</span>
            )}
            {intervallAr ? (
              <span className="text-xs text-muted">
                {" "}
                · {intervallAr === 1 ? "varje år" : `vart ${intervallAr}:e år`}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <BesiktningResultatFalt typ={typ} varden={varden} onChange={(v) => andra(v)} />

      <label className="block text-sm">
        <span className="font-medium text-foreground">{t.anteckning}</span>
        <textarea
          value={varden.anteckning ?? ""}
          onChange={(e) => andra({ anteckning: e.target.value })}
          rows={4}
          placeholder={t.anteckningPlaceholder}
          className={inputKlass}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={spara}
          disabled={!andrad}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sparaEtikett}
        </button>
        {status ? (
          <span
            className={`text-sm ${status.fel ? "text-red-800" : "text-primary-dark"}`}
            role={status.fel ? "alert" : "status"}
          >
            {status.text}
          </span>
        ) : andrad ? (
          <span className="text-xs text-amber-800">Ändringarna är inte sparade än.</span>
        ) : null}
      </div>
    </div>
  );
}
