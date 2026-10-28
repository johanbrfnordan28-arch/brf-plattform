"use client";

import { useEffect, useState } from "react";
import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  DOKUMENTBANK_EGNA_EVENT,
  lasEgnaDokumentbankMallar,
} from "@/components/dokumentbank/dokumentbank-lager";
import { dokumentbankMallar } from "@/components/dokumentbank/mallar";
import {
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  projektDokumentFranBank,
  projektDokumentFranForeningsDokument,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import type { ProjektDokument } from "@/components/projekt/projekt";

type ProjektDokumentImportPanelProps = {
  onLaggTill: (dok: ProjektDokument) => void;
  onStang: () => void;
};

export function ProjektDokumentImportPanel({
  onLaggTill,
  onStang,
}: ProjektDokumentImportPanelProps) {
  const [flik, setFlik] = useState<"mina" | "mallar">("mina");
  const [mina, setMina] = useState<ForeningsDokument[]>([]);
  const [mallar, setMallar] = useState<DokumentbankMall[]>([]);

  function ladda() {
    setMina(lasForeningsDokument().dokument);
    setMallar([...dokumentbankMallar, ...lasEgnaDokumentbankMallar()]);
  }

  useEffect(() => {
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    window.addEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
    return () => {
      window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
      window.removeEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
    };
  }, []);

  return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-[#eef6f0]/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary-dark">
          Importera från dokumentbank
        </p>
        <button
          type="button"
          onClick={onStang}
          className="text-xs text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>
      <div className="mt-2 flex gap-1">
        <button
          type="button"
          onClick={() => setFlik("mina")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            flik === "mina"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted"
          }`}
        >
          Mina dokument
        </button>
        <button
          type="button"
          onClick={() => setFlik("mallar")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
            flik === "mallar"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted"
          }`}
        >
          Mallar
        </button>
      </div>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {flik === "mina" &&
          (mina.length === 0 ? (
            <li className="text-xs text-muted">
              Skapa dokument under{" "}
              <a href="/forening/dokumentbank" className="underline">
                Dokumentbank
              </a>
              .
            </li>
          ) : (
            mina.map((dok) => (
              <li
                key={dok.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm">{dok.titel}</span>
                <button
                  type="button"
                  onClick={() =>
                    onLaggTill(projektDokumentFranForeningsDokument(dok))
                  }
                  className="shrink-0 rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary-dark"
                >
                  Lägg till
                </button>
              </li>
            ))
          ))}
        {flik === "mallar" &&
          mallar.map((mall) => (
            <li
              key={mall.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm">{mall.titel}</span>
              <button
                type="button"
                onClick={() =>
                  onLaggTill(
                    projektDokumentFranBank(mall.id, mall.filnamn, mall.titel),
                  )
                }
                className="shrink-0 rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary-dark"
              >
                Lägg till
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
