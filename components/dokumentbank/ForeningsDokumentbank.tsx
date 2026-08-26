"use client";

import { useEffect, useRef, useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  FORENINGS_DOK_EVENT,
  lasForeningsDokument,
  laddaNedDokument,
  skapaForeningsDokumentId,
  sparaForeningsDokument,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  OMRADE_ETIKETTER,
  dokumentbankMallar,
  hamtaMall,
  type DokumentMallOmrade,
  type DokumentbankMall,
} from "@/components/dokumentbank/mallar";
import {
  DOKUMENTBANK_EGNA_EVENT,
  hamtaAllaUpphandlingsMallar,
  lasEgnaDokumentbankMallar,
  läggTillEgenDokumentbankMall,
  taBortEgenDokumentbankMall,
} from "@/components/dokumentbank/dokumentbank-lager";

// ── Hjälp ─────────────────────────────────────────────────────────────────────

const STATUS_FARGER: Record<DokumentStatus, string> = {
  utkast: "bg-amber-50 text-amber-800 border-amber-200",
  klar: "bg-[#eef6f0] text-primary-dark border-primary/30",
  arkiverad: "bg-border/20 text-muted border-border",
};

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Skapar-kopia-dialog ────────────────────────────────────────────────────────

interface SkapaKopiaFormProps {
  mall: DokumentbankMall;
  onSpara: (titel: string) => void;
  onAvbryt: () => void;
}

function SkapaKopiaForm({ mall, onSpara, onAvbryt }: SkapaKopiaFormProps) {
  const [titel, setTitel] = useState(mall.titel);

  return (
    <div className="mt-2 rounded-lg border border-primary/30 bg-[#f7fbf8] p-3">
      <p className="mb-2 text-xs font-medium text-muted">
        Namnge din kopia
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && titel.trim()) onSpara(titel);
            if (e.key === "Escape") onAvbryt();
          }}
          autoFocus
          className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => titel.trim() && onSpara(titel)}
          disabled={!titel.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Skapa kopia
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// ── Mina dokument ─────────────────────────────────────────────────────────────

interface MinaDokumentProps {
  dokument: ForeningsDokument[];
  onUppdatera: (id: string, patch: Partial<ForeningsDokument>) => void;
  onTaBort: (id: string) => void;
}

function MinaDokument({ dokument, onUppdatera, onTaBort }: MinaDokumentProps) {
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [bekraftaId, setBekraftaId] = useState<string | null>(null);

  if (dokument.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
        Inga dokument skapade ännu. Klicka "Skapa kopia" på en mall nedan.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {dokument.map((dok) => {
        const mall = hamtaMall(dok.mallId);
        const harInnehall = Boolean(mall?.textInnehall);

        return (
          <div
            key={dok.id}
            className="rounded-xl border border-border bg-white p-4 shadow-sm"
          >
            {redigerarId === dok.id ? (
              /* Redigera */
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Dokumentnamn
                  </label>
                  <input
                    type="text"
                    value={dok.titel}
                    onChange={(e) =>
                      onUppdatera(dok.id, { titel: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Status
                  </label>
                  <select
                    value={dok.status}
                    onChange={(e) =>
                      onUppdatera(dok.id, {
                        status: e.target.value as DokumentStatus,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    {(
                      Object.keys(
                        DOKUMENT_STATUS_ETIKETTER,
                      ) as DokumentStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {DOKUMENT_STATUS_ETIKETTER[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Notering
                  </label>
                  <input
                    type="text"
                    value={dok.notering}
                    onChange={(e) =>
                      onUppdatera(dok.id, { notering: e.target.value })
                    }
                    placeholder="Egna anteckningar…"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRedigerarId(null)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                >
                  Klar
                </button>
              </div>
            ) : (
              /* Visning */
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{dok.titel}</p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_FARGER[dok.status]}`}
                    >
                      {DOKUMENT_STATUS_ETIKETTER[dok.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    Baserad på: {dok.mallTitel} ·{" "}
                    {OMRADE_ETIKETTER[dok.omrade as DokumentMallOmrade] ??
                      dok.omrade}
                    {" · "}
                    Skapad {formatDatum(dok.skapadDatum)}
                  </p>
                  {dok.notering && (
                    <p className="mt-1 text-xs text-muted/80">{dok.notering}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {harInnehall && (
                    <button
                      type="button"
                      onClick={() => {
                        const innehall = mall?.textInnehall ?? "";
                        laddaNedDokument(dok.mallFilnamn, innehall);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3 w-3"
                        aria-hidden
                      >
                        <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                        <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                      </svg>
                      Ladda ned
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRedigerarId(dok.id)}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Redigera
                  </button>
                  {bekraftaId === dok.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onTaBort(dok.id);
                          setBekraftaId(null);
                        }}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Ta bort
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaId(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBekraftaId(dok.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mallkatalog ───────────────────────────────────────────────────────────────

interface MallKatalogProps {
  onSkapaKopia: (mall: DokumentbankMall, titel: string) => void;
}

function MallKatalog({ onSkapaKopia }: MallKatalogProps) {
  const [skaparKopiaFor, setSkaparKopiaFor] = useState<string | null>(null);
  const [filterOmrade, setFilterOmrade] = useState<string>("alla");
  const [egnaLaddadeMallar, setEgnaLaddadeMallar] = useState(
    lasEgnaDokumentbankMallar(),
  );

  useEffect(() => {
    const hantera = () =>
      setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
    window.addEventListener(DOKUMENTBANK_EGNA_EVENT, hantera);
    return () => window.removeEventListener(DOKUMENTBANK_EGNA_EVENT, hantera);
  }, []);

  function laddaUppEgen(fil: File | null) {
    if (!fil) return;
    läggTillEgenDokumentbankMall(fil.name);
    setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
  }

  const omraden = Object.keys(OMRADE_ETIKETTER) as DokumentMallOmrade[];

  const visadeMallar =
    filterOmrade === "alla"
      ? dokumentbankMallar
      : dokumentbankMallar.filter((m) => m.omrade === filterOmrade);

  const omradesGrupper = omraden.reduce<
    Partial<Record<DokumentMallOmrade, DokumentbankMall[]>>
  >((acc, omrade) => {
    const mallar = visadeMallar.filter((m) => m.omrade === omrade);
    if (mallar.length > 0) acc[omrade] = mallar;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterOmrade("alla")}
          className={`rounded-full border px-3 py-1 text-sm ${filterOmrade === "alla" ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
        >
          Alla
        </button>
        {omraden.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setFilterOmrade(o)}
            className={`rounded-full border px-3 py-1 text-sm ${filterOmrade === o ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
          >
            {OMRADE_ETIKETTER[o]}
          </button>
        ))}
      </div>

      {/* Mallar per område */}
      {(
        Object.entries(omradesGrupper) as [
          DokumentMallOmrade,
          DokumentbankMall[],
        ][]
      ).map(([omrade, mallar]) => (
        <div key={omrade}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {OMRADE_ETIKETTER[omrade]}
          </p>
          <div className="space-y-2">
            {mallar.map((mall) => (
              <div key={mall.id}>
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {mall.titel}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {mall.beskrivning}
                    </p>
                    {mall.textInnehall && (
                      <span className="mt-1 inline-block rounded-full bg-[#eef6f0] px-2 py-0.5 text-xs text-primary-dark">
                        Nedladdningsbar
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSkaparKopiaFor(
                        skaparKopiaFor === mall.id ? null : mall.id,
                      )
                    }
                    className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Skapa kopia
                  </button>
                </div>
                {skaparKopiaFor === mall.id && (
                  <SkapaKopiaForm
                    mall={mall}
                    onSpara={(titel) => {
                      onSkapaKopia(mall, titel);
                      setSkaparKopiaFor(null);
                    }}
                    onAvbryt={() => setSkaparKopiaFor(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Egna uppladdningar */}
      <div className="rounded-xl border border-dashed border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">
          Ladda upp egna mallar
        </p>
        <p className="mt-1 text-xs text-muted">
          Ladda upp era egna mallfiler till banken — syns bara för er förening.
        </p>
        <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]">
          Välj fil
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="sr-only"
            onChange={(e) => {
              laddaUppEgen(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        {egnaLaddadeMallar.length > 0 && (
          <ul className="mt-3 space-y-1">
            {egnaLaddadeMallar.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 text-xs text-muted"
              >
                <span>
                  {m.titel} · {m.uppladdad}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    taBortEgenDokumentbankMall(m.id);
                    setEgnaLaddadeMallar(lasEgnaDokumentbankMallar());
                  }}
                  className="text-muted hover:text-red-600"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function ForeningsDokumentbank() {
  const [hydrated, setHydrated] = useState(false);
  const [dokument, setDokument] = useState<ForeningsDokument[]>([]);
  const [aktivFlik, setAktivFlik] = useState<"mina" | "mallar">("mina");

  function laddaDokument() {
    setDokument(lasForeningsDokument().dokument);
  }

  useEffect(() => {
    laddaDokument();
    setHydrated(true);
    window.addEventListener(FORENINGS_DOK_EVENT, laddaDokument);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, laddaDokument);
  }, []);

  function skapaKopia(mall: DokumentbankMall, titel: string) {
    const nu = new Date().toISOString();
    const nyttDok: ForeningsDokument = {
      id: skapaForeningsDokumentId(),
      mallId: mall.id,
      mallTitel: mall.titel,
      mallFilnamn: mall.filnamn,
      titel: titel.trim() || mall.titel,
      status: "utkast",
      skapadDatum: nu,
      uppdateradDatum: nu,
      notering: "",
      omrade: mall.omrade,
    };
    const befintliga = lasForeningsDokument();
    sparaForeningsDokument({
      ...befintliga,
      dokument: [nyttDok, ...befintliga.dokument],
    });
    laddaDokument();
    setAktivFlik("mina");
  }

  function uppdateraDokument(id: string, patch: Partial<ForeningsDokument>) {
    const state = lasForeningsDokument();
    sparaForeningsDokument({
      ...state,
      dokument: state.dokument.map((d) =>
        d.id === id
          ? { ...d, ...patch, uppdateradDatum: new Date().toISOString() }
          : d,
      ),
    });
    laddaDokument();
  }

  function taBortDokument(id: string) {
    const state = lasForeningsDokument();
    sparaForeningsDokument({
      ...state,
      dokument: state.dokument.filter((d) => d.id !== id),
    });
    laddaDokument();
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-lg bg-border/40" />
        <div className="h-20 rounded-xl bg-border/40" />
        <div className="h-20 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flikar */}
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setAktivFlik("mina")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            aktivFlik === "mina"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Mina dokument
          {dokument.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#e2f0e6] px-1.5 py-0.5 text-xs font-semibold text-primary-dark">
              {dokument.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setAktivFlik("mallar")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            aktivFlik === "mallar"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Mallkatalog
          <span className="ml-1.5 rounded-full bg-border/40 px-1.5 py-0.5 text-xs text-muted">
            {dokumentbankMallar.length}
          </span>
        </button>
      </div>

      {aktivFlik === "mina" ? (
        <MinaDokument
          dokument={dokument}
          onUppdatera={uppdateraDokument}
          onTaBort={taBortDokument}
        />
      ) : (
        <MallKatalog onSkapaKopia={skapaKopia} />
      )}
    </div>
  );
}
