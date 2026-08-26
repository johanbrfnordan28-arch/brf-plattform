"use client";

import { useEffect, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import {
  antalSotningProtokollDokument,
  formateraProtokollDatum,
  lasSotningProtokoll,
  skapaSotningDokumentId,
  skapaSotningMappId,
  sorteraProtokollDokument,
  sparaSotningProtokoll,
  type SotningProtokollDokument,
  type SotningProtokollState,
} from "@/components/foreningsinformation/sotning-protokoll";

type SotningProtokollMapparProps = {
  onAntalÄndrat?: (antal: number) => void;
};

type PågåendeUppladdning = {
  mappId: string;
  datum: string;
} | null;

function idagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SotningProtokollMappar({ onAntalÄndrat }: SotningProtokollMapparProps) {
  const [state, setState] = useState<SotningProtokollState>({
    mappDefinitioner: [],
    undermappar: {},
  });
  const [hydrated, setHydrated] = useState(false);
  const [nyMappNamn, setNyMappNamn] = useState("");
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<PågåendeUppladdning>(
    null,
  );

  useEffect(() => {
    const loaded = lasSotningProtokoll();
    setState(loaded);
    setHydrated(true);
    onAntalÄndrat?.(antalSotningProtokollDokument(loaded));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sparaSotningProtokoll(state);
    onAntalÄndrat?.(antalSotningProtokollDokument(state));
  }, [state, hydrated, onAntalÄndrat]);

  function toggleMapp(mappId: string) {
    setState((current) => {
      const mapp = current.undermappar[mappId];
      if (!mapp) return current;
      return {
        ...current,
        undermappar: {
          ...current.undermappar,
          [mappId]: { ...mapp, öppen: !mapp.öppen },
        },
      };
    });
  }

  function läggTillMapp() {
    const titel = nyMappNamn.trim();
    if (!titel) return;
    const id = skapaSotningMappId();
    setState((current) => ({
      mappDefinitioner: [
        ...current.mappDefinitioner,
        { id, titel, skapad: new Date().toLocaleDateString("sv-SE") },
      ],
      undermappar: {
        ...current.undermappar,
        [id]: { öppen: true, dokument: [] },
      },
    }));
    setNyMappNamn("");
  }

  function taBortMapp(mappId: string) {
    setState((current) => {
      const { [mappId]: _bort, ...restUndermappar } = current.undermappar;
      return {
        mappDefinitioner: current.mappDefinitioner.filter((m) => m.id !== mappId),
        undermappar: restUndermappar,
      };
    });
    setPågåendeUppladdning((current) =>
      current?.mappId === mappId ? null : current,
    );
  }

  function läggTillDokument(mappId: string, fil: File | null, datum: string) {
    if (!fil || !datum) return;
    const dokument: SotningProtokollDokument = {
      id: skapaSotningDokumentId(),
      filnamn: fil.name,
      datum,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setState((current) => {
      const mapp = current.undermappar[mappId];
      if (!mapp) return current;
      return {
        ...current,
        undermappar: {
          ...current.undermappar,
          [mappId]: {
            ...mapp,
            dokument: sorteraProtokollDokument([...mapp.dokument, dokument]),
          },
        },
      };
    });
    setPågåendeUppladdning(null);
  }

  function taBortDokument(mappId: string, dokumentId: string) {
    setState((current) => {
      const mapp = current.undermappar[mappId];
      if (!mapp) return current;
      return {
        ...current,
        undermappar: {
          ...current.undermappar,
          [mappId]: {
            ...mapp,
            dokument: mapp.dokument.filter((d) => d.id !== dokumentId),
          },
        },
      };
    });
  }

  if (!hydrated) {
    return <p className="mt-3 text-xs text-muted">Laddar protokollmappar…</p>;
  }

  return (
    <div className="mt-3 space-y-3">
      <DemoFilSparningNotis />
      {state.mappDefinitioner.length === 0 ? (
        <p className="text-xs text-muted">
          Inga undermappar ännu. Skapa t.ex. ett år eller en period (2024, Våren 2023).
        </p>
      ) : (
        <ul className="space-y-2">
          {state.mappDefinitioner.map((mapp) => {
            const mappState = state.undermappar[mapp.id] ?? {
              öppen: false,
              dokument: [],
            };
            const visarUppladdning = pågåendeUppladdning?.mappId === mapp.id;
            const uploadDatum = pågåendeUppladdning?.datum ?? idagIso();

            return (
              <li
                key={mapp.id}
                className="rounded-lg border border-border bg-white/80"
              >
                <div className="flex items-start gap-2 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleMapp(mapp.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {mapp.titel}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      Skapad {mapp.skapad}
                      {mappState.dokument.length > 0 && (
                        <span className="ml-2 font-medium text-primary-dark">
                          · {mappState.dokument.length} dokument
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => taBortMapp(mapp.id)}
                    className="shrink-0 text-xs text-muted hover:text-red-700"
                    title="Ta bort undermapp"
                  >
                    Ta bort
                  </button>
                  <OppnaStangKnapp
                    oppen={mappState.öppen}
                    onClick={() => toggleMapp(mapp.id)}
                    storlek="sm"
                    ariaLabel={
                      mappState.öppen
                        ? `Stäng mappen ${mapp.titel}`
                        : `Öppna mappen ${mapp.titel}`
                    }
                  />
                </div>

                {mappState.öppen && (
                  <div className="border-t border-border px-3 pb-4 pt-3">
                    {mappState.dokument.length > 0 ? (
                      <ul className="space-y-2">
                        {mappState.dokument.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {doc.filnamn}
                              </p>
                              <p className="text-xs text-muted">
                                Protokoll {formateraProtokollDatum(doc.datum)} · uppladdad{" "}
                                {doc.uppladdad}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => taBortDokument(mapp.id, doc.id)}
                              className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                            >
                              Ta bort
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">Inga dokument i denna mapp.</p>
                    )}

                    <div className="mt-3">
                      {!visarUppladdning ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPågåendeUppladdning({ mappId: mapp.id, datum: idagIso() })
                          }
                          className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                        >
                          Ladda upp dokument
                        </button>
                      ) : (
                        <div className="space-y-3 rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-3">
                          <label className="block text-sm">
                            <span className="font-medium text-foreground">
                              Datum för protokoll
                            </span>
                            <input
                              type="date"
                              value={uploadDatum}
                              onChange={(e) =>
                                setPågåendeUppladdning({
                                  mappId: mapp.id,
                                  datum: e.target.value,
                                })
                              }
                              className="mt-1.5 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                              Välj fil
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,image/*,application/pdf"
                                className="sr-only"
                                onChange={(e) =>
                                  läggTillDokument(
                                    mapp.id,
                                    e.target.files?.[0] ?? null,
                                    uploadDatum,
                                  )
                                }
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setPågåendeUppladdning(null)}
                              className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
                            >
                              Avbryt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="text-xs font-medium text-foreground">
            Skapa undermapp i Protokoll
          </span>
          <input
            value={nyMappNamn}
            onChange={(e) => setNyMappNamn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                läggTillMapp();
              }
            }}
            placeholder="t.ex. 2024, 2023, Våren 2022"
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={läggTillMapp}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Undermapp
        </button>
      </div>
    </div>
  );
}
