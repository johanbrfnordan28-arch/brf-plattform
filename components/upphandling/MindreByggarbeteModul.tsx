"use client";

import { useEffect, useRef, useState } from "react";
import {
  ARBETSTYP_SNABBVAL,
  BYGGARBETE_EVENT,
  PRIORITET_ETIKETTER,
  PRIORITET_FARGER,
  STATUS_ETIKETTER,
  STATUS_FARGER,
  STATUS_IKONER,
  lasMindreByggarbeten,
  skapaByggarbeteId,
  sparaMindreByggarbeten,
  type ByggarbetePrioritet,
  type ByggarbeteStatus,
  type MindreByggarbete,
  type MindreByggarbeteState,
} from "@/components/upphandling/mindre-byggarbete-lager";

// ── Hjälpkomponenter ──────────────────────────────────────────────────────────

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ── Offertförfrågan-modal ─────────────────────────────────────────────────────

interface OffertPanelProps {
  arbete: MindreByggarbete;
  onSkickat: (epost: string) => void;
  onStang: () => void;
}

function OffertPanel({ arbete, onSkickat, onStang }: OffertPanelProps) {
  const [epost, setEpost] = useState(arbete.offertMottagarEpost);
  const [kontakt, setKontakt] = useState("");
  const [sista, setSista] = useState("");
  const [kopiad, setKopiad] = useState(false);

  function byggMeddelande(): string {
    const k = kontakt.trim() || "[Kontaktperson]";
    const s = sista || "[Sista svarsdatum]";
    return [
      `Hej,`,
      ``,
      `Vi önskar offert för följande arbete i vår fastighet.`,
      ``,
      `Arbetstyp: ${arbete.arbetstyp}`,
      `Plats: ${arbete.plats || "[Plats ej angiven]"}`,
      `Beskrivning: ${arbete.beskrivning || "[Beskrivning ej angiven]"}`,
      ``,
      `Vi önskar er offert senast ${s}.`,
      `Kontaktperson hos oss: ${k}`,
      ``,
      `Med vänliga hälsningar`,
    ].join("\n");
  }

  function oppnaEpost() {
    const amne = encodeURIComponent(`Offertförfrågan — ${arbete.arbetstyp}`);
    const kropp = encodeURIComponent(byggMeddelande());
    window.open(`mailto:${epost}?subject=${amne}&body=${kropp}`);
    onSkickat(epost);
  }

  function kopieraMeddelande() {
    navigator.clipboard.writeText(byggMeddelande()).then(() => {
      setKopiad(true);
      setTimeout(() => setKopiad(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-[#eef6f0] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Skicka offertförfrågan</h3>
          <p className="mt-0.5 text-sm text-muted">
            {arbete.arbetstyp}
            {arbete.plats ? ` · ${arbete.plats}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onStang}
          className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Mottagarens e-post (leverantör / hantverkare)
          </label>
          <input
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="leverantor@foretag.se"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Kontaktperson hos er
          </label>
          <input
            type="text"
            value={kontakt}
            onChange={(e) => setKontakt(e.target.value)}
            placeholder="Namn och telefon"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Sista svarsdatum
          </label>
          <input
            type="date"
            value={sista}
            onChange={(e) => setSista(e.target.value)}
            className={inputKlass}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={oppnaEpost}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          📧 Öppna i e-postklient
        </button>
        <button
          type="button"
          onClick={kopieraMeddelande}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40"
        >
          {kopiad ? "✓ Kopierat!" : "Kopiera meddelandetext"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Din e-postklient öppnas med mottagare och meddeland förifyllt — granska och
        skicka.
      </p>
    </div>
  );
}

// ── Arbete-kort ───────────────────────────────────────────────────────────────

interface ArbeteKortProps {
  arbete: MindreByggarbete;
  onUppdatera: (patch: Partial<MindreByggarbete>) => void;
  onTaBort: () => void;
  onSkickaOffert: () => void;
}

function ArbeteKort({ arbete, onUppdatera, onTaBort, onSkickaOffert }: ArbeteKortProps) {
  const [visaDetaljer, setVisaDetaljer] = useState(false);
  const [bekrafta, setBekrafta] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      {/* Header-rad */}
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg" aria-hidden>{ARBETSTYP_SNABBVAL.find(s => s.etikett === arbete.arbetstyp)?.ikon ?? "🔨"}</span>
            <p className="font-semibold text-foreground">{arbete.arbetstyp}</p>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITET_FARGER[arbete.prioritet]}`}>
              {PRIORITET_ETIKETTER[arbete.prioritet]}
            </span>
          </div>
          {arbete.beskrivning && (
            <p className="mt-0.5 text-sm text-muted line-clamp-1">{arbete.beskrivning}</p>
          )}
          {arbete.plats && (
            <p className="mt-0.5 text-xs text-muted">📍 {arbete.plats}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* Status-väljare */}
          <select
            value={arbete.status}
            onChange={(e) => onUppdatera({ status: e.target.value as ByggarbeteStatus })}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer ${STATUS_FARGER[arbete.status]}`}
          >
            {(Object.keys(STATUS_ETIKETTER) as ByggarbeteStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_IKONER[s]} {STATUS_ETIKETTER[s]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSkickaOffert}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-[#e2f0e6]"
          >
            Begär offert
          </button>

          <button
            type="button"
            onClick={() => setVisaDetaljer((v) => !v)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
          >
            {visaDetaljer ? "Dölj" : "Redigera"}
          </button>

          {bekrafta ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onTaBort}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Ta bort
              </button>
              <button
                type="button"
                onClick={() => setBekrafta(false)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted"
              >
                Avbryt
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setBekrafta(true)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:border-red-300 hover:text-red-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Redigera-panel */}
      {visaDetaljer && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Plats i fastigheten</label>
              <input
                type="text"
                value={arbete.plats}
                onChange={(e) => onUppdatera({ plats: e.target.value })}
                placeholder="t.ex. Trapphus 2, Lägenhet 12"
                className={inputKlass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Prioritet</label>
              <select
                value={arbete.prioritet}
                onChange={(e) => onUppdatera({ prioritet: e.target.value as ByggarbetePrioritet })}
                className={inputKlass}
              >
                {(Object.keys(PRIORITET_ETIKETTER) as ByggarbetePrioritet[]).map((p) => (
                  <option key={p} value={p}>{PRIORITET_ETIKETTER[p]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Beskrivning</label>
              <textarea
                value={arbete.beskrivning}
                onChange={(e) => onUppdatera({ beskrivning: e.target.value })}
                rows={2}
                placeholder="Beskriv arbetet kortfattat…"
                className={`${inputKlass} resize-none`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Notering</label>
              <input
                type="text"
                value={arbete.notering}
                onChange={(e) => onUppdatera({ notering: e.target.value })}
                placeholder="Interna anteckningar…"
                className={inputKlass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nytt arbete-formulär ──────────────────────────────────────────────────────

interface NyttArbeteFormularProps {
  onSpara: (arbete: Omit<MindreByggarbete, "id" | "skapadDatum" | "status">) => void;
  onAvbryt: () => void;
}

function NyttArbeteFormular({ onSpara, onAvbryt }: NyttArbeteFormularProps) {
  const [valdTyp, setValdTyp] = useState("");
  const [egetNamn, setEgetNamn] = useState("");
  const [beskrivning, setBeskrivning] = useState("");
  const [plats, setPlats] = useState("");
  const [prioritet, setPrioritet] = useState<ByggarbetePrioritet>("normal");
  const egetRef = useRef<HTMLInputElement>(null);

  const arbetstyp = valdTyp === "Övrigt" ? egetNamn.trim() || "Övrigt" : valdTyp;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!arbetstyp) return;
    onSpara({
      arbetstyp,
      beskrivning,
      plats,
      prioritet,
      offertMottagarEpost: "",
      notering: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border-2 border-dashed border-primary/30 bg-[#f7fbf8] p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">Nytt arbete</p>

      {/* Snabbval */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wide">
          Välj arbetstyp
        </p>
        <div className="flex flex-wrap gap-2">
          {ARBETSTYP_SNABBVAL.map(({ etikett, ikon }) => (
            <button
              key={etikett}
              type="button"
              onClick={() => {
                setValdTyp(etikett);
                if (etikett === "Övrigt") setTimeout(() => egetRef.current?.focus(), 50);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                valdTyp === etikett
                  ? "border-primary bg-[#e2f0e6] text-primary-dark"
                  : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              <span aria-hidden>{ikon}</span>
              {etikett}
            </button>
          ))}
        </div>
      </div>

      {valdTyp === "Övrigt" && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted">Eget namn på arbetet</label>
          <input
            ref={egetRef}
            type="text"
            value={egetNamn}
            onChange={(e) => setEgetNamn(e.target.value)}
            placeholder="t.ex. Porttelefon, Cykelställ, Balkongräcke…"
            className={inputKlass}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Kort beskrivning <span className="font-normal">(vad ska göras)</span>
          </label>
          <textarea
            value={beskrivning}
            onChange={(e) => setBeskrivning(e.target.value)}
            rows={2}
            placeholder="t.ex. Ommålning trapphuset plan 1-3, skadade ytor repareras först"
            className={`${inputKlass} resize-none`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Plats i fastigheten</label>
          <input
            type="text"
            value={plats}
            onChange={(e) => setPlats(e.target.value)}
            placeholder="t.ex. Trapphus A, Källare"
            className={inputKlass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Prioritet</label>
          <select
            value={prioritet}
            onChange={(e) => setPrioritet(e.target.value as ByggarbetePrioritet)}
            className={inputKlass}
          >
            {(Object.keys(PRIORITET_ETIKETTER) as ByggarbetePrioritet[]).map((p) => (
              <option key={p} value={p}>{PRIORITET_ETIKETTER[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={!arbetstyp}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Lägg till arbete
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────

export function MindreByggarbeteModul() {
  const [state, setState] = useState<MindreByggarbeteState>({ version: 1, arbeten: [] });
  const [hydrated, setHydrated] = useState(false);
  const [visaNyttFormular, setVisaNyttFormular] = useState(false);
  const [offertFor, setOffertFor] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ByggarbeteStatus | "alla">("alla");

  useEffect(() => {
    setState(lasMindreByggarbeten());
    setHydrated(true);
    const h = () => setState(lasMindreByggarbeten());
    window.addEventListener(BYGGARBETE_EVENT, h);
    return () => window.removeEventListener(BYGGARBETE_EVENT, h);
  }, []);

  function spara(ny: MindreByggarbeteState) {
    setState(ny);
    sparaMindreByggarbeten(ny);
  }

  function laggTillArbete(data: Omit<MindreByggarbete, "id" | "skapadDatum" | "status">) {
    const nytt: MindreByggarbete = {
      ...data,
      id: skapaByggarbeteId(),
      status: "ny",
      skapadDatum: new Date().toLocaleDateString("sv-SE"),
    };
    spara({ ...state, arbeten: [nytt, ...state.arbeten] });
    setVisaNyttFormular(false);
  }

  function uppdateraArbete(id: string, patch: Partial<MindreByggarbete>) {
    spara({
      ...state,
      arbeten: state.arbeten.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  function taBortArbete(id: string) {
    spara({ ...state, arbeten: state.arbeten.filter((a) => a.id !== id) });
  }

  function markeraOffertSkickad(id: string, epost: string) {
    uppdateraArbete(id, { status: "offert-skickad", offertMottagarEpost: epost });
    setOffertFor(null);
  }

  const filtreradeLista = filterStatus === "alla"
    ? state.arbeten
    : state.arbeten.filter((a) => a.status === filterStatus);

  const antalPerStatus = (s: ByggarbeteStatus) => state.arbeten.filter((a) => a.status === s).length;

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-12 rounded-lg bg-border/40" />
        <div className="h-24 rounded-xl bg-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Statusöversikt */}
      {state.arbeten.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("alla")}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${filterStatus === "alla" ? "border-primary bg-[#e2f0e6] text-primary-dark" : "border-border text-muted hover:text-foreground"}`}
          >
            Alla ({state.arbeten.length})
          </button>
          {(["ny", "offert-skickad", "offert-mottagen", "pagaende", "klar"] as ByggarbeteStatus[]).map((s) => {
            const n = antalPerStatus(s);
            if (n === 0) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${filterStatus === s ? `${STATUS_FARGER[s]} font-bold` : "border-border text-muted hover:text-foreground"}`}
              >
                {STATUS_IKONER[s]} {STATUS_ETIKETTER[s]} ({n})
              </button>
            );
          })}
        </div>
      )}

      {/* Lista */}
      {filtreradeLista.length === 0 && !visaNyttFormular && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
          Inga mindre byggarbeten registrerade ännu. Klicka nedan för att lägga till.
        </p>
      )}

      <div className="space-y-3">
        {filtreradeLista.map((arbete) => (
          <div key={arbete.id}>
            <ArbeteKort
              arbete={arbete}
              onUppdatera={(patch) => uppdateraArbete(arbete.id, patch)}
              onTaBort={() => taBortArbete(arbete.id)}
              onSkickaOffert={() => setOffertFor(arbete.id)}
            />
            {offertFor === arbete.id && (
              <div className="mt-2">
                <OffertPanel
                  arbete={arbete}
                  onSkickat={(epost) => markeraOffertSkickad(arbete.id, epost)}
                  onStang={() => setOffertFor(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nytt formulär eller knapp */}
      {visaNyttFormular ? (
        <NyttArbeteFormular
          onSpara={laggTillArbete}
          onAvbryt={() => setVisaNyttFormular(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setVisaNyttFormular(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Lägg till nytt byggarbete
        </button>
      )}
    </div>
  );
}
