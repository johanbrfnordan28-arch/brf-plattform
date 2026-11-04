"use client";

import { useEffect, useState } from "react";
import {
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  listaArshjulBilagor,
  skapaForeningsDokumentFranArshjul,
  type ArshjulBilagaRef,
} from "@/components/dokumentbank/intern-dokument-flode";

type Props = {
  className?: string;
};

/** Hämta filer från årshjul till föreningens dokument — utan att lämna dokumentbanken. */
export function ForeningInternDokumentHamta({ className = "" }: Props) {
  const [bilagor, setBilagor] = useState<ArshjulBilagaRef[]>([]);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  function ladda() {
    setBilagor(listaArshjulBilagor());
  }

  useEffect(() => {
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
  }, []);

  function hamta(ref: ArshjulBilagaRef) {
    setFel(null);
    setMeddelande(null);
    const resultat = skapaForeningsDokumentFranArshjul(ref);
    if (!resultat.ok) {
      setFel(resultat.fel);
      return;
    }
    setMeddelande(`«${resultat.dokument.titel}» sparades under föreningens dokument.`);
    lasForeningsDokument();
  }

  if (bilagor.length === 0) return null;

  return (
    <details
      className={`rounded-xl border border-border bg-white p-4 ${className}`}
    >
      <summary className="cursor-pointer text-sm font-semibold text-primary-dark">
        Hämta från årshjul
      </summary>
      <p className="mt-2 text-xs text-muted">
        Kopiera bilagor från årshjulshändelser till föreningens dokument.
      </p>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {bilagor.map((b) => (
          <li
            key={`${b.handelseId}-${b.bilagaId}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {b.filnamn}
              </p>
              <p className="text-xs text-muted">{b.handelseRubrik}</p>
            </div>
            <button
              type="button"
              onClick={() => hamta(b)}
              className="shrink-0 rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              Spara här
            </button>
          </li>
        ))}
      </ul>
      {meddelande ? (
        <p className="mt-2 text-xs text-primary-dark" role="status">
          {meddelande}
        </p>
      ) : null}
      {fel ? (
        <p className="mt-2 text-xs text-red-800" role="alert">
          {fel}
        </p>
      ) : null}
    </details>
  );
}
