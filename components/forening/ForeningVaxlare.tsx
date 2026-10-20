"use client";

import { useCallback, useEffect, useState } from "react";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import {
  arAktivKundForening,
  arKundForening,
} from "@/lib/forening-kund";
import {
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
  INGEN_AKTIV_FORENING_ETIKETT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";

function visningsnamnForAktivForening(): string {
  const id = lasAktivForeningId();
  const profilNamn = lasForeningProfil(id)?.namn?.trim();
  const aktivNamn = hamtaAktivForeningsNamn().trim();
  return profilNamn || aktivNamn || INGEN_AKTIV_FORENING_ETIKETT;
}

/**
 * Visar alltid bara den aktiva föreningen — aldrig inloggning eller skapa-ny.
 * Pillen får aldrig vara tom: saknas namn visas en kort fallback.
 */
export function ForeningVaxlare() {
  const namnFranStore = useAktivForeningsNamn();
  const [aktivNamn, setAktivNamn] = useState("");
  const [redo, setRedo] = useState(false);
  const [arKund, setArKund] = useState(false);
  const [egenAktiv, setEgenAktiv] = useState(false);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    const aktivProfil = lasForeningProfil(id);
    const kundAktiv = arKundForening(aktivProfil) || arAktivKundForening(id);

    setAktivNamn(visningsnamnForAktivForening());
    setArKund(kundAktiv);
    setEgenAktiv(arEgenTestForening(id) || kundAktiv);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  const visatNamn =
    (redo ? aktivNamn : namnFranStore).trim() || INGEN_AKTIV_FORENING_ETIKETT;

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex flex-col items-end gap-1 text-xs text-muted">
        <span className="font-medium">
          {arKund ? "Er förening" : "Aktiv förening"}
        </span>
        <span
          className={`inline-block max-w-[14rem] shrink-0 truncate rounded-lg border px-2 py-1.5 text-sm font-medium sm:max-w-[18rem] ${
            egenAktiv && !arKund
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : "border-border bg-white text-foreground"
          }`}
          title={visatNamn}
        >
          {visatNamn}
          {arKund ? " · Kund" : egenAktiv ? " · Test" : ""}
        </span>
      </div>
    </div>
  );
}
