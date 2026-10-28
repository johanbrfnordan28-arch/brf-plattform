"use client";

import { useEffect, useState } from "react";
import {
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  dokumentRefFranForeningsDokument,
  dokumentRefFranProjektDokument,
  listaImporterbaraProjektDokument,
  type ProjektDokumentRef,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import type { DokumentRef } from "@/components/upphandling/upphandling-dokument-lager";

type UpphandlingDokumentImportPanelProps = {
  aktivVal?: string | null;
  onVäljRef: (ref: DokumentRef) => void;
  harValtPlats: boolean;
};

export function UpphandlingDokumentImportPanel({
  aktivVal,
  onVäljRef,
  harValtPlats,
}: UpphandlingDokumentImportPanelProps) {
  const [mina, setMina] = useState<ForeningsDokument[]>([]);
  const [franProjekt, setFranProjekt] = useState<ProjektDokumentRef[]>([]);

  function ladda() {
    setMina(lasForeningsDokument().dokument);
    setFranProjekt(listaImporterbaraProjektDokument());
  }

  useEffect(() => {
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-sm font-semibold text-foreground">
          Föreningens dokument (projektbibliotek)
        </p>
        <p className="mt-1 text-xs text-muted">
          Kopior skapade under Dokumentbank — med föreningsuppgifter ifyllda där mallen
          stödjer det.
        </p>
        {!harValtPlats && (
          <p className="mt-2 text-xs text-amber-800">
            Välj först &quot;Från dokumentbanken&quot; på en dokumentplats i en kategori.
          </p>
        )}
        {mina.length === 0 ? (
          <p className="mt-3 text-xs text-muted">Inga dokument skapade ännu.</p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {mina.map((dok) => {
              const ref = dokumentRefFranForeningsDokument(dok);
              const aktiv = aktivVal === `fdok-${dok.id}`;
              return (
                <li
                  key={dok.id}
                  className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
                    aktiv ? "border-primary bg-[#eef6f0]" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{dok.titel}</p>
                    <p className="text-xs text-muted">{dok.mallTitel}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!harValtPlats}
                    onClick={() => onVäljRef(ref)}
                    className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-40"
                  >
                    Använd
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-sm font-semibold text-foreground">Från projekt</p>
        <p className="mt-1 text-xs text-muted">
          Dokument kopplade till dokumentbanken i era projektmappar.
        </p>
        {franProjekt.length === 0 ? (
          <p className="mt-3 text-xs text-muted">
            Inga importerbara projektdokument ännu.
          </p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {franProjekt.map((rad) => {
              const ref = dokumentRefFranProjektDokument(rad.dokument);
              if (!ref) return null;
              const aktiv = aktivVal === `proj-${rad.dokument.id}`;
              return (
                <li
                  key={`${rad.projektId}-${rad.dokument.id}`}
                  className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
                    aktiv ? "border-primary bg-[#eef6f0]" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {rad.dokument.filnamn}
                    </p>
                    <p className="text-xs text-muted">
                      {rad.projektTitel} · {rad.mappTitel}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!harValtPlats}
                    onClick={() => onVäljRef(ref)}
                    className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:opacity-40"
                  >
                    Använd
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
