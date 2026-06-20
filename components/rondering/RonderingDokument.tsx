"use client";

import { useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  ronderingMappar,
  skapaRonderingDokumentId,
  type RonderingMappDefinition,
} from "@/components/rondering/mappar";

type UppladdatDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

type MappState = {
  öppen: boolean;
  dokument: UppladdatDokument[];
};

function initialMappState(): Record<string, MappState> {
  return Object.fromEntries(
    ronderingMappar.map((mapp) => [mapp.id, { öppen: false, dokument: [] }]),
  );
}

export function RonderingDokument() {
  const [mappar, setMappar] = useState(initialMappState);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(null);

  function toggleMapp(id: string) {
    setMappar((current) => ({
      ...current,
      [id]: { ...current[id], öppen: !current[id].öppen },
    }));
  }

  function läggTillDokument(mappId: string, fil: File | null) {
    if (!fil) return;
    const dokument: UppladdatDokument = {
      id: skapaRonderingDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setMappar((current) => ({
      ...current,
      [mappId]: {
        ...current[mappId],
        dokument: [...current[mappId].dokument, dokument],
      },
    }));
    setPågåendeUppladdning(null);
  }

  function taBortDokument(mappId: string, dokumentId: string) {
    setMappar((current) => ({
      ...current,
      [mappId]: {
        ...current[mappId],
        dokument: current[mappId].dokument.filter((doc) => doc.id !== dokumentId),
      },
    }));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Tre mappar för dokument kring rondering och städ — samma uppladdning som i
        juridik och föreningsinformation.
      </p>
      <DemoFilSparningNotis />

      <ul className="space-y-3">
        {ronderingMappar.map((mapp) => (
          <RonderingMappRad
            key={mapp.id}
            mapp={mapp}
            state={mappar[mapp.id]}
            visarUppladdning={pågåendeUppladdning === mapp.id}
            onToggle={() => toggleMapp(mapp.id)}
            onVisaUppladdning={() => setPågåendeUppladdning(mapp.id)}
            onUpload={(fil) => läggTillDokument(mapp.id, fil)}
            onTaBort={(dokumentId) => taBortDokument(mapp.id, dokumentId)}
          />
        ))}
      </ul>
    </div>
  );
}

type RonderingMappRadProps = {
  mapp: RonderingMappDefinition;
  state: MappState;
  visarUppladdning: boolean;
  onToggle: () => void;
  onVisaUppladdning: () => void;
  onUpload: (fil: File | null) => void;
  onTaBort: (dokumentId: string) => void;
};

function RonderingMappRad({
  mapp,
  state,
  visarUppladdning,
  onToggle,
  onVisaUppladdning,
  onUpload,
  onTaBort,
}: RonderingMappRadProps) {
  return (
    <li className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={state.öppen}
      >
        <OppnaStangIkon oppen={state.öppen} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground">
            {mapp.titel}
          </span>
          <span className="mt-1 block text-sm text-muted">{mapp.beskrivning}</span>
          {state.dokument.length > 0 && (
            <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {state.dokument.length}{" "}
              {state.dokument.length === 1 ? "dokument" : "dokument"}
            </span>
          )}
        </span>
      </button>

      {state.öppen && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-foreground">{mapp.vägledning}</p>

          {state.dokument.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {state.dokument.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.filnamn}</p>
                    <p className="text-xs text-muted">Uppladdad {doc.uppladdad}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTaBort(doc.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
              Inga dokument uppladdade ännu i denna mapp.
            </p>
          )}

          <div className="mt-4">
            {!visarUppladdning ? (
              <button
                type="button"
                onClick={onVisaUppladdning}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                Ladda upp dokument
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4">
                <p className="text-sm font-medium text-foreground">Ladda upp dokument</p>
                <p className="mt-1 text-xs text-muted">
                  PDF, Word eller bild — sparas i föreningens ronderingsbibliotek (demo).
                </p>
                <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                  Välj fil
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*,application/pdf"
                    className="sr-only"
                    onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
