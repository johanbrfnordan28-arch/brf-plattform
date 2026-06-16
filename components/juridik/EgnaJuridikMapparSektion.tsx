"use client";

import { useEffect, useState } from "react";
import {
  lasEgnaJuridikMappar,
  skapaEgetDokumentId,
  skapaEgenMappId,
  sparaEgnaJuridikMappar,
  type EgenJuridikMapp,
  type EgnaJuridikMapparState,
} from "@/components/juridik/juridik-egna-mappar-lager";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  storageKeyBase: string;
  eventName: string;
  tomMeddelande?: string;
}

export function EgnaJuridikMapparSektion({
  storageKeyBase,
  eventName,
  tomMeddelande = "Inga egna mappar skapade ännu.",
}: Props) {
  const [state, setState] = useState<EgnaJuridikMapparState>({
    version: 1,
    mappar: [],
  });
  const [mappUi, setMappUi] = useState<Record<string, { öppen: boolean }>>({});
  const [uppladdningFor, setUppladningFor] = useState<string | null>(null);
  const [visaSkapaForm, setVisaSkapaForm] = useState(false);
  const [skaparTitel, setSkaparTitel] = useState("");
  const [skaparBeskrivning, setSkaparBeskrivning] = useState("");
  const [byttNamnId, setByttNamnId] = useState<string | null>(null);
  const [byttNamnVarde, setByttNamnVarde] = useState("");
  const [byttBeskrivningVarde, setByttBeskrivningVarde] = useState("");
  const [bekraftaTaBortId, setBekraftaTaBortId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const laddad = lasEgnaJuridikMappar(storageKeyBase);
    setState(laddad);
    setMappUi(
      Object.fromEntries(laddad.mappar.map((m) => [m.id, { öppen: false }])),
    );
    setHydrated(true);

    function synka() {
      const ny = lasEgnaJuridikMappar(storageKeyBase);
      setState(ny);
      setMappUi((prev) => {
        const next = { ...prev };
        for (const m of ny.mappar) {
          if (!(m.id in next)) next[m.id] = { öppen: false };
        }
        return next;
      });
    }
    window.addEventListener(eventName, synka);
    return () => window.removeEventListener(eventName, synka);
  }, [storageKeyBase, eventName]);

  function spara(ny: EgnaJuridikMapparState) {
    setState(ny);
    sparaEgnaJuridikMappar(ny, storageKeyBase, eventName);
  }

  function toggleMapp(id: string) {
    setMappUi((p) => ({ ...p, [id]: { öppen: !p[id]?.öppen } }));
  }

  function skapaMapp() {
    const titel = skaparTitel.trim();
    if (!titel) return;
    const ny: EgenJuridikMapp = {
      id: skapaEgenMappId(),
      titel,
      beskrivning: skaparBeskrivning.trim(),
      skapadTidpunkt: new Date().toISOString(),
      dokument: [],
    };
    spara({ ...state, mappar: [...state.mappar, ny] });
    setMappUi((p) => ({ ...p, [ny.id]: { öppen: true } }));
    setSkaparTitel("");
    setSkaparBeskrivning("");
    setVisaSkapaForm(false);
  }

  function startaByttNamn(mapp: EgenJuridikMapp) {
    setByttNamnId(mapp.id);
    setByttNamnVarde(mapp.titel);
    setByttBeskrivningVarde(mapp.beskrivning);
  }

  function sparaByttNamn(id: string) {
    const titel = byttNamnVarde.trim();
    if (!titel) return;
    spara({
      ...state,
      mappar: state.mappar.map((m) =>
        m.id === id
          ? { ...m, titel, beskrivning: byttBeskrivningVarde.trim() }
          : m,
      ),
    });
    setByttNamnId(null);
  }

  function taBortMapp(id: string) {
    spara({ ...state, mappar: state.mappar.filter((m) => m.id !== id) });
    setBekraftaTaBortId(null);
  }

  function laggTillDokument(mappId: string, fil: File | null) {
    if (!fil) return;
    spara({
      ...state,
      mappar: state.mappar.map((m) =>
        m.id === mappId
          ? {
              ...m,
              dokument: [
                ...m.dokument,
                {
                  id: skapaEgetDokumentId(),
                  filnamn: fil.name,
                  uppladdad: new Date().toLocaleDateString("sv-SE"),
                },
              ],
            }
          : m,
      ),
    });
    setUppladningFor(null);
  }

  function taBortDokument(mappId: string, dokId: string) {
    spara({
      ...state,
      mappar: state.mappar.map((m) =>
        m.id === mappId
          ? { ...m, dokument: m.dokument.filter((d) => d.id !== dokId) }
          : m,
      ),
    });
  }

  if (!hydrated) return null;

  return (
    <div className="mt-4 space-y-3">
      {state.mappar.length === 0 && !visaSkapaForm && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
          {tomMeddelande}
        </p>
      )}

      <ul className="space-y-3">
        {state.mappar.map((mapp) =>
          byttNamnId === mapp.id ? (
            /* Redigeringsläge */
            <li
              key={mapp.id}
              className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-4"
            >
              <p className="mb-2 text-sm font-semibold text-foreground">
                Byt namn på mappen
              </p>
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Mappnamn
                  </label>
                  <input
                    type="text"
                    value={byttNamnVarde}
                    onChange={(e) => setByttNamnVarde(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sparaByttNamn(mapp.id);
                      if (e.key === "Escape") setByttNamnId(null);
                    }}
                    autoFocus
                    className={inputKlass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Beskrivning (valfri)
                  </label>
                  <input
                    type="text"
                    value={byttBeskrivningVarde}
                    onChange={(e) => setByttBeskrivningVarde(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sparaByttNamn(mapp.id);
                      if (e.key === "Escape") setByttNamnId(null);
                    }}
                    placeholder="Kort beskrivning av vad mappen innehåller…"
                    className={inputKlass}
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => sparaByttNamn(mapp.id)}
                  disabled={!byttNamnVarde.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
                >
                  Spara namn
                </button>
                <button
                  type="button"
                  onClick={() => setByttNamnId(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Avbryt
                </button>
              </div>
            </li>
          ) : (
            /* Visningsläge */
            <li
              key={mapp.id}
              className="rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="flex w-full items-start gap-3 px-4 py-4 sm:px-5">
                <button
                  type="button"
                  onClick={() => toggleMapp(mapp.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                  aria-expanded={mappUi[mapp.id]?.öppen ?? false}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-sm text-primary-dark"
                    aria-hidden
                  >
                    {mappUi[mapp.id]?.öppen ? "−" : "+"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-foreground">
                      {mapp.titel}
                    </span>
                    {mapp.beskrivning && (
                      <span className="mt-1 block text-sm text-muted">
                        {mapp.beskrivning}
                      </span>
                    )}
                    {mapp.dokument.length > 0 && (
                      <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                        {mapp.dokument.length} dokument
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex shrink-0 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => startaByttNamn(mapp)}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Byt namn
                  </button>
                  {bekraftaTaBortId === mapp.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => taBortMapp(mapp.id)}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Ta bort
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaTaBortId(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBekraftaTaBortId(mapp.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {(mappUi[mapp.id]?.öppen ?? false) && (
                <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                  {mapp.dokument.length > 0 ? (
                    <ul className="space-y-2">
                      {mapp.dokument.map((dok) => (
                        <li
                          key={dok.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {dok.filnamn}
                            </p>
                            <p className="text-xs text-muted">
                              Uppladdad {dok.uppladdad}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                            >
                              Öppna
                            </button>
                            <button
                              type="button"
                              onClick={() => taBortDokument(mapp.id, dok.id)}
                              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                            >
                              Ta bort
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
                      Inga dokument uppladdade i denna mapp ännu.
                    </p>
                  )}

                  <div className="mt-4">
                    {uppladdningFor === mapp.id ? (
                      <div className="rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4">
                        <p className="text-sm font-medium text-foreground">
                          Ladda upp dokument till {mapp.titel}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          PDF, Word eller annat dokument.
                        </p>
                        <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                          Välj fil
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="sr-only"
                            onChange={(e) =>
                              laggTillDokument(mapp.id, e.target.files?.[0] ?? null)
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setUppladningFor(null)}
                          className="ml-2 text-sm text-muted hover:text-foreground"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUppladningFor(mapp.id)}
                        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                      >
                        Ladda upp dokument
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ),
        )}
      </ul>

      {visaSkapaForm ? (
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Ny mapp</p>
          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Mappnamn
              </label>
              <input
                type="text"
                value={skaparTitel}
                onChange={(e) => setSkaparTitel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") skapaMapp();
                  if (e.key === "Escape") setVisaSkapaForm(false);
                }}
                autoFocus
                placeholder="t.ex. Hyresrätt, Avtal, Protokoll…"
                className={inputKlass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Beskrivning (valfri)
              </label>
              <input
                type="text"
                value={skaparBeskrivning}
                onChange={(e) => setSkaparBeskrivning(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") skapaMapp();
                  if (e.key === "Escape") setVisaSkapaForm(false);
                }}
                placeholder="Kort beskrivning av vad mappen innehåller…"
                className={inputKlass}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={skapaMapp}
              disabled={!skaparTitel.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
            >
              Skapa mapp
            </button>
            <button
              type="button"
              onClick={() => {
                setVisaSkapaForm(false);
                setSkaparTitel("");
                setSkaparBeskrivning("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setVisaSkapaForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Skapa ny mapp
        </button>
      )}
    </div>
  );
}
