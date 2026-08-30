"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import {
  arAktivKundForening,
  arKundForening,
  KUND_LOGIN_PATH,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import {
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
  lasForeningProfil,
  normaliseraForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

function tomProfil(id: string, namn: string): ForeningProfil {
  return normaliseraForeningProfil({
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
  });
}

/**
 * Visar alltid bara den aktiva föreningen — aldrig en lista över andra
 * skapade test- eller kundföreningar.
 */
export function ForeningVaxlare() {
  const [aktivNamn, setAktivNamn] = useState("");
  const [redo, setRedo] = useState(false);
  const [arKund, setArKund] = useState(false);
  const [egenAktiv, setEgenAktiv] = useState(false);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    const aktivProfil =
      lasForeningProfil(id) ?? tomProfil(id, hamtaAktivForeningsNamn());
    const kundAktiv = arKundForening(aktivProfil) || arAktivKundForening(id);

    setAktivNamn(aktivProfil.namn || hamtaAktivForeningsNamn());
    setArKund(kundAktiv);
    setEgenAktiv(arEgenTestForening(id) || kundAktiv);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  if (!redo) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted">Laddar …</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-col items-end gap-1 text-xs text-muted">
        <span className="font-medium">
          {arKund ? "Er förening" : "Aktiv förening"}
        </span>
        <span
          className={`max-w-[14rem] truncate rounded-lg border px-2 py-1.5 text-sm font-medium sm:max-w-[18rem] ${
            egenAktiv && !arKund
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : "border-border bg-white text-foreground"
          }`}
          title={aktivNamn}
        >
          {aktivNamn}
          {arKund ? " · Kund" : egenAktiv ? " · Test" : ""}
        </span>
      </div>
      {arKund ? (
        <Link
          href={KUND_LOGIN_PATH}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Sök och logga in igen
        </Link>
      ) : (
        <Link
          href={TEST_LOGIN_PATH}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          {egenAktiv ? "Logga in på annan förening" : "Byt förening via sök"}
        </Link>
      )}
      {!arKund && (
        <Link
          href={PROVA_GRATIS_PATH}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          + Ny förening
        </Link>
      )}
    </div>
  );
}
