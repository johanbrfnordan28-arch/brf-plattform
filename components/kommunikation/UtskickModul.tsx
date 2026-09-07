"use client";

import { useState } from "react";
import {
  UTSKICK_TYP_ETIKETTER,
  formatDatum,
  lasKommunikationState,
  skapaKommunikationId,
  sparaKommunikationState,
  type KommunikationState,
  type Medlem,
  type UtgaendeMejl,
  type UtskickTyp,
} from "@/components/kommunikation/kommunikation-lager";

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  state: KommunikationState;
  onUppdatera: (ny: KommunikationState) => void;
}

export function UtskickModul({ state, onUppdatera }: Props) {
  const [typ, setTyp] = useState<UtskickTyp>("info");
  const [amne, setAmne] = useState("");
  const [meddelande, setMeddelande] = useState("");
  const [skickatAv, setSkickatAv] = useState("");
  const [valdaIds, setValdaIds] = useState<Set<string>>(new Set());
  const [vallaAlla, setVallaAlla] = useState(true);
  const [kopiad, setKopiad] = useState(false);
  const [visaHistorik, setVisaHistorik] = useState(false);
  const [visaFormular, setVisaFormular] = useState(false);

  const aktivaMedlemmar = state.medlemmar.filter((m) => m.aktiv && m.epost.trim());

  const valdaMedlemmar: Medlem[] = vallaAlla
    ? aktivaMedlemmar
    : aktivaMedlemmar.filter((m) => valdaIds.has(m.id));

  function toggleMedlem(id: string) {
    setValdaIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function byggMailtoLank(): string {
    const eposter = valdaMedlemmar.map((m) => m.epost);
    const till = eposter[0] ?? "";
    const bcc = eposter.slice(1).join(",");
    const bccDel = bcc ? `&bcc=${encodeURIComponent(bcc)}` : "";
    const kropp = encodeURIComponent(meddelande);
    const subjekt = encodeURIComponent(amne);
    return `mailto:${till}?subject=${subjekt}${bccDel}&body=${kropp}`;
  }

  function skicka() {
    if (!amne.trim() || !meddelande.trim() || valdaMedlemmar.length === 0) return;

    window.open(byggMailtoLank());

    const utskick: UtgaendeMejl = {
      id: skapaKommunikationId("utskick"),
      datum: new Date().toISOString(),
      typ,
      amne: amne.trim(),
      meddelande: meddelande.trim(),
      mottagarIds: vallaAlla ? ["alla"] : [...valdaIds],
      mottagarNamn: valdaMedlemmar.map((m) => m.namn),
      mottagarEposter: valdaMedlemmar.map((m) => m.epost),
      skickatAv: skickatAv.trim() || "Styrelsen",
    };

    onUppdatera({
      ...state,
      utskick: [utskick, ...state.utskick],
    });

    setAmne("");
    setMeddelande("");
    setTyp("info");
    setValdaIds(new Set());
    setVallaAlla(true);
    setVisaFormular(false);
  }

  function kopieraEposter() {
    const lista = valdaMedlemmar.map((m) => m.epost).join("; ");
    navigator.clipboard.writeText(lista).then(() => {
      setKopiad(true);
      setTimeout(() => setKopiad(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Info om att det är ett reellt e-postflöde */}
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <p>
          Utskick öppnar er e-postklient med alla valda medlemmar i BCC —
          deras e-postadresser visas inte för varandra. Utskicket sparas
          automatiskt i historiken här.
        </p>
      </div>

      {/* Nytt utskick */}
      {!visaFormular ? (
        <button
          type="button"
          onClick={() => setVisaFormular(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Nytt utskick
        </button>
      ) : (
        <div className="rounded-xl border-2 border-primary/30 bg-[#f7fbf8] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Nytt utskick</p>
            <button type="button" onClick={() => setVisaFormular(false)} className="text-sm text-muted hover:text-foreground">Avbryt</button>
          </div>

          {/* Typ + ämne */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Meddelandetyp</label>
              <select value={typ} onChange={(e) => setTyp(e.target.value as UtskickTyp)} className={inputKlass}>
                {(Object.keys(UTSKICK_TYP_ETIKETTER) as UtskickTyp[]).map((t) => (
                  <option key={t} value={t}>{UTSKICK_TYP_ETIKETTER[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Skickat av</label>
              <input type="text" value={skickatAv} onChange={(e) => setSkickatAv(e.target.value)} placeholder="Namn / Styrelsen" className={inputKlass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Ämne</label>
              <input type="text" value={amne} onChange={(e) => setAmne(e.target.value)} placeholder="t.ex. Information om stambyte 2025" className={inputKlass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Meddelandetext</label>
              <textarea value={meddelande} onChange={(e) => setMeddelande(e.target.value)} rows={5} placeholder="Skriv ert meddelande här…" className={`${inputKlass} resize-y`} />
            </div>
          </div>

          {/* Mottagare */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Mottagare</p>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" checked={vallaAlla} onChange={(e) => setVallaAlla(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
              <span className="font-medium text-foreground">Alla aktiva medlemmar ({aktivaMedlemmar.length} st)</span>
            </label>

            {!vallaAlla && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-white p-2">
                {aktivaMedlemmar.length === 0 ? (
                  <p className="text-xs text-muted p-2">Inga medlemmar med e-postadress registrerade.</p>
                ) : (
                  aktivaMedlemmar.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-surface">
                      <input type="checkbox" checked={valdaIds.has(m.id)} onChange={() => toggleMedlem(m.id)} className="h-4 w-4 rounded border-border accent-primary" />
                      <span className="flex-1">{m.namn}</span>
                      <span className="text-xs text-muted">{m.lagenhetNr}</span>
                      <span className="text-xs text-muted">{m.epost}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            <p className="mt-2 text-xs text-muted">
              Valda: <strong>{valdaMedlemmar.length}</strong> mottagare
            </p>
          </div>

          {/* Knappar */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={skicka}
              disabled={!amne.trim() || !meddelande.trim() || valdaMedlemmar.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
            >
              📧 Öppna i e-postklient och spara
            </button>
            <button
              type="button"
              onClick={kopieraEposter}
              disabled={valdaMedlemmar.length === 0}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 disabled:opacity-40"
            >
              {kopiad ? "✓ Kopierade!" : "Kopiera e-postadresser"}
            </button>
          </div>
        </div>
      )}

      {/* Historik */}
      <div>
        <button
          type="button"
          onClick={() => setVisaHistorik((v) => !v)}
          className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          {visaHistorik ? "▲" : "▼"} Utskickshistorik ({state.utskick.length} st)
        </button>

        {visaHistorik && (
          state.utskick.length === 0 ? (
            <p className="text-sm text-muted">Inga utskick skickade ännu.</p>
          ) : (
            <div className="space-y-3">
              {state.utskick.map((u) => (
                <div key={u.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                          {UTSKICK_TYP_ETIKETTER[u.typ]}
                        </span>
                        <p className="font-semibold text-foreground">{u.amne}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {formatDatum(u.datum)} · {u.skickatAv} ·{" "}
                        {u.mottagarIds[0] === "alla"
                          ? `Alla medlemmar (${u.mottagarEposter.length} st)`
                          : `${u.mottagarEposter.length} mottagare`}
                      </p>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted hover:text-foreground">
                      Visa meddelandetext
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 font-sans text-sm text-foreground">
                      {u.meddelande}
                    </pre>
                    <p className="mt-2 text-xs text-muted">
                      Mottagare: {u.mottagarNamn.join(", ")}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
