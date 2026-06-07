"use client";

import { useEffect, useState } from "react";
import type { DokumentbankMall } from "@/components/dokumentbank/mallar";
import {
  DOKUMENTBANK_EGNA_EVENT,
  hamtaAllaUpphandlingsMallar,
  läggTillEgenDokumentbankMall,
  lasEgnaDokumentbankMallar,
  taBortEgenDokumentbankMall,
  type EgenDokumentbankMall,
} from "@/components/dokumentbank/dokumentbank-lager";

type DokumentbankPanelProps = {
  onVälj: (mall: DokumentbankMall) => void;
  aktivVal?: string | null;
};

function arEgenMall(id: string): boolean {
  return id.startsWith("egen-");
}

export function DokumentbankPanel({ onVälj, aktivVal }: DokumentbankPanelProps) {
  const [mallar, setMallar] = useState<DokumentbankMall[]>([]);
  const [egna, setEgna] = useState<EgenDokumentbankMall[]>([]);

  function ladda() {
    setMallar(hamtaAllaUpphandlingsMallar());
    setEgna(lasEgnaDokumentbankMallar());
  }

  useEffect(() => {
    ladda();
    window.addEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
    return () => window.removeEventListener(DOKUMENTBANK_EGNA_EVENT, ladda);
  }, []);

  function laddaUppEgen(fil: File | null) {
    if (!fil) return;
    läggTillEgenDokumentbankMall(fil.name);
    ladda();
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-[#eef6f0] p-4 sm:p-5">
      <p className="text-sm font-semibold text-primary-dark">Dokumentbank</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Gemensam bank med BRF Företags mallar plus era egna uppladdningar. Välj en
        mall nedan och koppla den till rätt plats i en kategori — eller ladda upp
        egen fil till banken först.
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-primary/35 bg-white/80 p-4">
        <p className="text-sm font-medium text-foreground">Er förenings egna mallar</p>
        <p className="mt-1 text-xs text-muted">
          Uppladdade filer sparas per förening och syns bara i er dokumentbank.
        </p>
        <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]">
          Ladda upp till dokumentbanken
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,image/*"
            className="sr-only"
            onChange={(event) => {
              laddaUppEgen(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </label>
        {egna.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {egna.map((mall) => (
              <li key={mall.id} className="flex items-center justify-between gap-2">
                <span>
                  {mall.titel} · uppladdad {mall.uppladdad}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    taBortEgenDokumentbankMall(mall.id);
                    ladda();
                  }}
                  className="shrink-0 text-muted hover:text-red-700"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {mallar.map((mall) => (
          <li
            key={mall.id}
            className={`flex flex-col gap-2 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between ${
              aktivVal === mall.id ? "border-primary" : "border-border"
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {mall.titel}
                {arEgenMall(mall.id) && (
                  <span className="ml-2 text-xs font-normal text-primary-dark">
                    (er uppladdning)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted">{mall.filnamn}</p>
              <p className="mt-1 text-xs text-muted">{mall.beskrivning}</p>
            </div>
            <button
              type="button"
              onClick={() => onVälj(mall)}
              className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Använd mall
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
