"use client";

import { useEffect, useRef, useState } from "react";
import {
  domMappar,
  skapaDokumentId,
  type DomMappDefinition,
} from "@/components/juridik/domar";
import {
  juridikDelatBibliotekNotis,
  juridikFriskrivningKort,
  juridikKostnadTvister,
  juridikStyrelseAnsvar,
} from "@/components/juridik/juridik-innehall";
import {
  JURIDIK_BIBLIOTEK_EVENT,
  lasJuridikBibliotek,
  skapaJuridikId,
  skapaTomtJuridikBibliotek,
  sparaJuridikBibliotek,
  tipsKategoriEtikett,
  type JuridikBibliotekState,
  type JuridikTipsKategori,
  type JuridikTipsRad,
  type JuridikUppladdatDokument,
} from "@/components/juridik/juridik-lager";
import {
  EGNA_MAPPAR_EVENT,
  lasEgnaJuridikMappar,
  skapaEgetDokumentId,
  skapaEgenMappId,
  sparaEgnaJuridikMappar,
  type EgenJuridikMapp,
  type EgnaJuridikMapparState,
} from "@/components/juridik/juridik-egna-mappar-lager";

export function JuridikModul() {
  const [bibliotek, setBibliotek] = useState<JuridikBibliotekState>(
    skapaTomtJuridikBibliotek(),
  );
  const [mappUi, setMappUi] = useState<Record<string, { öppen: boolean }>>({});
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(
    null,
  );
  const [visarTipsForm, setVisarTipsForm] = useState(false);
  const [tipsTitel, setTipsTitel] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [tipsKategori, setTipsKategori] =
    useState<JuridikTipsKategori>("allmant");

  // ── Egna mappar (per-förening) ──────────────────────────────────────────
  const [egnaMappar, setEgnaMappar] = useState<EgnaJuridikMapparState>({
    version: 1,
    mappar: [],
  });
  const [egenMappUi, setEgenMappUi] = useState<
    Record<string, { öppen: boolean }>
  >({});
  const [egenMappUppladdning, setEgenMappUppladdning] = useState<string | null>(null);
  const [visaSkapaMappForm, setVisaSkapaMappForm] = useState(false);
  const [skaparMappTitel, setSkaparMappTitel] = useState("");
  const [skaparMappBeskrivning, setSkaparMappBeskrivning] = useState("");
  const [byttNamnMappId, setByttNamnMappId] = useState<string | null>(null);
  const [byttNamnVarde, setByttNamnVarde] = useState("");
  const [byttBeskrivningVarde, setByttBeskrivningVarde] = useState("");
  const [bekraftaTaBortMappId, setBekraftaTaBortMappId] = useState<string | null>(null);

  useEffect(() => {
    setBibliotek(lasJuridikBibliotek());
    setMappUi(
      Object.fromEntries(domMappar.map((m) => [m.id, { öppen: false }])),
    );
    const laddade = lasEgnaJuridikMappar();
    setEgnaMappar(laddade);
    setEgenMappUi(
      Object.fromEntries(laddade.mappar.map((m) => [m.id, { öppen: false }])),
    );
    skipFirstSave.current = true;
    setHydrated(true);

    function synka() {
      setBibliotek(lasJuridikBibliotek());
      skipFirstSave.current = true;
    }
    function synkaEgna() {
      const ny = lasEgnaJuridikMappar();
      setEgnaMappar(ny);
      setEgenMappUi((prev) => {
        const next = { ...prev };
        for (const m of ny.mappar) {
          if (!(m.id in next)) next[m.id] = { öppen: false };
        }
        return next;
      });
    }
    window.addEventListener(JURIDIK_BIBLIOTEK_EVENT, synka);
    window.addEventListener(EGNA_MAPPAR_EVENT, synkaEgna);
    return () => {
      window.removeEventListener(JURIDIK_BIBLIOTEK_EVENT, synka);
      window.removeEventListener(EGNA_MAPPAR_EVENT, synkaEgna);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaJuridikBibliotek(bibliotek);
  }, [bibliotek, hydrated]);

  // ── Egna mappar — hanterare ───────────────────────────────────────────────

  function sparaEgna(ny: EgnaJuridikMapparState) {
    setEgnaMappar(ny);
    sparaEgnaJuridikMappar(ny);
  }

  function toggleEgenMapp(id: string) {
    setEgenMappUi((prev) => ({
      ...prev,
      [id]: { öppen: !prev[id]?.öppen },
    }));
  }

  function skapaNyMapp() {
    const titel = skaparMappTitel.trim();
    if (!titel) return;
    const ny: EgenJuridikMapp = {
      id: skapaEgenMappId(),
      titel,
      beskrivning: skaparMappBeskrivning.trim(),
      skapadTidpunkt: new Date().toISOString(),
      dokument: [],
    };
    const nyState: EgnaJuridikMapparState = {
      ...egnaMappar,
      mappar: [...egnaMappar.mappar, ny],
    };
    sparaEgna(nyState);
    setEgenMappUi((prev) => ({ ...prev, [ny.id]: { öppen: true } }));
    setSkaparMappTitel("");
    setSkaparMappBeskrivning("");
    setVisaSkapaMappForm(false);
  }

  function startaByttNamn(mapp: EgenJuridikMapp) {
    setByttNamnMappId(mapp.id);
    setByttNamnVarde(mapp.titel);
    setByttBeskrivningVarde(mapp.beskrivning);
  }

  function sparaByttNamn(id: string) {
    const titel = byttNamnVarde.trim();
    if (!titel) return;
    sparaEgna({
      ...egnaMappar,
      mappar: egnaMappar.mappar.map((m) =>
        m.id === id
          ? { ...m, titel, beskrivning: byttBeskrivningVarde.trim() }
          : m,
      ),
    });
    setByttNamnMappId(null);
  }

  function taBortEgenMapp(id: string) {
    sparaEgna({
      ...egnaMappar,
      mappar: egnaMappar.mappar.filter((m) => m.id !== id),
    });
    setBekraftaTaBortMappId(null);
  }

  function laggTillEgetDokument(mappId: string, fil: File | null) {
    if (!fil) return;
    const dok = {
      id: skapaEgetDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    sparaEgna({
      ...egnaMappar,
      mappar: egnaMappar.mappar.map((m) =>
        m.id === mappId ? { ...m, dokument: [...m.dokument, dok] } : m,
      ),
    });
    setEgenMappUppladdning(null);
  }

  function taBortEgetDokument(mappId: string, dokId: string) {
    sparaEgna({
      ...egnaMappar,
      mappar: egnaMappar.mappar.map((m) =>
        m.id === mappId
          ? { ...m, dokument: m.dokument.filter((d) => d.id !== dokId) }
          : m,
      ),
    });
  }

  function toggleMapp(id: string) {
    setMappUi((current) => ({
      ...current,
      [id]: { öppen: !current[id]?.öppen },
    }));
  }

  function läggTillDom(mappId: string, fil: File | null) {
    if (!fil) return;
    const dokument: JuridikUppladdatDokument = {
      id: skapaDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setBibliotek((current) => ({
      ...current,
      mappar: {
        ...current.mappar,
        [mappId]: {
          dokument: [...(current.mappar[mappId]?.dokument ?? []), dokument],
        },
      },
    }));
    setPågåendeUppladdning(null);
  }

  function taBortDom(mappId: string, dokumentId: string) {
    setBibliotek((current) => ({
      ...current,
      mappar: {
        ...current.mappar,
        [mappId]: {
          dokument: (current.mappar[mappId]?.dokument ?? []).filter(
            (doc) => doc.id !== dokumentId,
          ),
        },
      },
    }));
  }

  function läggTillTips(fil?: File | null) {
    const titel = tipsTitel.trim();
    const text = tipsText.trim();
    if (!titel || !text) return;
    const tips: JuridikTipsRad = {
      id: skapaJuridikId("tips"),
      titel,
      text,
      kategori: tipsKategori,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
      filnamn: fil?.name,
    };
    setBibliotek((current) => ({
      ...current,
      tips: [tips, ...current.tips],
    }));
    setTipsTitel("");
    setTipsText("");
    setTipsKategori("allmant");
    setVisarTipsForm(false);
  }

  function taBortTips(id: string) {
    setBibliotek((current) => ({
      ...current,
      tips: current.tips.filter((t) => t.id !== id),
    }));
  }

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar juridikbibliotek…</p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border-2 border-primary/35 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Viktigt att veta
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          {juridikStyrelseAnsvar.rubrik}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.ingress}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          {juridikStyrelseAnsvar.punkter.map((punkt) => (
            <li key={punkt}>{punkt}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg border border-primary/25 bg-white/70 px-4 py-3 text-sm text-muted">
          {juridikFriskrivningKort}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {juridikKostnadTvister.rubrik}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {juridikKostnadTvister.ingress}
        </p>
        <ul className="mt-4 space-y-3">
          {juridikKostnadTvister.råd.map((rad) => (
            <li
              key={rad.titel}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <p className="font-medium text-foreground">{rad.titel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {rad.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Domar och avgöranden
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vägledande domar samlade per ämne. Öppna en mapp, läs vägledningen och
          ladda upp aktuella domar som kan hjälpa styrelser i liknande ärenden.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {juridikDelatBibliotekNotis}
        </p>

        <ul className="mt-4 space-y-3">
          {domMappar.map((mapp) => (
            <DomMappRad
              key={mapp.id}
              mapp={mapp}
              dokument={bibliotek.mappar[mapp.id]?.dokument ?? []}
              öppen={mappUi[mapp.id]?.öppen ?? false}
              visarUppladdning={pågåendeUppladdning === mapp.id}
              onToggle={() => toggleMapp(mapp.id)}
              onVisaUppladdning={() => setPågåendeUppladdning(mapp.id)}
              onUpload={(fil) => läggTillDom(mapp.id, fil)}
              onTaBort={(dokumentId) => taBortDom(mapp.id, dokumentId)}
            />
          ))}
        </ul>
      </section>

      {/* Egna mappar */}
      <section className="border-t border-border pt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Egna mappar</h2>
            <p className="mt-1 text-sm text-muted">
              Skapa egna mappar för föreningens dokument, beslut och korrespondens.
              Mapparna namnger ni själva och är enbart synliga för er förening.
            </p>
          </div>
        </div>

        {egnaMappar.mappar.length === 0 && !visaSkapaMappForm && (
          <p className="mb-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
            Inga egna mappar skapade ännu.
          </p>
        )}

        <ul className="space-y-3">
          {egnaMappar.mappar.map((mapp) =>
            byttNamnMappId === mapp.id ? (
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
                        if (e.key === "Escape") setByttNamnMappId(null);
                      }}
                      autoFocus
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        if (e.key === "Escape") setByttNamnMappId(null);
                      }}
                      placeholder="Kort beskrivning av vad mappen innehåller…"
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    onClick={() => setByttNamnMappId(null)}
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
                    onClick={() => toggleEgenMapp(mapp.id)}
                    className="flex flex-1 items-start gap-3 text-left"
                    aria-expanded={egenMappUi[mapp.id]?.öppen ?? false}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-sm text-primary-dark"
                      aria-hidden
                    >
                      {egenMappUi[mapp.id]?.öppen ? "−" : "+"}
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
                          {mapp.dokument.length}{" "}
                          {mapp.dokument.length === 1
                            ? "dokument"
                            : "dokument"}
                        </span>
                      )}
                    </span>
                  </button>
                  {/* Åtgärder */}
                  <div className="flex shrink-0 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => startaByttNamn(mapp)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                      title="Byt namn"
                    >
                      Byt namn
                    </button>
                    {bekraftaTaBortMappId === mapp.id ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => taBortEgenMapp(mapp.id)}
                          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Ta bort
                        </button>
                        <button
                          type="button"
                          onClick={() => setBekraftaTaBortMappId(null)}
                          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBekraftaTaBortMappId(mapp.id)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                        title="Ta bort mapp"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {(egenMappUi[mapp.id]?.öppen ?? false) && (
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
                                title="Demo: öppna dokument"
                              >
                                Öppna
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  taBortEgetDokument(mapp.id, dok.id)
                                }
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
                      {egenMappUppladdning === mapp.id ? (
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
                                laggTillEgetDokument(
                                  mapp.id,
                                  e.target.files?.[0] ?? null,
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setEgenMappUppladdning(null)}
                            className="ml-2 text-sm text-muted hover:text-foreground"
                          >
                            Avbryt
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEgenMappUppladdning(mapp.id)}
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

        {/* Skapa ny mapp */}
        {visaSkapaMappForm ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Ny mapp
            </p>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Mappnamn
                </label>
                <input
                  type="text"
                  value={skaparMappTitel}
                  onChange={(e) => setSkaparMappTitel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") skapaNyMapp();
                    if (e.key === "Escape") setVisaSkapaMappForm(false);
                  }}
                  autoFocus
                  placeholder="t.ex. Avtal, Protokoll, Korrespondens…"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Beskrivning (valfri)
                </label>
                <input
                  type="text"
                  value={skaparMappBeskrivning}
                  onChange={(e) => setSkaparMappBeskrivning(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") skapaNyMapp();
                    if (e.key === "Escape") setVisaSkapaMappForm(false);
                  }}
                  placeholder="Kort beskrivning av vad mappen innehåller…"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={skapaNyMapp}
                disabled={!skaparMappTitel.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
              >
                Skapa mapp
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisaSkapaMappForm(false);
                  setSkaparMappTitel("");
                  setSkaparMappBeskrivning("");
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
            onClick={() => setVisaSkapaMappForm(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
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
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">Tips och råd</h2>
        <p className="mt-2 text-sm text-muted">
          Korta råd inför möten med medlemmar, inför kontakt med juridiskt ombud
          eller för att undvika onödiga kostnader. Ladda upp nya råd som kan
          hjälpa andra styrelser — materialet delas i hela plattformen.
        </p>

        {bibliotek.tips.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {bibliotek.tips.map((tips) => (
              <li
                key={tips.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {tipsKategoriEtikett(tips.kategori)}
                  </span>
                  <button
                    type="button"
                    onClick={() => taBortTips(tips.id)}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Ta bort
                  </button>
                </div>
                <p className="mt-2 font-semibold text-foreground">{tips.titel}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {tips.text}
                </p>
                {tips.filnamn && (
                  <p className="mt-2 text-xs text-muted">
                    Bilaga: {tips.filnamn} · {tips.uppladdad}
                  </p>
                )}
                {!tips.filnamn && (
                  <p className="mt-2 text-xs text-muted">
                    Tillagt {tips.uppladdad}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
            Inga uppladdade tips ännu. Lägg till det första rådet nedan.
          </p>
        )}

        <div className="mt-5">
          {!visarTipsForm ? (
            <button
              type="button"
              onClick={() => setVisarTipsForm(true)}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Lägg till tips eller råd
            </button>
          ) : (
            <div className="rounded-xl border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">
                Nytt tips till biblioteket
              </p>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Rubrik</span>
                <input
                  value={tipsTitel}
                  onChange={(e) => setTipsTitel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Ex. Förbered protokoll innan juristmöte"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Kategori</span>
                <select
                  value={tipsKategori}
                  onChange={(e) =>
                    setTipsKategori(e.target.value as JuridikTipsKategori)
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="allmant">Allmänt råd</option>
                  <option value="mote-medlem">Inför möte med medlem</option>
                  <option value="juridiskt-ombud">Inför juridiskt ombud</option>
                  <option value="kostnadstvist">Minska kostnader vid tvist</option>
                </select>
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-xs font-medium text-muted">Text</span>
                <textarea
                  value={tipsText}
                  onChange={(e) => setTipsText(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Kort och konkret råd som andra styrelser kan använda som underlag."
                />
              </label>
              <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50">
                Välj bilaga (valfritt)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    const fil = e.target.files?.[0];
                    if (fil && tipsTitel.trim() && tipsText.trim()) {
                      läggTillTips(fil);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => läggTillTips()}
                  disabled={!tipsTitel.trim() || !tipsText.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Spara tips
                </button>
                <button
                  type="button"
                  onClick={() => setVisarTipsForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type DomMappRadProps = {
  mapp: DomMappDefinition;
  dokument: JuridikUppladdatDokument[];
  öppen: boolean;
  visarUppladdning: boolean;
  onToggle: () => void;
  onVisaUppladdning: () => void;
  onUpload: (fil: File | null) => void;
  onTaBort: (dokumentId: string) => void;
};

function DomMappRad({
  mapp,
  dokument,
  öppen,
  visarUppladdning,
  onToggle,
  onVisaUppladdning,
  onUpload,
  onTaBort,
}: DomMappRadProps) {
  return (
    <li className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={öppen}
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-sm text-primary-dark"
          aria-hidden
        >
          {öppen ? "−" : "+"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground">
            {mapp.titel}
          </span>
          <span className="mt-1 block text-sm text-muted">{mapp.beskrivning}</span>
          {dokument.length > 0 && (
            <span className="mt-2 inline-block rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {dokument.length}{" "}
              {dokument.length === 1 ? "dom uppladdad" : "domar uppladdade"}
            </span>
          )}
        </span>
      </button>

      {öppen && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-foreground">{mapp.vägledning}</p>
          <p className="mt-2 text-xs text-muted">
            Använd som underlag inför styrelsebeslut och möten — inte som färdigt
            beslut.
          </p>

          {dokument.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dokument.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.filnamn}</p>
                    <p className="text-xs text-muted">Uppladdad {doc.uppladdad}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                      title="Demo: öppna uppladdad dom"
                    >
                      Läs dom
                    </button>
                    <button
                      type="button"
                      onClick={() => onTaBort(doc.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                    >
                      Ta bort
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted">
              Inga domar uppladdade ännu i denna mapp.
            </p>
          )}

          <div className="mt-4">
            {!visarUppladdning ? (
              <button
                type="button"
                onClick={onVisaUppladdning}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                Ladda upp vägledande dom
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  Ladda upp dom till gemensamt bibliotek
                </p>
                <p className="mt-1 text-xs text-muted">
                  PDF eller annat dokument — syns för alla föreninger (demo).
                </p>
                <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                  Välj fil
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
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
