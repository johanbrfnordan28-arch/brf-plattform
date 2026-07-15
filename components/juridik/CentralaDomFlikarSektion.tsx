"use client";

import { useEffect, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import {
  CENTRALA_DOMFLIKAR_EVENT,
  lasCentralaDomFlikar,
  skapaCentralFlikId,
  skapaCentraltDokumentId,
  sparaCentralaDomFlikar,
  type CentralDomFlik,
  type CentralaDomFlikarState,
} from "@/components/juridik/juridik-centrala-flikar-lager";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type CentralaDomFlikarSektionProps = {
  readOnly?: boolean;
};

export function CentralaDomFlikarSektion({
  readOnly = false,
}: CentralaDomFlikarSektionProps) {
  const [state, setState] = useState<CentralaDomFlikarState>({ version: 1, flikar: [] });
  const [flikUi, setFlikUi] = useState<Record<string, { öppen: boolean }>>({});
  const [uppladdningFor, setUppladningFor] = useState<string | null>(null);
  const [visaSkapaForm, setVisaSkapaForm] = useState(false);
  const [skaparTitel, setSkaparTitel] = useState("");
  const [skaparBeskrivning, setSkaparBeskrivning] = useState("");
  const [skaparVagledning, setSkaparVagledning] = useState("");
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [redigerarTitel, setRedigerarTitel] = useState("");
  const [redigerarBeskrivning, setRedigerarBeskrivning] = useState("");
  const [redigerarVagledning, setRedigerarVagledning] = useState("");
  const [bekraftaTaBortId, setBekraftaTaBortId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function ladda() {
      const laddad = lasCentralaDomFlikar();
      setState(laddad);
      setFlikUi((prev) => {
        const next = { ...prev };
        for (const f of laddad.flikar) {
          if (!(f.id in next)) next[f.id] = { öppen: false };
        }
        return next;
      });
    }
    ladda();
    setHydrated(true);
    window.addEventListener(CENTRALA_DOMFLIKAR_EVENT, ladda);
    return () => window.removeEventListener(CENTRALA_DOMFLIKAR_EVENT, ladda);
  }, []);

  function spara(ny: CentralaDomFlikarState) {
    setState(ny);
    sparaCentralaDomFlikar(ny);
  }

  function toggleFlik(id: string) {
    setFlikUi((p) => ({ ...p, [id]: { öppen: !p[id]?.öppen } }));
  }

  function skapaFlik() {
    const titel = skaparTitel.trim();
    if (!titel) return;
    const ny: CentralDomFlik = {
      id: skapaCentralFlikId(),
      titel,
      beskrivning: skaparBeskrivning.trim(),
      vägledning: skaparVagledning.trim(),
      skapadTidpunkt: new Date().toISOString(),
      dokument: [],
    };
    spara({ ...state, flikar: [...state.flikar, ny] });
    setFlikUi((p) => ({ ...p, [ny.id]: { öppen: true } }));
    setSkaparTitel("");
    setSkaparBeskrivning("");
    setSkaparVagledning("");
    setVisaSkapaForm(false);
  }

  function startaRedigera(flik: CentralDomFlik) {
    setRedigerarId(flik.id);
    setRedigerarTitel(flik.titel);
    setRedigerarBeskrivning(flik.beskrivning);
    setRedigerarVagledning(flik.vägledning);
  }

  function sparaRedigera(id: string) {
    const titel = redigerarTitel.trim();
    if (!titel) return;
    spara({
      ...state,
      flikar: state.flikar.map((f) =>
        f.id === id
          ? {
              ...f,
              titel,
              beskrivning: redigerarBeskrivning.trim(),
              vägledning: redigerarVagledning.trim(),
            }
          : f,
      ),
    });
    setRedigerarId(null);
  }

  function taBortFlik(id: string) {
    spara({ ...state, flikar: state.flikar.filter((f) => f.id !== id) });
    setBekraftaTaBortId(null);
  }

  function laggTillDokument(flikId: string, fil: File | null) {
    if (!fil) return;
    spara({
      ...state,
      flikar: state.flikar.map((f) =>
        f.id === flikId
          ? {
              ...f,
              dokument: [
                ...f.dokument,
                {
                  id: skapaCentraltDokumentId(),
                  filnamn: fil.name,
                  uppladdad: new Date().toLocaleDateString("sv-SE"),
                },
              ],
            }
          : f,
      ),
    });
    setUppladningFor(null);
  }

  function taBortDokument(flikId: string, dokId: string) {
    spara({
      ...state,
      flikar: state.flikar.map((f) =>
        f.id === flikId
          ? { ...f, dokument: f.dokument.filter((d) => d.id !== dokId) }
          : f,
      ),
    });
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-3">
      {state.flikar.length === 0 && readOnly && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
          Domflikar publiceras här när de lagts till i grundmodulen.
        </p>
      )}

      <ul className="space-y-3">
        {state.flikar.map((flik) =>
          redigerarId === flik.id && !readOnly ? (
            <li
              key={flik.id}
              className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-4"
            >
              <p className="mb-2 text-sm font-semibold text-foreground">Redigera flik</p>
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Fliknamn
                  </label>
                  <input
                    type="text"
                    value={redigerarTitel}
                    onChange={(e) => setRedigerarTitel(e.target.value)}
                    className={inputKlass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Kort beskrivning
                  </label>
                  <input
                    type="text"
                    value={redigerarBeskrivning}
                    onChange={(e) => setRedigerarBeskrivning(e.target.value)}
                    className={inputKlass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Vägledningstext
                  </label>
                  <textarea
                    value={redigerarVagledning}
                    onChange={(e) => setRedigerarVagledning(e.target.value)}
                    rows={3}
                    className={inputKlass}
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => sparaRedigera(flik.id)}
                  disabled={!redigerarTitel.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
                >
                  Spara flik
                </button>
                <button
                  type="button"
                  onClick={() => setRedigerarId(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  Avbryt
                </button>
              </div>
            </li>
          ) : (
            <li
              key={flik.id}
              className="rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="flex w-full items-start gap-3 px-4 py-4 sm:px-5">
                <button
                  type="button"
                  onClick={() => toggleFlik(flik.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                  aria-expanded={flikUi[flik.id]?.öppen ?? false}
                >
                  <OppnaStangIkon oppen={flikUi[flik.id]?.öppen ?? false} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-foreground">
                      {flik.titel}
                    </span>
                    {flik.beskrivning && (
                      <span className="mt-1 block text-sm text-muted">{flik.beskrivning}</span>
                    )}
                    {flik.dokument.length > 0 && (
                      <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                        {flik.dokument.length}{" "}
                        {flik.dokument.length === 1 ? "dokument" : "dokument"}
                      </span>
                    )}
                  </span>
                </button>
                {!readOnly && (
                  <div className="flex shrink-0 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => startaRedigera(flik)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                    >
                      Redigera
                    </button>
                    {bekraftaTaBortId === flik.id ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => taBortFlik(flik.id)}
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
                        onClick={() => setBekraftaTaBortId(flik.id)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>

              {(flikUi[flik.id]?.öppen ?? false) && (
                <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                  {flik.vägledning && (
                    <>
                      <p className="text-sm leading-relaxed text-foreground">{flik.vägledning}</p>
                      <p className="mt-2 text-xs text-muted">
                        Central vägledning — använd som underlag inför styrelsebeslut och möten,
                        inte som färdigt beslut.
                      </p>
                    </>
                  )}

                  {flik.dokument.length > 0 ? (
                    <ul className={`space-y-2 ${flik.vägledning ? "mt-4" : ""}`}>
                      {flik.dokument.map((dok) => (
                        <li
                          key={dok.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{dok.filnamn}</p>
                            <p className="text-xs text-muted">Uppladdad {dok.uppladdad}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                              title="Demo: öppna dokument"
                            >
                              Läs dom
                            </button>
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => taBortDokument(flik.id, dok.id)}
                                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                              >
                                Ta bort
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
                      Inga dokument uppladdade i denna flik ännu.
                    </p>
                  )}

                  {!readOnly && (
                    <div className="mt-4">
                      {uppladdningFor === flik.id ? (
                        <div className="rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4">
                          <p className="text-sm font-medium text-foreground">
                            Ladda upp dom till {flik.titel}
                          </p>
                          <p className="mt-1 text-xs text-muted">PDF, Word eller annat dokument.</p>
                          <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                            Välj fil
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              className="sr-only"
                              onChange={(e) =>
                                laggTillDokument(flik.id, e.target.files?.[0] ?? null)
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
                          onClick={() => setUppladningFor(flik.id)}
                          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                        >
                          Ladda upp dokument
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ),
        )}
      </ul>

      {!readOnly &&
        (visaSkapaForm ? (
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Ny flik</p>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Fliknamn</label>
                <input
                  type="text"
                  value={skaparTitel}
                  onChange={(e) => setSkaparTitel(e.target.value)}
                  autoFocus
                  placeholder="t.ex. Medlemmens ansvar för ytskikt…"
                  className={inputKlass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Kort beskrivning (valfri)
                </label>
                <input
                  type="text"
                  value={skaparBeskrivning}
                  onChange={(e) => setSkaparBeskrivning(e.target.value)}
                  placeholder="En rad som syns i listan…"
                  className={inputKlass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Vägledningstext (valfri)
                </label>
                <textarea
                  value={skaparVagledning}
                  onChange={(e) => setSkaparVagledning(e.target.value)}
                  rows={3}
                  placeholder="Längre vägledning som visas när fliken öppnas…"
                  className={inputKlass}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={skapaFlik}
                disabled={!skaparTitel.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
              >
                Skapa flik
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisaSkapaForm(false);
                  setSkaparTitel("");
                  setSkaparBeskrivning("");
                  setSkaparVagledning("");
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
            Lägg till flik
          </button>
        ))}
    </div>
  );
}
