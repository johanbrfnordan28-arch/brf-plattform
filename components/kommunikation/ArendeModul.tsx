"use client";

import { useState } from "react";
import {
  ARENDE_KATEGORI_ETIKETTER,
  ARENDE_PRIORITET_ETIKETTER,
  ARENDE_PRIORITET_FARGER,
  ARENDE_STATUS_ETIKETTER,
  ARENDE_STATUS_FARGER,
  formatDatum,
  lasKommunikationState,
  skapaArendeNr,
  skapaKommunikationId,
  sparaKommunikationState,
  type Arende,
  type ArendeKategori,
  type ArendeKommentar,
  type ArendePrioritet,
  type ArendeStatus,
  type KommunikationState,
} from "@/components/kommunikation/kommunikation-lager";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ── Stäng-ärendeformulär ──────────────────────────────────────────────────────

function StangArendeForm({
  arende,
  onStang,
  onAvbryt,
}: {
  arende: Arende;
  onStang: (protokoll: string) => void;
  onAvbryt: () => void;
}) {
  const [protokoll, setProtokoll] = useState(arende.protokollReferens ?? "");

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-4">
      <p className="mb-3 font-semibold text-foreground">
        Stäng ärende {arende.arendeNr}
      </p>
      <p className="mb-3 text-sm text-muted">
        Ange protokollreferens för styrelsebeslut som avslutade ärendet — krävs
        för att stänga.
      </p>
      <label className="block">
        <span className="text-xs font-medium text-muted">
          Protokollreferens (obligatorisk)
        </span>
        <input
          type="text"
          value={protokoll}
          onChange={(e) => setProtokoll(e.target.value)}
          placeholder="t.ex. Styrelsemöte 2026-06-17 § 5"
          className={`${inputKlass} mt-1`}
          autoFocus
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onStang(protokoll)}
          disabled={!protokoll.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Stäng ärende
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// ── Ärendedetalj ──────────────────────────────────────────────────────────────

function ArendeDetalj({
  arende,
  onUppdatera,
  onTaBort,
}: {
  arende: Arende;
  onUppdatera: (patch: Partial<Arende>) => void;
  onTaBort: () => void;
}) {
  const [visaStang, setVisaStang] = useState(false);
  const [nyKommentar, setNyKommentar] = useState("");
  const [kommentarFran, setKommentarFran] = useState<"styrelse" | "medlem">("styrelse");

  function laggTillKommentar() {
    if (!nyKommentar.trim()) return;
    const k: ArendeKommentar = {
      id: skapaKommunikationId("kom"),
      datum: new Date().toISOString(),
      fran: kommentarFran,
      text: nyKommentar.trim(),
    };
    onUppdatera({ kommentarer: [...arende.kommentarer, k] });
    setNyKommentar("");
  }

  function stangArende(protokoll: string) {
    onUppdatera({
      status: "stangt",
      stangdDatum: new Date().toISOString(),
      protokollReferens: protokoll,
    });
    setVisaStang(false);
  }

  const arOppet = arende.status !== "stangt";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-white p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary-dark">
              {arende.arendeNr}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ARENDE_STATUS_FARGER[arende.status]}`}>
              {ARENDE_STATUS_ETIKETTER[arende.status]}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ARENDE_PRIORITET_FARGER[arende.prioritet]}`}>
              {ARENDE_PRIORITET_ETIKETTER[arende.prioritet]}
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">{arende.amne}</p>
          <p className="mt-0.5 text-sm text-muted">
            Från: <strong>{arende.franNamn}</strong>
            {arende.lagenhetNr ? ` · Lgh ${arende.lagenhetNr}` : ""}
            {arende.franEpost ? ` · ${arende.franEpost}` : ""}
          </p>
          <p className="text-xs text-muted">
            Inkommet {formatDatum(arende.skapadDatum)}
            {arende.stangdDatum ? ` · Stängt ${formatDatum(arende.stangdDatum)}` : ""}
          </p>
          {arende.protokollReferens && (
            <p className="mt-1 rounded-lg border border-primary/20 bg-[#eef6f0] px-2 py-1 text-xs text-primary-dark">
              📋 Protokoll: {arende.protokollReferens}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {arOppet && (
            <>
              <select
                value={arende.status}
                onChange={(e) => onUppdatera({ status: e.target.value as ArendeStatus })}
                className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
              >
                <option value="oppet">Öppet</option>
                <option value="pagaende">Pågående</option>
              </select>
              <select
                value={arende.prioritet}
                onChange={(e) => onUppdatera({ prioritet: e.target.value as ArendePrioritet })}
                className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs"
              >
                <option value="lag">Låg</option>
                <option value="normal">Normal</option>
                <option value="hog">Hög</option>
              </select>
              <button
                type="button"
                onClick={() => setVisaStang(true)}
                className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-[#daeee1]"
              >
                Stäng ärende
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onTaBort}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:border-red-300 hover:text-red-600"
          >
            ×
          </button>
        </div>
      </div>

      {/* Stäng-form */}
      {visaStang && (
        <StangArendeForm
          arende={arende}
          onStang={stangArende}
          onAvbryt={() => setVisaStang(false)}
        />
      )}

      {/* Ursprungligt meddelande */}
      <div className="rounded-xl border border-border bg-white p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Meddelande från {arende.franNamn}
        </p>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {arende.beskrivning}
        </p>
      </div>

      {/* Kommentarer / tråd */}
      {arende.kommentarer.length > 0 && (
        <div className="space-y-2">
          {arende.kommentarer.map((k) => (
            <div
              key={k.id}
              className={`rounded-xl border p-3 ${
                k.fran === "styrelse"
                  ? "border-primary/20 bg-[#eef6f0]"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {k.fran === "styrelse" ? "Styrelsen" : "Medlem"}
                </span>
                <span className="text-xs text-muted">{formatDatum(k.datum)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{k.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ny kommentar */}
      {arOppet && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Lägg till notering / svar
          </p>
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setKommentarFran("styrelse")}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${kommentarFran === "styrelse" ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted"}`}
            >
              Från styrelsen
            </button>
            <button
              type="button"
              onClick={() => setKommentarFran("medlem")}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${kommentarFran === "medlem" ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted"}`}
            >
              Registrera svar från medlem
            </button>
          </div>
          <textarea
            value={nyKommentar}
            onChange={(e) => setNyKommentar(e.target.value)}
            rows={3}
            placeholder={kommentarFran === "styrelse" ? "Intern notering eller svar…" : "Registrera vad medlemmen svarade…"}
            className={`${inputKlass} resize-none`}
          />
          <button
            type="button"
            onClick={laggTillKommentar}
            disabled={!nyKommentar.trim()}
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          >
            Spara notering
          </button>
        </div>
      )}
    </div>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

interface Props {
  state: KommunikationState;
  onUppdatera: (ny: KommunikationState) => void;
}

export function ArendeModul({ state, onUppdatera }: Props) {
  const [visaNyttForm, setVisaNyttForm] = useState(false);
  const [valtArendeId, setValtArendeId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ArendeStatus | "alla">("alla");

  // Nytt ärende — form-state
  const [franNamn, setFranNamn] = useState("");
  const [franEpost, setFranEpost] = useState("");
  const [lagenhetNr, setLagenhetNr] = useState("");
  const [amne, setAmne] = useState("");
  const [beskrivning, setBeskrivning] = useState("");
  const [kategori, setKategori] = useState<ArendeKategori>("ovrigt");
  const [prioritet, setPrioritet] = useState<ArendePrioritet>("normal");

  function registreraArende(e: React.FormEvent) {
    e.preventDefault();
    if (!amne.trim() || !franNamn.trim()) return;

    const { nr, nyState } = skapaArendeNr(state);
    const arende: Arende = {
      id: skapaKommunikationId("arende"),
      arendeNr: nr,
      skapadDatum: new Date().toISOString(),
      status: "oppet",
      prioritet,
      kategori,
      franNamn: franNamn.trim(),
      franEpost: franEpost.trim(),
      lagenhetNr: lagenhetNr.trim(),
      amne: amne.trim(),
      beskrivning: beskrivning.trim(),
      kommentarer: [],
    };

    onUppdatera({ ...nyState, arenden: [arende, ...nyState.arenden] });
    setFranNamn(""); setFranEpost(""); setLagenhetNr("");
    setAmne(""); setBeskrivning(""); setKategori("ovrigt"); setPrioritet("normal");
    setVisaNyttForm(false);
    setValtArendeId(arende.id);
  }

  function uppdateraArende(id: string, patch: Partial<Arende>) {
    onUppdatera({
      ...state,
      arenden: state.arenden.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  function taBortArende(id: string) {
    onUppdatera({ ...state, arenden: state.arenden.filter((a) => a.id !== id) });
    if (valtArendeId === id) setValtArendeId(null);
  }

  const filtreradeLista =
    filterStatus === "alla"
      ? state.arenden
      : state.arenden.filter((a) => a.status === filterStatus);

  const valtArende = state.arenden.find((a) => a.id === valtArendeId);

  const antalOppna = state.arenden.filter((a) => a.status === "oppet").length;
  const antalPagaende = state.arenden.filter((a) => a.status === "pagaende").length;
  const antalStangda = state.arenden.filter((a) => a.status === "stangt").length;

  return (
    <div className="space-y-5">
      {/* Statusöversikt */}
      <div className="flex flex-wrap gap-2">
        {[
          ["alla", `Alla (${state.arenden.length})`],
          ["oppet", `🟡 Öppet (${antalOppna})`],
          ["pagaende", `🔵 Pågående (${antalPagaende})`],
          ["stangt", `✅ Stängt (${antalStangda})`],
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => { setFilterStatus(val as ArendeStatus | "alla"); setValtArendeId(null); }}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${filterStatus === val ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Nytt ärende-knapp */}
      {!visaNyttForm && (
        <button
          type="button"
          onClick={() => { setVisaNyttForm(true); setValtArendeId(null); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          + Registrera inkommande meddelande / ärende
        </button>
      )}

      {/* Nytt ärende-formulär */}
      {visaNyttForm && (
        <form onSubmit={registreraArende} className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Registrera nytt ärende</p>
            <button type="button" onClick={() => setVisaNyttForm(false)} className="text-sm text-muted hover:text-foreground">Avbryt</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Från (namn) *</label>
              <input required value={franNamn} onChange={(e) => setFranNamn(e.target.value)} placeholder="Medlemmens namn" className={inputKlass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">E-post</label>
              <input type="email" value={franEpost} onChange={(e) => setFranEpost(e.target.value)} placeholder="medlem@exempel.se" className={inputKlass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Lgh-nr</label>
              <input value={lagenhetNr} onChange={(e) => setLagenhetNr(e.target.value)} placeholder="t.ex. 1204" className={inputKlass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value as ArendeKategori)} className={inputKlass}>
                {(Object.keys(ARENDE_KATEGORI_ETIKETTER) as ArendeKategori[]).map((k) => (
                  <option key={k} value={k}>{ARENDE_KATEGORI_ETIKETTER[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Prioritet</label>
              <select value={prioritet} onChange={(e) => setPrioritet(e.target.value as ArendePrioritet)} className={inputKlass}>
                <option value="lag">Låg</option>
                <option value="normal">Normal</option>
                <option value="hog">Hög</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ärende / ämne *</label>
              <input required value={amne} onChange={(e) => setAmne(e.target.value)} placeholder="t.ex. Klagomål buller lägenhet 1203" className={inputKlass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Meddelande / beskrivning</label>
              <textarea value={beskrivning} onChange={(e) => setBeskrivning(e.target.value)} rows={4} placeholder="Skriv in eller klistra in vad medlemmen skrivit…" className={`${inputKlass} resize-none`} />
            </div>
          </div>
          <button type="submit" disabled={!amne.trim() || !franNamn.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40">
            Registrera ärende
          </button>
        </form>
      )}

      {/* Ärendelista + detalj */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Lista */}
        <div className="space-y-2 lg:col-span-2">
          {filtreradeLista.length === 0 && (
            <p className="text-sm text-muted">Inga ärenden i vald status.</p>
          )}
          {filtreradeLista.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setValtArendeId(a.id === valtArendeId ? null : a.id)}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                valtArendeId === a.id
                  ? "border-primary bg-[#eef6f0]"
                  : "border-border bg-white hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-dark">{a.arendeNr}</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-xs font-medium ${ARENDE_STATUS_FARGER[a.status]}`}>
                  {ARENDE_STATUS_ETIKETTER[a.status]}
                </span>
                {a.prioritet === "hog" && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-800">Hög</span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground line-clamp-1">{a.amne}</p>
              <p className="text-xs text-muted">{a.franNamn}{a.lagenhetNr ? ` · Lgh ${a.lagenhetNr}` : ""}</p>
              <p className="text-xs text-muted">{formatDatum(a.skapadDatum)}</p>
            </button>
          ))}
        </div>

        {/* Detalj */}
        <div className="lg:col-span-3">
          {valtArende ? (
            <ArendeDetalj
              arende={valtArende}
              onUppdatera={(patch) => uppdateraArende(valtArende.id, patch)}
              onTaBort={() => taBortArende(valtArende.id)}
            />
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              Välj ett ärende i listan för att se detaljer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
