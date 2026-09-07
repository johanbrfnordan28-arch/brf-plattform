"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ATGARD_TYP_ETIKETTER,
  GRUNDMALL_PLAN_ID,
  PLAN_STATE_EVENT,
  lasPlan,
  sparaGrundmall,
  sparaPlan,
  skapaUnikAtgardId,
  type AtgardTyp,
  type PlanPost,
  type UnderhallsAtgard,
} from "@/components/plan/plan-lager";
import {
  lasPrislistorState,
  PRISLISTOR_STATE_EVENT,
  type Prislista,
} from "@/components/prislistor/prislistor-lager";
import { foreslagnaKomponenter } from "@/components/underhallsplan/komponentregister";

// ── Hjälpkomponenter ─────────────────────────────────────────────────────────

function KryssIkon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
    </svg>
  );
}

function PlusIkon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
    </svg>
  );
}

// ── Åtgärdsformulär ──────────────────────────────────────────────────────────

type AtgardFormData = Omit<UnderhallsAtgard, "id">;

const tomAtgardForm = (komponent = ""): AtgardFormData => ({
  komponent,
  beskrivning: "",
  typ: "service",
  intervallAr: "",
  senastUtfortAr: "",
  nastaAr: "",
  uppskattadKostnadKr: "",
  prislistaId: "",
  notering: "",
});

function beraknaNavstAr(senastAr: string, intervallAr: string): string {
  const s = parseInt(senastAr.trim(), 10);
  const i = parseInt(intervallAr.trim(), 10);
  if (!Number.isFinite(s) || !Number.isFinite(i) || i <= 0) return "";
  return String(s + i);
}

interface AtgardFormularProps {
  initVarden: AtgardFormData;
  komponenter: string[];
  prislistor: Prislista[];
  onSpara: (data: AtgardFormData) => void;
  onAvbryt: () => void;
}

function AtgardFormular({
  initVarden,
  komponenter,
  prislistor,
  onSpara,
  onAvbryt,
}: AtgardFormularProps) {
  const [form, setForm] = useState<AtgardFormData>(initVarden);

  function updateField<K extends keyof AtgardFormData>(
    key: K,
    value: AtgardFormData[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "senastUtfortAr" || key === "intervallAr") {
        const auto = beraknaNavstAr(
          key === "senastUtfortAr" ? (value as string) : prev.senastUtfortAr,
          key === "intervallAr" ? (value as string) : prev.intervallAr,
        );
        if (auto) next.nastaAr = auto;
      }
      return next;
    });
  }

  const inputKlass =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="rounded-xl border border-primary/30 bg-[#f7fbf8] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Komponent */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Komponent
          </label>
          {komponenter.length > 0 ? (
            <select
              value={form.komponent}
              onChange={(e) => updateField("komponent", e.target.value)}
              className={inputKlass}
            >
              <option value="">Välj komponent…</option>
              {komponenter.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              <option value="__eget__">Annat (ange nedan)</option>
            </select>
          ) : (
            <input
              type="text"
              value={form.komponent}
              onChange={(e) => updateField("komponent", e.target.value)}
              placeholder="t.ex. Fasad"
              className={inputKlass}
            />
          )}
          {form.komponent === "__eget__" && (
            <input
              type="text"
              value=""
              onChange={(e) => updateField("komponent", e.target.value)}
              placeholder="Ange komponentnamn"
              className={`${inputKlass} mt-1`}
              autoFocus
            />
          )}
        </div>

        {/* Typ */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Åtgärdstyp
          </label>
          <select
            value={form.typ}
            onChange={(e) => updateField("typ", e.target.value as AtgardTyp)}
            className={inputKlass}
          >
            {(Object.keys(ATGARD_TYP_ETIKETTER) as AtgardTyp[]).map((t) => (
              <option key={t} value={t}>
                {ATGARD_TYP_ETIKETTER[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Beskrivning */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Beskrivning
          </label>
          <input
            type="text"
            value={form.beskrivning}
            onChange={(e) => updateField("beskrivning", e.target.value)}
            placeholder="t.ex. Putsreparation och ommålning fasad"
            className={inputKlass}
          />
        </div>

        {/* Intervall */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Intervall (år)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={form.intervallAr}
            onChange={(e) => updateField("intervallAr", e.target.value)}
            placeholder="t.ex. 10"
            className={inputKlass}
          />
        </div>

        {/* Senast utfört */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Senast utfört (år)
          </label>
          <input
            type="number"
            min="1900"
            max="2200"
            value={form.senastUtfortAr}
            onChange={(e) => updateField("senastUtfortAr", e.target.value)}
            placeholder="t.ex. 2018"
            className={inputKlass}
          />
        </div>

        {/* Nästa år */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Nästa planerat (år)
          </label>
          <input
            type="number"
            min="1900"
            max="2200"
            value={form.nastaAr}
            onChange={(e) => updateField("nastaAr", e.target.value)}
            placeholder="Beräknas automatiskt"
            className={inputKlass}
          />
        </div>

        {/* Uppskattad kostnad */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Uppskattad kostnad (kr)
          </label>
          <input
            type="number"
            min="0"
            value={form.uppskattadKostnadKr}
            onChange={(e) => updateField("uppskattadKostnadKr", e.target.value)}
            placeholder="t.ex. 450000"
            className={inputKlass}
          />
        </div>

        {/* Prislista */}
        {prislistor.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">
              Kopplad prislista (valfri)
            </label>
            <select
              value={form.prislistaId}
              onChange={(e) => updateField("prislistaId", e.target.value)}
              className={inputKlass}
            >
              <option value="">Ingen prislista vald</option>
              {prislistor.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.leverantorNamn}
                  {p.kategori ? ` — ${p.kategori}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notering */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted">
            Notering (valfri)
          </label>
          <input
            type="text"
            value={form.notering}
            onChange={(e) => updateField("notering", e.target.value)}
            placeholder="Ytterligare information…"
            className={inputKlass}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onSpara(form)}
          disabled={!form.komponent.trim() || form.komponent === "__eget__"}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Spara åtgärd
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

// ── Huvud-komponent ──────────────────────────────────────────────────────────

interface Props {
  planId: string;
}

export function PlanEditorModul({ planId }: Props) {
  const arGrundmall = planId === GRUNDMALL_PLAN_ID;
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<PlanPost | null>(null);
  const [planNamn, setPlanNamn] = useState("");
  const [planNotering, setPlanNotering] = useState("");
  const [egetKomponentNamn, setEgetKomponentNamn] = useState("");
  const [prislistor, setPrislistor] = useState<Prislista[]>([]);
  const [visaAtgardForm, setVisaAtgardForm] = useState(false);
  const [redigerarAtgardId, setRedigerarAtgardId] = useState<string | null>(null);
  const [bekraftaTaBortAtgard, setBekraftaTaBortAtgard] = useState<string | null>(null);
  const [sparatMsg, setSparatMsg] = useState<string | null>(null);
  const sparatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function visaSparatMsg(text: string) {
    if (sparatTimerRef.current) clearTimeout(sparatTimerRef.current);
    setSparatMsg(text);
    sparatTimerRef.current = setTimeout(() => setSparatMsg(null), 2500);
  }

  function laddaPlan() {
    const laddad = lasPlan(planId);
    if (laddad) {
      setPlan(laddad);
      setPlanNamn(laddad.namn);
      setPlanNotering(laddad.notering);
    }
  }

  useEffect(() => {
    laddaPlan();
    setPrislistor(lasPrislistorState().listor);
    setHydrated(true);

    const planHandler = () => laddaPlan();
    const prisHandler = () => setPrislistor(lasPrislistorState().listor);
    window.addEventListener(PLAN_STATE_EVENT, planHandler);
    window.addEventListener(PRISLISTOR_STATE_EVENT, prisHandler);
    return () => {
      window.removeEventListener(PLAN_STATE_EVENT, planHandler);
      window.removeEventListener(PRISLISTOR_STATE_EVENT, prisHandler);
    };
  }, [planId]);

  const sparaMetadata = useCallback(() => {
    if (!plan) return;
    const uppdaterad: PlanPost = {
      ...plan,
      namn: planNamn.trim() || plan.namn,
      notering: planNotering,
    };
    if (arGrundmall) {
      sparaGrundmall(uppdaterad);
    } else {
      sparaPlan(uppdaterad);
    }
    setPlan(uppdaterad);
    visaSparatMsg("Sparat");
  }, [plan, planNamn, planNotering, arGrundmall]);

  function sparaKomponenter(nyaKomponenter: string[]) {
    if (!plan) return;
    const uppdaterad: PlanPost = { ...plan, komponenter: nyaKomponenter };
    if (arGrundmall) sparaGrundmall(uppdaterad);
    else sparaPlan(uppdaterad);
    setPlan(uppdaterad);
    visaSparatMsg("Sparat");
  }

  function laggTillKomponent(namn: string) {
    if (!plan || !namn.trim() || plan.komponenter.includes(namn.trim())) return;
    sparaKomponenter([...plan.komponenter, namn.trim()]);
  }

  function taBortKomponent(namn: string) {
    if (!plan) return;
    sparaKomponenter(plan.komponenter.filter((k) => k !== namn));
  }

  function sparaAtgarder(nyaAtgarder: UnderhallsAtgard[]) {
    if (!plan) return;
    const uppdaterad: PlanPost = { ...plan, atgarder: nyaAtgarder };
    if (arGrundmall) sparaGrundmall(uppdaterad);
    else sparaPlan(uppdaterad);
    setPlan(uppdaterad);
    visaSparatMsg("Sparat");
  }

  function laggTillAtgard(data: Omit<UnderhallsAtgard, "id">) {
    if (!plan) return;
    const ny: UnderhallsAtgard = { ...data, id: skapaUnikAtgardId() };
    sparaAtgarder([...plan.atgarder, ny]);
    setVisaAtgardForm(false);
  }

  function uppdateraAtgard(id: string, data: Omit<UnderhallsAtgard, "id">) {
    if (!plan) return;
    sparaAtgarder(
      plan.atgarder.map((a) => (a.id === id ? { ...data, id } : a)),
    );
    setRedigerarAtgardId(null);
  }

  function taBortAtgard(id: string) {
    if (!plan) return;
    sparaAtgarder(plan.atgarder.filter((a) => a.id !== id));
    setBekraftaTaBortAtgard(null);
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-xl bg-border/40" />
        <div className="h-40 rounded-xl bg-border/40" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-xl border border-border p-8 text-center">
        <p className="text-muted">Planen hittades inte.</p>
        <a
          href="/forening/plan"
          className="mt-3 inline-block text-sm font-medium text-primary-dark underline"
        >
          Tillbaka till planer
        </a>
      </div>
    );
  }

  const ejAktiveForeslag = foreslagnaKomponenter.filter(
    (k) => !plan.komponenter.includes(k),
  );

  return (
    <div className="space-y-8">
      {/* Metadata */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {arGrundmall ? "Grundmallens namn och beskrivning" : "Planens namn och beskrivning"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {arGrundmall ? "Grundmallens namn" : "Plannamn"}
            </label>
            <input
              type="text"
              value={planNamn}
              onChange={(e) => setPlanNamn(e.target.value)}
              onBlur={sparaMetadata}
              placeholder={arGrundmall ? "t.ex. Grundmall" : "t.ex. Underhållsplan 2025–2075"}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Beskrivning (valfri)
            </label>
            <textarea
              value={planNotering}
              onChange={(e) => setPlanNotering(e.target.value)}
              onBlur={sparaMetadata}
              placeholder="Kortfattad beskrivning av planen…"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {sparatMsg && (
            <p className="text-sm font-medium text-primary-dark">{sparatMsg}</p>
          )}
        </div>
      </section>

      {/* Komponenter */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Komponenter</h2>
          <span className="rounded-full bg-[#e2f0e6] px-3 py-0.5 text-sm font-medium text-primary-dark">
            {plan.komponenter.length} st
          </span>
        </div>

        {plan.komponenter.length === 0 ? (
          <p className="mb-4 text-sm text-muted">
            Inga komponenter tillagda ännu.
          </p>
        ) : (
          <ul className="mb-5 flex flex-wrap gap-2">
            {plan.komponenter.map((namn) => (
              <li key={namn}>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                  {namn}
                  <button
                    type="button"
                    onClick={() => taBortKomponent(namn)}
                    aria-label={`Ta bort ${namn}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <KryssIkon className="h-3 w-3" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Standardkomponenter */}
        {ejAktiveForeslag.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Standardkomponenter
            </p>
            <div className="flex flex-wrap gap-2">
              {ejAktiveForeslag.map((namn) => (
                <button
                  key={namn}
                  type="button"
                  onClick={() => laggTillKomponent(namn)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-1.5 text-sm font-medium text-primary-dark transition-colors hover:bg-[#daeee1]"
                >
                  <PlusIkon className="h-3.5 w-3.5" />
                  {namn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Eget namn */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Eget komponentnamn
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={egetKomponentNamn}
              onChange={(e) => setEgetKomponentNamn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  laggTillKomponent(egetKomponentNamn);
                  setEgetKomponentNamn("");
                }
              }}
              placeholder="t.ex. Pool, Lekplats, Flaggstång…"
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => {
                laggTillKomponent(egetKomponentNamn);
                setEgetKomponentNamn("");
              }}
              disabled={!egetKomponentNamn.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
            >
              Lägg till
            </button>
          </div>
        </div>
      </section>

      {/* Underhållsåtgärder */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Underhållsåtgärder
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Planerade åtgärder — byte, service, besiktning m.m.
            </p>
          </div>
          <span className="rounded-full bg-[#e2f0e6] px-3 py-0.5 text-sm font-medium text-primary-dark">
            {plan.atgarder.length} st
          </span>
        </div>

        {plan.atgarder.length === 0 && !visaAtgardForm && (
          <p className="mb-4 text-sm text-muted">
            Inga åtgärder tillagda ännu.
          </p>
        )}

        <div className="space-y-3">
          {plan.atgarder.map((atgard) =>
            redigerarAtgardId === atgard.id ? (
              <AtgardFormular
                key={atgard.id}
                initVarden={{ ...atgard }}
                komponenter={plan.komponenter}
                prislistor={prislistor}
                onSpara={(data) => uppdateraAtgard(atgard.id, data)}
                onAvbryt={() => setRedigerarAtgardId(null)}
              />
            ) : (
              <div
                key={atgard.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-border/50 px-2 py-0.5 text-xs font-medium text-muted">
                      {ATGARD_TYP_ETIKETTER[atgard.typ]}
                    </span>
                    {atgard.komponent && (
                      <span className="text-sm font-semibold text-foreground">
                        {atgard.komponent}
                      </span>
                    )}
                    {atgard.beskrivning && (
                      <span className="text-sm text-muted">
                        — {atgard.beskrivning}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                    {atgard.intervallAr && (
                      <span>Vart {atgard.intervallAr} år</span>
                    )}
                    {atgard.nastaAr && (
                      <span>Nästa: {atgard.nastaAr}</span>
                    )}
                    {atgard.uppskattadKostnadKr && (
                      <span>
                        {parseInt(atgard.uppskattadKostnadKr).toLocaleString(
                          "sv-SE",
                        )}{" "}
                        kr
                      </span>
                    )}
                    {atgard.prislistaId && (
                      <span className="text-primary-dark">
                        {prislistor.find((p) => p.id === atgard.prislistaId)
                          ?.leverantorNamn ?? "Prislista kopplad"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRedigerarAtgardId(atgard.id);
                      setVisaAtgardForm(false);
                    }}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Redigera
                  </button>
                  {bekraftaTaBortAtgard === atgard.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => taBortAtgard(atgard.id)}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Ta bort
                      </button>
                      <button
                        type="button"
                        onClick={() => setBekraftaTaBortAtgard(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBekraftaTaBortAtgard(atgard.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ),
          )}

          {visaAtgardForm && !redigerarAtgardId && (
            <AtgardFormular
              initVarden={tomAtgardForm()}
              komponenter={plan.komponenter}
              prislistor={prislistor}
              onSpara={laggTillAtgard}
              onAvbryt={() => setVisaAtgardForm(false)}
            />
          )}
        </div>

        {!visaAtgardForm && !redigerarAtgardId && (
          <button
            type="button"
            onClick={() => setVisaAtgardForm(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary-dark"
          >
            <PlusIkon className="h-4 w-4" />
            Lägg till åtgärd
          </button>
        )}
      </section>

      {/* Navigering */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/forening/plan"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          ← Tillbaka till planer
        </a>
        <a
          href="/forening/entreprenorer"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary-dark"
        >
          Entreprenörer →
        </a>
      </div>
    </div>
  );
}
