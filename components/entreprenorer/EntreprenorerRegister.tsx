"use client";

import { useEffect, useMemo, useState } from "react";
import {
  demoEntreprenorer,
  entreprenorKategorier,
  registreringsFalt,
  skapaEntreprenorId,
  statusEtiketter,
  tomForm,
  type Entreprenor,
  type EntreprenorForm,
} from "@/components/entreprenorer/entreprenorer";
import {
  ENTREPR_EVENT,
  lasEntreprenorerState,
  sparaEntreprenorerState,
} from "@/components/entreprenorer/entreprenorer-lager";
import { AnbudsforfrAganPanel } from "@/components/entreprenorer/AnbudsforfrAganPanel";
import { EntreprenorVarningar } from "@/components/entreprenorer/EntreprenorVarningar";
import { laggTillHusEntreprenor } from "@/components/entreprenorer/hus-entreprenorer-lager";

type EntreprenorerRegisterProps = {
  /** Registrering och godkännande — publik sida för företag i demo. */
  kanRegistrera?: boolean;
  /** Redigera föreningens lista: lägg till, ta bort, skicka anbudsförfrågan. */
  kanRedigera?: boolean;
  /** Visa referens-/kvalitetsvarningar (stäng av om sidan redan visar dem). */
  visaVarningar?: boolean;
  /** Rubrik ovanför sökfältet. */
  sokRubrik?: string;
  /** Kort hjälptext under rubriken. */
  sokIngress?: string;
  /** Tillåt "Lägg till i er lista" (kopierar till hus-entreprenörlistan). */
  kanLaggTillIHusLista?: boolean;
};

export function EntreprenorerRegister({
  kanRegistrera = false,
  kanRedigera = false,
  visaVarningar = true,
  sokRubrik = "Sök entreprenör för ert projekt",
  sokIngress,
  kanLaggTillIHusLista = false,
}: EntreprenorerRegisterProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [lista, setLista] = useState<Entreprenor[]>(demoEntreprenorer);
  const [hydrated, setHydrated] = useState(false);
  const [sok, setSok] = useState("");
  const [filterKategori, setFilterKategori] = useState("alla");
  const [form, setForm] = useState<EntreprenorForm>(tomForm());
  const [behörigBekräftad, setBehörigBekräftad] = useState(kanRegistrera);
  const [visarFormular, setVisarFormular] = useState(kanRegistrera);
  const [betygVal, setBetygVal] = useState<Record<string, number>>({});
  const [tillagdFeedbackId, setTillagdFeedbackId] = useState<string | null>(
    null,
  );

  // Redigera-läge
  const [valdaIds, setValdaIds] = useState<Set<string>>(new Set());
  const [visarLaggTillForm, setVisarLaggTillForm] = useState(false);
  const [bekraftaTaBortId, setBekraftaTaBortId] = useState<string | null>(null);
  const [visarAnbudsPanel, setVisarAnbudsPanel] = useState(false);

  // ── Ladda / spara ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!kanRedigera) {
      setHydrated(true);
      return;
    }
    const state = lasEntreprenorerState();
    setLista(state.entreprenorer);
    setHydrated(true);

    const hantera = () => {
      const ny = lasEntreprenorerState();
      setLista(ny.entreprenorer);
    };
    window.addEventListener(ENTREPR_EVENT, hantera);
    return () => window.removeEventListener(ENTREPR_EVENT, hantera);
  }, [kanRedigera]);

  function sparaLista(nyLista: Entreprenor[]) {
    setLista(nyLista);
    if (kanRedigera) {
      sparaEntreprenorerState({
        version: 1,
        entreprenorer: nyLista,
        anpassad: true,
      });
    }
  }

  // ── Filtrering ─────────────────────────────────────────────────────────────
  const synliga = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return lista.filter((ent) => {
      if (ent.status !== "godkand") return false;
      if (filterKategori !== "alla" && !ent.kategorier.includes(filterKategori))
        return false;
      if (!q) return true;
      return (
        ent.foretagsnamn.toLowerCase().includes(q) ||
        ent.kategorier.some((k) => k.toLowerCase().includes(q)) ||
        ent.kontaktperson.toLowerCase().includes(q)
      );
    });
  }, [lista, sok, filterKategori]);

  const vantarGodkannande = lista.filter(
    (e) => e.status === "vantar_godkannande",
  );
  const valdaEntreprenorer = synliga.filter((e) => valdaIds.has(e.id));

  // ── Registrering (publik) ──────────────────────────────────────────────────
  function uppdateraForm<K extends keyof EntreprenorForm>(
    key: K,
    value: EntreprenorForm[K],
  ) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function toggleKategoriForm(kategori: string) {
    setForm((c) => ({
      ...c,
      kategorier: c.kategorier.includes(kategori)
        ? c.kategorier.filter((k) => k !== kategori)
        : [...c.kategorier, kategori],
    }));
  }

  function skickaRegistrering(event: React.FormEvent) {
    event.preventDefault();
    if (!behörigBekräftad) return;
    if (form.kategorier.length === 0) return;

    const ny: Entreprenor = {
      id: skapaEntreprenorId(),
      ...form,
      status: kanRedigera ? "godkand" : "vantar_godkannande",
      betyg: 0,
      antalBetyg: 0,
      registreradAv: kanRedigera
        ? "Föreningen (manuellt tillagd)"
        : "Företag (egen registrering, demo)",
      godkandDatum: kanRedigera
        ? new Date().toLocaleDateString("sv-SE")
        : undefined,
    };
    sparaLista([...lista, ny]);
    setForm(tomForm());
    setVisarFormular(false);
    setVisarLaggTillForm(false);
  }

  // ── Moderation (globalt) ───────────────────────────────────────────────────
  function godkann(id: string) {
    sparaLista(
      lista.map((ent) =>
        ent.id === id
          ? { ...ent, status: "godkand" as const, godkandDatum: new Date().toLocaleDateString("sv-SE") }
          : ent,
      ),
    );
  }

  function startaUtredning(id: string) {
    sparaLista(
      lista.map((ent) =>
        ent.id === id ? { ...ent, status: "under_utredning" as const } : ent,
      ),
    );
  }

  // ── Ta bort (redigera-läge) ────────────────────────────────────────────────
  function taBortEntreprenor(id: string) {
    sparaLista(lista.filter((e) => e.id !== id));
    setBekraftaTaBortId(null);
    setValdaIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // ── Checkboxar / urval ────────────────────────────────────────────────────
  function toggleVald(id: string) {
    setValdaIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function taBortUrval(id: string) {
    setValdaIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function laggTillIHusLista(ent: Entreprenor) {
    laggTillHusEntreprenor({
      namn: ent.foretagsnamn,
      telefon: ent.telefon,
      epost: ent.epost,
      kategori: ent.kategorier[0] ?? "",
      anteckning: ent.referens.trim()
        ? `Från rekommenderade. ${ent.referens.trim()}`
        : "Tillagd från rekommenderade entreprenörer.",
    });
    setTillagdFeedbackId(ent.id);
    window.setTimeout(() => {
      setTillagdFeedbackId((id) => (id === ent.id ? null : id));
    }, 2500);
  }

  // ── Betyg ──────────────────────────────────────────────────────────────────
  function sättBetyg(id: string, stjärnor: number) {
    setBetygVal((c) => ({ ...c, [id]: stjärnor }));
    sparaLista(
      lista.map((ent) => {
        if (ent.id !== id) return ent;
        const nyttAntal = ent.antalBetyg + 1;
        const nyttSnitt = (ent.betyg * ent.antalBetyg + stjärnor) / nyttAntal;
        return { ...ent, antalBetyg: nyttAntal, betyg: Math.round(nyttSnitt * 10) / 10 };
      }),
    );
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-16 rounded-xl bg-border/40" />
        <div className="h-32 rounded-xl bg-border/40" />
      </div>
    );
  }

  // ── Formulär för publik registrering ──────────────────────────────────────
  const registreringsFormular = (
    <form onSubmit={skickaRegistrering} className="mt-6 space-y-4">
      <p className="text-sm font-semibold text-primary-dark">
        {kanRedigera ? "Kontaktuppgifter" : "Företagsuppgifter"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {registreringsFalt.map((fält) => (
          <label key={fält.id} className="block">
            <span className="text-sm font-medium text-foreground">
              {fält.label}
              {fält.obligatorisk && <span className="text-red-600"> *</span>}
            </span>
            <input
              type={fält.typ ?? "text"}
              required={fält.obligatorisk}
              value={form[fält.id]}
              onChange={(e) => uppdateraForm(fält.id, e.target.value)}
              placeholder={fält.placeholder}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Kategorier (minst en) *
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {entreprenorKategorier.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleKategoriForm(k)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                form.kategorier.includes(k)
                  ? "border-primary bg-[#e2f0e6] text-primary-dark"
                  : "border-border bg-white text-foreground"
              }`}
            >
              {form.kategorier.includes(k) ? "✓ " : ""}
              {k}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!behörigBekräftad || form.kategorier.length === 0}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {kanRedigera ? "Lägg till" : "Skicka registrering"}
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(tomForm());
            setVisarFormular(false);
            setVisarLaggTillForm(false);
          }}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-muted"
        >
          Avbryt
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-8">
      {/* ── Publik registrering ─────────────────────────────────────────── */}
      {kanRegistrera && (
        <section
          id="registrera"
          className="scroll-mt-24 rounded-2xl border-2 border-primary bg-[#eef6f0] p-5 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Registrera ditt företag
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground">
            Fyll i uppgifterna nedan. I demoversionen granskas ansökan innan ni
            syns i listan.
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={behörigBekräftad}
              onChange={(e) => setBehörigBekräftad(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm text-foreground">
              Jag bekräftar att jag är behörig att registrera företaget och att
              uppgifterna är korrekta.
            </span>
          </label>
          {!visarFormular ? (
            <button
              type="button"
              disabled={!behörigBekräftad}
              onClick={() => setVisarFormular(true)}
              className="mt-5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Visa formulär
            </button>
          ) : (
            registreringsFormular
          )}
        </section>
      )}

      {/* ── Info / kvalitet ─────────────────────────────────────────────── */}
      {visaVarningar && <EntreprenorVarningar />}

      {/* ── Sök + lista ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {sokRubrik}
            </h3>
            {sokIngress ? (
              <p className="mt-0.5 text-sm text-muted">{sokIngress}</p>
            ) : kanRedigera ? (
              <p className="mt-0.5 text-sm text-muted">
                Markera företag och klicka &quot;Skicka anbudsförfrågan&quot; för
                att bjuda in till anbud.
              </p>
            ) : null}
          </div>
          {kanRedigera && (
            <button
              type="button"
              onClick={() => {
                setForm(tomForm());
                setBehörigBekräftad(true);
                setVisarLaggTillForm((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
              </svg>
              Lägg till entreprenör
            </button>
          )}
        </div>

        {/* Lägg till-formulär (redigera-läge) */}
        {kanRedigera && visarLaggTillForm && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-[#f7fbf8] p-4">
            {registreringsFormular}
          </div>
        )}

        {/* Sök + filter */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="search"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Sök företag, kategori eller kontakt…"
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="alla">Alla kategorier</option>
            {entreprenorKategorier.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Anbuds-bar */}
        {kanRedigera && valdaIds.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-[#e2f0e6] px-4 py-3">
            <p className="text-sm font-medium text-primary-dark">
              {valdaIds.size} {valdaIds.size === 1 ? "företag" : "företag"} valt
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setVisarAnbudsPanel((v) => !v);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                {visarAnbudsPanel ? "Dölj panel" : "Skicka anbudsförfrågan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValdaIds(new Set());
                  setVisarAnbudsPanel(false);
                }}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
              >
                Avmarkera alla
              </button>
            </div>
          </div>
        )}

        {/* Anbudsförfrågan-panel */}
        {kanRedigera && visarAnbudsPanel && valdaEntreprenorer.length > 0 && (
          <div className="mt-4">
            <AnbudsforfrAganPanel
              valda={valdaEntreprenorer}
              onStang={() => setVisarAnbudsPanel(false)}
            />
          </div>
        )}

        {/* Entreprenör-lista */}
        {synliga.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Inga träffar med valt filter.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {synliga.map((ent) => (
              <li
                key={ent.id}
                className={`rounded-xl border bg-white p-4 transition-colors sm:p-5 ${
                  valdaIds.has(ent.id)
                    ? "border-primary/50 ring-1 ring-primary/30"
                    : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {/* Checkbox */}
                    {kanRedigera && (
                      <input
                        type="checkbox"
                        checked={valdaIds.has(ent.id)}
                        onChange={() => toggleVald(ent.id)}
                        className="mt-1.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                        aria-label={`Välj ${ent.foretagsnamn}`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-foreground">
                        {ent.foretagsnamn}
                      </h4>
                      <p className="mt-1 text-sm text-muted">
                        {ent.kategorier.join(" · ")}
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {ent.kontaktperson}
                        {ent.epost && (
                          <>
                            {" · "}
                            <a
                              href={`mailto:${ent.epost}`}
                              className="text-primary-dark hover:underline"
                            >
                              {ent.epost}
                            </a>
                          </>
                        )}
                        {ent.telefon && ` · ${ent.telefon}`}
                      </p>
                      {ent.referens.trim() && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          <span className="font-medium text-foreground">
                            Referens:
                          </span>{" "}
                          {ent.referens}
                        </p>
                      )}
                      {ent.godkandDatum && (
                        <p className="mt-1 text-xs text-muted">
                          Godkänd {ent.godkandDatum}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Betyg */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {ent.betyg > 0 ? `${ent.betyg} / 5` : "—"}
                      </p>
                      <p className="text-xs text-muted">{ent.antalBetyg} omdömen</p>
                      <div className="mt-1 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => sättBetyg(ent.id, n)}
                            className={`text-lg ${
                              (betygVal[ent.id] ?? 0) >= n
                                ? "text-amber-500"
                                : "text-border hover:text-amber-400"
                            }`}
                            aria-label={`Betyg ${n}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ta bort (redigera-läge) */}
                    {kanRedigera && (
                      bekraftaTaBortId === ent.id ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => taBortEntreprenor(ent.id)}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Ta bort
                          </button>
                          <button
                            type="button"
                            onClick={() => setBekraftaTaBortId(null)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted"
                          >
                            Avbryt
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBekraftaTaBortId(ent.id)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                        >
                          Ta bort
                        </button>
                      )
                    )}

                    {kanLaggTillIHusLista && (
                      <button
                        type="button"
                        onClick={() => laggTillIHusLista(ent)}
                        className="rounded-lg border border-primary bg-[#e2f0e6] px-2.5 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#d5e9db]"
                      >
                        {tillagdFeedbackId === ent.id
                          ? "Tillagd i er lista"
                          : "Lägg till i er lista"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Väntar godkännande ────────────────────────────────────────────── */}
      {kanRegistrera && vantarGodkannande.length > 0 && (
        <section className="rounded-xl border border-dashed border-primary/40 bg-[#eef6f0]/50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-primary-dark">
            Väntar godkännande ({vantarGodkannande.length})
          </p>
          <ul className="mt-4 space-y-3">
            {vantarGodkannande.map((ent) => (
              <li
                key={ent.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{ent.foretagsnamn}</p>
                  <p className="text-xs text-muted">
                    {statusEtiketter[ent.status]} · {ent.registreradAv}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => godkann(ent.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Godkänn (demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => startaUtredning(ent.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                  >
                    Utred
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Misskötsel ────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
        <p className="font-semibold text-foreground">Misskötsel och borttagning</p>
        <p className="mt-2 leading-relaxed">
          Företag som missköter sig kan tas bort från det centrala registret.
          Innan vi agerar vill vi höra båda sidor — styrelsens synpunkter och
          entreprenörens — så att beslutet blir rättvist. I er egen lista tar ni
          själva bort poster som inte längre ska rekommenderas.
        </p>
      </section>
    </div>
  );
}
