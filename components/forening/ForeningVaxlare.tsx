"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
  lasForeningProfil,
  listaAllaForeningerForVaxlare,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export function ForeningVaxlare() {
  const [aktivId, setAktivId] = useState(GRUNDMALL_FORENING_ID);
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [redo, setRedo] = useState(false);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    setAktivId(id);
    let lista = listaAllaForeningerForVaxlare();
    if (id && !lista.some((f) => f.id === id)) {
      const profil = lasForeningProfil(id);
      lista = [
        ...lista,
        profil ?? {
          id,
          namn: hamtaAktivForeningsNamn(),
          skapadTidpunkt: new Date().toISOString(),
          organisationsnummer: "",
          epost: "",
          postadress: "",
          ort: "",
          kontaktperson: "",
          grundinfoPaborjad: false,
        },
      ];
    }
    setForeningar(lista);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  function bytForening(id: string) {
    if (id === aktivId) return;
    sattAktivForeningId(id);
    setAktivId(id);
  }

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
      </label>
      <Link
        href={PROVA_GRATIS_PATH}
        className="text-xs font-medium text-primary-dark hover:underline"
      >
        + Ny förening
      </Link>
    </div>
  );
}
