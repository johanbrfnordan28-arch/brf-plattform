"use client";

import { useState } from "react";
import {
  skapaKommunikationId,
  type KommunikationState,
  type Medlem,
} from "@/components/kommunikation/kommunikation-lager";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  state: KommunikationState;
  onUppdatera: (ny: KommunikationState) => void;
}

export function MedlemsRegisterModul({ state, onUppdatera }: Props) {
  const [redigerarId, setRedigerarId] = useState<string | null>(null);
  const [visaNyttForm, setVisaNyttForm] = useState(false);
  const [bekraftaTaBortId, setBekraftaTaBortId] = useState<string | null>(null);
  const [sok, setSok] = useState("");

  // Form-state
  const [formNamn, setFormNamn] = useState("");
  const [formEpost, setFormEpost] = useState("");
  const [formTelefon, setFormTelefon] = useState("");
  const [formLagenhetNr, setFormLagenhetNr] = useState("");
  const [formAdress, setFormAdress] = useState("");

  function resetForm() {
    setFormNamn(""); setFormEpost(""); setFormTelefon("");
    setFormLagenhetNr(""); setFormAdress("");
  }

  function startaRedigera(m: Medlem) {
    setRedigerarId(m.id);
    setFormNamn(m.namn);
    setFormEpost(m.epost);
    setFormTelefon(m.telefon);
    setFormLagenhetNr(m.lagenhetNr);
    setFormAdress(m.adress);
    setVisaNyttForm(false);
  }

  function sparaRedigering() {
    if (!redigerarId || !formNamn.trim()) return;
    onUppdatera({
      ...state,
      medlemmar: state.medlemmar.map((m) =>
        m.id === redigerarId
          ? { ...m, namn: formNamn.trim(), epost: formEpost.trim(), telefon: formTelefon.trim(), lagenhetNr: formLagenhetNr.trim(), adress: formAdress.trim() }
          : m,
      ),
    });
    setRedigerarId(null);
    resetForm();
  }

  function laggTillMedlem() {
    if (!formNamn.trim()) return;
    const ny: Medlem = {
      id: skapaKommunikationId("medl"),
      namn: formNamn.trim(),
      epost: formEpost.trim(),
      telefon: formTelefon.trim(),
      lagenhetNr: formLagenhetNr.trim(),
      adress: formAdress.trim(),
      aktiv: true,
    };
    onUppdatera({ ...state, medlemmar: [...state.medlemmar, ny] });
    setVisaNyttForm(false);
    resetForm();
  }

  function taBortMedlem(id: string) {
    onUppdatera({ ...state, medlemmar: state.medlemmar.filter((m) => m.id !== id) });
    setBekraftaTaBortId(null);
  }

  function toggleAktiv(id: string) {
    onUppdatera({
      ...state,
      medlemmar: state.medlemmar.map((m) =>
        m.id === id ? { ...m, aktiv: !m.aktiv } : m,
      ),
    });
  }

  const filtrerade = state.medlemmar.filter((m) => {
    if (!sok.trim()) return true;
    const q = sok.toLowerCase();
    return (
      m.namn.toLowerCase().includes(q) ||
      m.epost.toLowerCase().includes(q) ||
      m.lagenhetNr.toLowerCase().includes(q)
    );
  });

  const FormularRader = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Namn *</label>
        <input value={formNamn} onChange={(e) => setFormNamn(e.target.value)} placeholder="För- och efternamn" className={inputKlass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Lägenhetsnummer</label>
        <input value={formLagenhetNr} onChange={(e) => setFormLagenhetNr(e.target.value)} placeholder="t.ex. 1204" className={inputKlass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">E-post</label>
        <input type="email" value={formEpost} onChange={(e) => setFormEpost(e.target.value)} placeholder="epost@exempel.se" className={inputKlass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Telefon</label>
        <input type="tel" value={formTelefon} onChange={(e) => setFormTelefon(e.target.value)} placeholder="070-123 45 67" className={inputKlass} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-muted">Adress</label>
        <input value={formAdress} onChange={(e) => setFormAdress(e.target.value)} placeholder="Gatuadress" className={inputKlass} />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Sök + stats */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Sök namn, e-post eller lgh-nr…"
          className="min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <span className="text-sm text-muted">
          {state.medlemmar.filter((m) => m.aktiv).length} aktiva ·{" "}
          {state.medlemmar.length} totalt
        </span>
      </div>

      {/* Nytt formulär */}
      {visaNyttForm ? (
        <div className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Ny medlem</p>
            <button type="button" onClick={() => { setVisaNyttForm(false); resetForm(); }} className="text-sm text-muted hover:text-foreground">Avbryt</button>
          </div>
          {FormularRader}
          <button
            type="button"
            onClick={laggTillMedlem}
            disabled={!formNamn.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          >
            Lägg till
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setVisaNyttForm(true); setRedigerarId(null); resetForm(); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          + Lägg till medlem
        </button>
      )}

      {/* Tabellrubrik */}
      {filtrerade.length > 0 && (
        <div className="hidden grid-cols-[1fr_80px_160px_80px_100px] gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>Namn</span><span>Lgh</span><span>E-post</span><span>Status</span><span />
        </div>
      )}

      {/* Memberslista */}
      <div className="space-y-2">
        {filtrerade.length === 0 && (
          <p className="text-sm text-muted">Inga medlemmar registrerade ännu.</p>
        )}
        {filtrerade.map((m) =>
          redigerarId === m.id ? (
            <div key={m.id} className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-4 space-y-3">
              {FormularRader}
              <div className="flex gap-2">
                <button type="button" onClick={sparaRedigering} disabled={!formNamn.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40">Spara</button>
                <button type="button" onClick={() => { setRedigerarId(null); resetForm(); }} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground">Avbryt</button>
              </div>
            </div>
          ) : (
            <div key={m.id} className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 ${m.aktiv ? "border-border bg-white" : "border-border/50 bg-surface/50 opacity-60"}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{m.namn}</p>
                  {m.lagenhetNr && <span className="text-xs text-muted">Lgh {m.lagenhetNr}</span>}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted">
                  {m.epost && <span>{m.epost}</span>}
                  {m.telefon && <span>{m.telefon}</span>}
                  {m.adress && <span>{m.adress}</span>}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleAktiv(m.id)}
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${m.aktiv ? "border-primary/30 bg-[#eef6f0] text-primary-dark" : "border-border bg-surface text-muted"}`}
                >
                  {m.aktiv ? "Aktiv" : "Inaktiv"}
                </button>
                <button type="button" onClick={() => startaRedigera(m)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground">Redigera</button>
                {bekraftaTaBortId === m.id ? (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => taBortMedlem(m.id)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700">Ta bort</button>
                    <button type="button" onClick={() => setBekraftaTaBortId(null)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted">Avbryt</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setBekraftaTaBortId(m.id)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:border-red-300 hover:text-red-600">×</button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
