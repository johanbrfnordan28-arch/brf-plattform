"use client";

import { useCallback, useEffect, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import {
  ARENDE_STATUS_ETIKETTER,
  ARENDE_STATUS_FARGER,
  ENERGIKLASSER,
  FORENKLAD_EVENT,
  lasForenkladUpphandling,
  ovkIntervallAr,
  radonKraverAtgard,
  skapaEgetArendeId,
  sparaForenkladUpphandling,
  tomEnergiDeklaration,
  tomOvk,
  tomRadonMatning,
  type ArendeStatus,
  type EgetArende,
  type EnergiDeklarationData,
  type ForenkladUpphandlingState,
  type OvkData,
  type RadonMatningData,
} from "@/components/upphandling/forenklad-upphandling-lager";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelKlass = "block text-xs font-medium text-muted mb-1";

function StatusBadge({ status }: { status: ArendeStatus }) {
  const f = ARENDE_STATUS_FARGER[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${f.bg} ${f.text} ${f.border}`}
    >
      {ARENDE_STATUS_ETIKETTER[status]}
    </span>
  );
}

// ── Gemensamma fält (lägg till i alla ärenden) ────────────────────────────────

interface GemensammaFaltProps {
  status: ArendeStatus;
  leverantor: string;
  offertKr: string;
  bestallningsDatum: string;
  utfortDatum: string;
  notering: string;
  onChange: (key: string, value: string) => void;
}

function GemensammaFalt({
  status,
  leverantor,
  offertKr,
  bestallningsDatum,
  utfortDatum,
  notering,
  onChange,
}: GemensammaFaltProps) {
  return (
    <>
      <div>
        <label className={labelKlass}>Status</label>
        <select
          value={status}
          onChange={(e) => onChange("status", e.target.value)}
          className={inputKlass}
        >
          {(
            Object.keys(ARENDE_STATUS_ETIKETTER) as ArendeStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {ARENDE_STATUS_ETIKETTER[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelKlass}>Leverantör</label>
        <input
          type="text"
          value={leverantor}
          onChange={(e) => onChange("leverantor", e.target.value)}
          placeholder="Företagsnamn"
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Offert / pris (kr)</label>
        <input
          type="number"
          min="0"
          value={offertKr}
          onChange={(e) => onChange("offertKr", e.target.value)}
          placeholder="t.ex. 8500"
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Beställningsdatum</label>
        <input
          type="date"
          value={bestallningsDatum}
          onChange={(e) => onChange("bestallningsDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Utfört datum</label>
        <input
          type="date"
          value={utfortDatum}
          onChange={(e) => onChange("utfortDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelKlass}>Notering</label>
        <input
          type="text"
          value={notering}
          onChange={(e) => onChange("notering", e.target.value)}
          placeholder="Övriga anteckningar…"
          className={inputKlass}
        />
      </div>
    </>
  );
}

// ── ArendeKort (expanderbar) ──────────────────────────────────────────────────

interface ArendeKortProps {
  ikon: string;
  rubrik: string;
  beskrivning: string;
  status: ArendeStatus;
  sammanfattning?: string;
  children: React.ReactNode;
  onTaBort?: () => void;
}

function ArendeKort({
  ikon,
  rubrik,
  beskrivning,
  status,
  sammanfattning,
  children,
  onTaBort,
}: ArendeKortProps) {
  const [öppen, setÖppen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        onClick={() => setÖppen((v) => !v)}
        aria-expanded={öppen}
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-lg"
          aria-hidden
        >
          {ikon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              {rubrik}
            </span>
            <StatusBadge status={status} />
          </span>
          <span className="mt-0.5 block text-sm text-muted">{beskrivning}</span>
          {sammanfattning && (
            <span className="mt-1 block text-xs text-foreground/70">
              {sammanfattning}
            </span>
          )}
        </span>
        <OppnaStangIkon oppen={öppen} className="mt-1" />
      </button>

      {öppen && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">{children}</div>
          {onTaBort && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <button
                type="button"
                onClick={onTaBort}
                className="text-xs text-muted underline hover:text-red-600"
              >
                Ta bort ärende
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── OVK ──────────────────────────────────────────────────────────────────────

interface OvkKortProps {
  data: OvkData;
  ventilationssystem: string;
  onChange: (patch: Partial<OvkData>) => void;
}

function OvkKort({ data, ventilationssystem, onChange }: OvkKortProps) {
  const intervall = ovkIntervallAr(ventilationssystem);
  const v = ventilationssystem.trim();
  const sammanfattning = [
    v ? `Ventilation: ${v}` : null,
    `OVK-intervall: ${intervall} år (Boverkets föreskrifter)`,
    data.nastaDatum ? `Nästa OVK: ${data.nastaDatum}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function set(key: string, value: string) {
    onChange({ [key]: value } as Partial<OvkData>);
  }

  return (
    <ArendeKort
      ikon="🌬️"
      rubrik="Obligatorisk Ventilationskontroll (OVK)"
      beskrivning="Lagstadgad kontroll av ventilationssystemet — ska genomföras regelbundet."
      status={data.status}
      sammanfattning={sammanfattning}
    >
      <div>
        <label className={labelKlass}>Nästa OVK-datum</label>
        <input
          type="date"
          value={data.nastaDatum}
          onChange={(e) => set("nastaDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Senast godkänd (datum)</label>
        <input
          type="date"
          value={data.senastGodkantDatum}
          onChange={(e) => set("senastGodkantDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Besiktningsföretag</label>
        <input
          type="text"
          value={data.besiktningsforetag}
          onChange={(e) => set("besiktningsforetag", e.target.value)}
          placeholder="Certifierat OVK-företag"
          className={inputKlass}
        />
      </div>
      <GemensammaFalt
        status={data.status}
        leverantor={data.leverantor}
        offertKr={data.offertKr}
        bestallningsDatum={data.bestallningsDatum}
        utfortDatum={data.utfortDatum}
        notering={data.notering}
        onChange={set}
      />
      <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted">
        OVK-intervall varierar beroende på ventilationssystem:{" "}
        <strong>FT / FTX = 3 år</strong>, <strong>F / S / självdrag = 6 år</strong>{" "}
        (Boverkets föreskrifter BFS 2011:16, OVK).
      </div>
    </ArendeKort>
  );
}

// ── Energideklaration ─────────────────────────────────────────────────────────

interface EnergiKortProps {
  data: EnergiDeklarationData;
  onChange: (patch: Partial<EnergiDeklarationData>) => void;
}

function EnergiKort({ data, onChange }: EnergiKortProps) {
  const sammanfattning = [
    data.energiklass ? `Energiklass ${data.energiklass}` : null,
    data.giltigTom ? `Giltig t.o.m. ${data.giltigTom}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function set(key: string, value: string) {
    onChange({ [key]: value } as Partial<EnergiDeklarationData>);
  }

  return (
    <ArendeKort
      ikon="⚡"
      rubrik="Energideklaration"
      beskrivning="Obligatorisk deklaration av byggnadens energiprestanda — registreras hos Boverket."
      status={data.status}
      sammanfattning={sammanfattning}
    >
      <div>
        <label className={labelKlass}>Energiklass</label>
        <select
          value={data.energiklass}
          onChange={(e) => set("energiklass", e.target.value)}
          className={inputKlass}
        >
          <option value="">Välj…</option>
          {ENERGIKLASSER.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelKlass}>Giltig t.o.m.</label>
        <input
          type="date"
          value={data.giltigTom}
          onChange={(e) => set("giltigTom", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Registrerad hos</label>
        <input
          type="text"
          value={data.registreradHos}
          onChange={(e) => set("registreradHos", e.target.value)}
          placeholder="t.ex. Boverket"
          className={inputKlass}
        />
      </div>
      <GemensammaFalt
        status={data.status}
        leverantor={data.leverantor}
        offertKr={data.offertKr}
        bestallningsDatum={data.bestallningsDatum}
        utfortDatum={data.utfortDatum}
        notering={data.notering}
        onChange={set}
      />
      <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted">
        Energideklaration är obligatorisk vid försäljning och uthyrning. Giltighetstid: 10 år.
        Ska utföras av ackrediterad energiexpert och registreras hos Boverket.
      </div>
    </ArendeKort>
  );
}

// ── Radonmätning ──────────────────────────────────────────────────────────────

interface RadonKortProps {
  data: RadonMatningData;
  onChange: (patch: Partial<RadonMatningData>) => void;
}

function RadonKort({ data, onChange }: RadonKortProps) {
  const kraverAtgard = radonKraverAtgard(data.resultatBqm3);
  const sammanfattning = [
    data.resultatBqm3 ? `${data.resultatBqm3} Bq/m³` : null,
    kraverAtgard ? "⚠️ Åtgärd krävs (>200 Bq/m³)" : null,
    data.matFranDatum && data.matTomDatum
      ? `Mätperiod: ${data.matFranDatum} – ${data.matTomDatum}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function set(key: string, value: string | boolean) {
    onChange({ [key]: value } as Partial<RadonMatningData>);
  }

  return (
    <ArendeKort
      ikon="☢️"
      rubrik="Radonmätning"
      beskrivning="Mätning av radonhalt i inomhusluften — bör utföras under uppvärmningssäsongen."
      status={data.status}
      sammanfattning={sammanfattning}
    >
      <div>
        <label className={labelKlass}>Mätperiod från</label>
        <input
          type="date"
          value={data.matFranDatum}
          onChange={(e) => set("matFranDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Mätperiod t.o.m.</label>
        <input
          type="date"
          value={data.matTomDatum}
          onChange={(e) => set("matTomDatum", e.target.value)}
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Resultat (Bq/m³)</label>
        <input
          type="number"
          min="0"
          value={data.resultatBqm3}
          onChange={(e) => set("resultatBqm3", e.target.value)}
          placeholder="t.ex. 120"
          className={inputKlass}
        />
        {kraverAtgard && (
          <p className="mt-1 text-xs font-medium text-red-700">
            ⚠️ Uppmätt värde över referensvärdet 200 Bq/m³ — åtgärd krävs
            (Strålsäkerhetsmyndigheten).
          </p>
        )}
      </div>
      <GemensammaFalt
        status={data.status}
        leverantor={data.leverantor}
        offertKr={data.offertKr}
        bestallningsDatum={data.bestallningsDatum}
        utfortDatum={data.utfortDatum}
        notering={data.notering}
        onChange={set}
      />
      <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted">
        Radonhalt bör mätas minst 2 månader under uppvärmningssäsongen (okt–april).
        Referensvärde: 200 Bq/m³ (SSM). Nybyggnad: max 200 Bq/m³ per BBR.
      </div>
    </ArendeKort>
  );
}

// ── Eget ärende ───────────────────────────────────────────────────────────────

interface EgetArendeKortProps {
  arende: EgetArende;
  onChange: (patch: Partial<EgetArende>) => void;
  onTaBort: () => void;
}

function EgetArendeKort({ arende, onChange, onTaBort }: EgetArendeKortProps) {
  function set(key: string, value: string) {
    onChange({ [key]: value } as Partial<EgetArende>);
  }

  return (
    <ArendeKort
      ikon="📌"
      rubrik={arende.rubrik || "Namnlöst ärende"}
      beskrivning={arende.beskrivning || "Eget ärende tillagt av styrelsen."}
      status={arende.status}
      onTaBort={onTaBort}
    >
      <div>
        <label className={labelKlass}>Ärendets namn</label>
        <input
          type="text"
          value={arende.rubrik}
          onChange={(e) => set("rubrik", e.target.value)}
          placeholder="t.ex. Trappstädning, Hissservice…"
          className={inputKlass}
        />
      </div>
      <div>
        <label className={labelKlass}>Beskrivning (valfri)</label>
        <input
          type="text"
          value={arende.beskrivning}
          onChange={(e) => set("beskrivning", e.target.value)}
          placeholder="Kort beskrivning av ärendet"
          className={inputKlass}
        />
      </div>
      <GemensammaFalt
        status={arende.status}
        leverantor={arende.leverantor}
        offertKr={arende.offertKr}
        bestallningsDatum={arende.bestallningsDatum}
        utfortDatum={arende.utfortDatum}
        notering={arende.notering}
        onChange={set}
      />
    </ArendeKort>
  );
}

// ── Grunduppgifter-rad ────────────────────────────────────────────────────────

function GrunduppgifterRad({ grund }: { grund: Grunduppgifter }) {
  const poster = [
    grund.fastighetsbeteckning && {
      etikett: "Fastighetsbeteckning",
      varde: grund.fastighetsbeteckning,
    },
    grund.adresser?.length && {
      etikett: "Adress",
      varde: grund.adresser.join(", "),
    },
    grund.byggar && { etikett: "Byggår", varde: grund.byggar },
    grund.antalLagenheter && {
      etikett: "Lägenheter",
      varde: `${grund.antalLagenheter} st`,
    },
    grund.boarea && { etikett: "Boarea", varde: `${grund.boarea} m²` },
    grund.ventilationssystem && {
      etikett: "Ventilation",
      varde: grund.ventilationssystem,
    },
    grund.antalByggnader && parseInt(grund.antalByggnader) > 1 && {
      etikett: "Antal byggnader",
      varde: grund.antalByggnader,
    },
  ].filter(
    (p): p is { etikett: string; varde: string } => Boolean(p),
  );

  if (poster.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-[#f7fbf8] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Fastighetsinformation (från grunduppgifter)
      </p>
      <dl className="flex flex-wrap gap-x-6 gap-y-1">
        {poster.map((p) => (
          <div key={p.etikett} className="flex gap-1.5 text-sm">
            <dt className="text-muted">{p.etikett}:</dt>
            <dd className="font-medium text-foreground">{p.varde}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">
        Fyll i grunduppgifter i{" "}
        <a
          href="/forening/underhallsplan#grund"
          className="text-primary-dark underline hover:no-underline"
        >
          underhållsplanens steg 1
        </a>{" "}
        för att se fler uppgifter här.
      </p>
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function ForenadUpphandlingModul() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<ForenkladUpphandlingState>(() => ({
    version: 1,
    ovk: tomOvk(),
    energideklaration: tomEnergiDeklaration(),
    radon: tomRadonMatning(),
    egna: [],
  }));
  const [grund, setGrund] = useState<Grunduppgifter | null>(null);
  const [visaSkapaEgetForm, setVisaSkapaEgetForm] = useState(false);
  const [nyttArendeNamn, setNyttArendeNamn] = useState("");

  useEffect(() => {
    const laddad = lasForenkladUpphandling();
    setState(laddad);

    const underhallsState = lasUnderhallsplanState();
    if (underhallsState?.grund) {
      setGrund(underhallsState.grund);
    }
    setHydrated(true);

    const hantera = () => setState(lasForenkladUpphandling());
    window.addEventListener(FORENKLAD_EVENT, hantera);
    return () => window.removeEventListener(FORENKLAD_EVENT, hantera);
  }, []);

  const spara = useCallback((ny: ForenkladUpphandlingState) => {
    setState(ny);
    sparaForenkladUpphandling(ny);
  }, []);

  function uppdateraOvk(patch: Partial<typeof state.ovk>) {
    spara({ ...state, ovk: { ...state.ovk, ...patch } });
  }

  function uppdateraEnergi(patch: Partial<typeof state.energideklaration>) {
    spara({ ...state, energideklaration: { ...state.energideklaration, ...patch } });
  }

  function uppdateraRadon(patch: Partial<typeof state.radon>) {
    spara({ ...state, radon: { ...state.radon, ...patch } });
  }

  function laggTillEgetArende() {
    const rubrik = nyttArendeNamn.trim();
    if (!rubrik) return;
    const nytt: EgetArende = {
      id: skapaEgetArendeId(),
      rubrik,
      beskrivning: "",
      status: "ej-planerad",
      leverantor: "",
      offertKr: "",
      bestallningsDatum: "",
      utfortDatum: "",
      notering: "",
    };
    spara({ ...state, egna: [...state.egna, nytt] });
    setNyttArendeNamn("");
    setVisaSkapaEgetForm(false);
  }

  function uppdateraEgetArende(id: string, patch: Partial<EgetArende>) {
    spara({
      ...state,
      egna: state.egna.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  function taBortEgetArende(id: string) {
    spara({ ...state, egna: state.egna.filter((a) => a.id !== id) });
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 rounded-xl bg-border/40" />
        <div className="h-16 rounded-xl bg-border/40" />
        <div className="h-16 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fastighetsinformation */}
      {grund && <GrunduppgifterRad grund={grund} />}

      {/* Obligatoriska ärenden */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Obligatoriska kontroller
        </p>
        <div className="space-y-3">
          <OvkKort
            data={state.ovk}
            ventilationssystem={grund?.ventilationssystem ?? ""}
            onChange={uppdateraOvk}
          />
          <EnergiKort
            data={state.energideklaration}
            onChange={uppdateraEnergi}
          />
          <RadonKort data={state.radon} onChange={uppdateraRadon} />
        </div>
      </div>

      {/* Egna ärenden */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Egna ärenden
          </p>
          <span className="text-xs text-muted">{state.egna.length} st</span>
        </div>

        {state.egna.length === 0 && !visaSkapaEgetForm && (
          <p className="mb-3 text-sm text-muted">
            Inga egna ärenden tillagda ännu.
          </p>
        )}

        <div className="space-y-3">
          {state.egna.map((arende) => (
            <EgetArendeKort
              key={arende.id}
              arende={arende}
              onChange={(patch) => uppdateraEgetArende(arende.id, patch)}
              onTaBort={() => taBortEgetArende(arende.id)}
            />
          ))}
        </div>

        {visaSkapaEgetForm ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">
              Nytt ärende
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nyttArendeNamn}
                onChange={(e) => setNyttArendeNamn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") laggTillEgetArende();
                  if (e.key === "Escape") setVisaSkapaEgetForm(false);
                }}
                autoFocus
                placeholder="t.ex. Trappstädning, Hissservice, Lekplatsbesiktning…"
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={laggTillEgetArende}
                disabled={!nyttArendeNamn.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              >
                Lägg till
              </button>
              <button
                type="button"
                onClick={() => setVisaSkapaEgetForm(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setVisaSkapaEgetForm(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
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
            Lägg till eget ärende
          </button>
        )}
      </div>
    </div>
  );
}
