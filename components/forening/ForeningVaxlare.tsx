"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  arEgenTestForening,
  listaEgnaTestForeningar,
} from "@/lib/forening-inloggning";
import {
  arAktivKundForening,
  arKundForening,
  KUND_LOGIN_PATH,
  listaKundForeningar,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
  lasForeningProfil,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { listaInloggningsTestForeningar } from "@/lib/testforeningar";

function tomProfil(id: string, namn: string): ForeningProfil {
  return {
    id,
    namn,
    skapadTidpunkt: new Date().toISOString(),
    organisationsnummer: "",
    epost: "",
    postadress: "",
    ort: "",
    kontaktperson: "",
    grundinfoPaborjad: false,
    avtalGodkant: false,
    avtalGodkantTidpunkt: "",
  };
}

/**
 * Växlare: när ni är inloggade på en skapad förening (test eller kund)
 * syns bara den — aldrig andra föreningars namn eller data.
 */
export function ForeningVaxlare() {
  const [aktivId, setAktivId] = useState(GRUNDMALL_FORENING_ID);
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [redo, setRedo] = useState(false);
  const [arKund, setArKund] = useState(false);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    setAktivId(id);

    const aktivProfil =
      lasForeningProfil(id) ??
      tomProfil(id, hamtaAktivForeningsNamn());
    const kundAktiv = arKundForening(aktivProfil) || arAktivKundForening(id);
    setArKund(kundAktiv);

    let lista: ForeningProfil[];

    if (arEgenTestForening(id) || kundAktiv) {
      // Inloggad på skapad förening → endast den (inga övriga).
      lista = [aktivProfil];
    } else {
      const egna = listaEgnaTestForeningar();
      if (egna.length > 0) {
        lista = egna;
        if (!lista.some((f) => f.id === id) && id !== GRUNDMALL_FORENING_ID) {
          lista = [...lista, aktivProfil];
        }
      } else {
        lista = listaInloggningsTestForeningar();
        if (id && !lista.some((f) => f.id === id)) {
          lista = [...lista, aktivProfil];
        }
      }
    }

    setForeningar(lista);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  function bytForening(nastaId: string) {
    if (nastaId === aktivId) return;
    sattAktivForeningId(nastaId);
    setAktivId(nastaId);
    window.location.assign("/forening");
  }

  const endastEn = foreningar.length <= 1;
  const egenAktiv = arEgenTestForening(aktivId);

  if (!redo) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted">Laddar föreningar …</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="flex flex-col items-end gap-1 text-xs text-muted">
        <span className="font-medium">
          {arKund ? "Er förening" : "Aktiv förening"}
        </span>
        {endastEn ? (
          <span
            className="max-w-[14rem] truncate rounded-lg border border-border bg-white px-2 py-1.5 text-sm font-medium text-foreground sm:max-w-[18rem]"
            title={foreningar[0]?.namn}
          >
            {foreningar[0]?.namn ?? hamtaAktivForeningsNamn()}
            {arKund ? " · Kund" : ""}
          </span>
        ) : (
          <select
            value={aktivId}
            onChange={(e) => bytForening(e.target.value)}
            className="max-w-[14rem] rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground sm:max-w-[18rem]"
            aria-label="Välj förening att arbeta med"
          >
            {foreningar.map((f) => (
              <option key={f.id} value={f.id}>
                {f.namn}
                {arKundForening(f) ? " (kund)" : ""}
              </option>
            ))}
          </select>
        )}
      </label>
      {arKund ? (
        <>
          {listaKundForeningar().length > 1 && (
            <Link
              href={KUND_LOGIN_PATH}
              className="text-xs font-medium text-primary-dark hover:underline"
            >
              Byt kundförening
            </Link>
          )}
        </>
      ) : egenAktiv ? (
        <Link
          href={TEST_LOGIN_PATH}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Logga in på annan förening
        </Link>
      ) : (
        <Link
          href={TEST_LOGIN_PATH}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Byt förening via inloggning
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
