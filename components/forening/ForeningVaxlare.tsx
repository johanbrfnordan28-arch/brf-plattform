"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  arEgenTestForening,
  listaEgnaTestForeningar,
} from "@/lib/forening-inloggning";
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
  };
}

/**
 * När ni är inloggade på en skapad testförening syns bara den.
 * Demoföreningar (Test 1–3, Nordan, Sailor) visas inte.
 */
export function ForeningVaxlare() {
  const [aktivId, setAktivId] = useState(GRUNDMALL_FORENING_ID);
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [redo, setRedo] = useState(false);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    setAktivId(id);

    const aktivProfil =
      lasForeningProfil(id) ??
      tomProfil(id, hamtaAktivForeningsNamn());

    let lista: ForeningProfil[];

    if (arEgenTestForening(id)) {
      // Inloggad på skapad förening → endast den (inga övriga testföreningar).
      lista = [aktivProfil];
    } else {
      const egna = listaEgnaTestForeningar();
      if (egna.length > 0) {
        // Finns skapade föreningar men aktiv är demo/grundmall → visa bara egna.
        lista = egna;
        if (!lista.some((f) => f.id === id) && id !== GRUNDMALL_FORENING_ID) {
          lista = [...lista, aktivProfil];
        }
      } else {
        // Inga skapade → demoföreningar för plattformstest.
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
        <span className="font-medium">Aktiv förening</span>
        {endastEn ? (
          <span
            className="max-w-[14rem] truncate rounded-lg border border-border bg-white px-2 py-1.5 text-sm font-medium text-foreground sm:max-w-[18rem]"
            title={foreningar[0]?.namn}
          >
            {foreningar[0]?.namn ?? hamtaAktivForeningsNamn()}
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
              </option>
            ))}
          </select>
        )}
      </label>
      {!egenAktiv && (
        <Link
          href="/styrelse-login"
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Byt förening via inloggning
        </Link>
      )}
      {egenAktiv && (
        <Link
          href="/styrelse-login"
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Logga in på annan förening
        </Link>
      )}
      <Link
        href={PROVA_GRATIS_PATH}
        className="text-xs font-medium text-primary-dark hover:underline"
      >
        + Ny förening
      </Link>
    </div>
  );
}
